import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured =
  url &&
  key &&
  url !== 'https://tu-proyecto.supabase.co' &&
  !key.includes('tu-anon') &&
  !key.includes('tu-anon-key');

export const supabase = isSupabaseConfigured ? createClient(url, key) : null;

// =============================================================================
// SINCRONIZACIÓN: la web usa las MISMAS tablas que las apps Flutter
//   • Cartera        → public.fv_clients
//   • Solicitudes    → public.fv_credit_applications
//   • Trazabilidad   → public.sync_log (puente E2E hacia la app cliente)
// Mismo proyecto Supabase: uomaqpphyouzbnestbba.supabase.co
// =============================================================================

/** KPIs del dashboard calculados desde las tablas unificadas. */
export async function fetchDashboardKpis() {
  if (!supabase) return getMockKpis();
  try {
    const [appsRes, clientsRes] = await Promise.all([
      supabase.from('fv_credit_applications').select('status, amount, submitted_at'),
      supabase.from('fv_clients').select('id, days_overdue'),
    ]);
    const apps = appsRes.data ?? [];
    const clients = clientsRes.data ?? [];
    const aprobadas = apps.filter((a) =>
      ['aprobado', 'desembolsado'].includes((a.status || '').toLowerCase())
    ).length;
    return {
      visitas_pendientes: clients.filter((c) => (c.days_overdue ?? 0) > 0).length,
      visitas_total_cartera: clients.length,
      gestionadas_hoy: apps.length,
      monto_cartera: apps.reduce((s, a) => s + Number(a.amount || 0), 0),
      solicitudes_aprobadas: aprobadas,
      solicitudes_mes: apps.length,
    };
  } catch (e) {
    console.warn('[Supabase]', e.message);
    return getMockKpis();
  }
}

/** Cartera de clientes (tabla clients, compartida con app FV). */
export async function fetchCartera(limit = 100) {
  if (!supabase) return getMockCartera();
  const { data, error } = await supabase
    .from('fv_clients')
    .select('*')
    .order('name', { ascending: true })
    .limit(limit);
  if (error) {
    console.warn('[Supabase]', error.message);
    return getMockCartera();
  }
  return data ?? [];
}

/** Solicitudes de crédito (tabla credit_applications, originadas en la app FV). */
export async function fetchSolicitudes(limit = 100) {
  if (!supabase) return getMockSolicitudes();
  const { data, error } = await supabase
    .from('fv_credit_applications')
    .select('*')
    .order('submitted_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.warn('[Supabase]', error.message);
    return getMockSolicitudes();
  }
  return data ?? [];
}

/**
 * Aprueba o rechaza una solicitud. Al aprobar, el trigger
 * `trg_fv_publicar_aprobacion` publica el evento en `sync_outbox` y la app
 * cliente refleja el crédito (integración End-to-End).
 */
export async function actualizarEstadoSolicitud(id, estado) {
  if (!supabase) return { ok: false, demo: true };
  const { error } = await supabase
    .from('fv_credit_applications')
    .update({ status: estado, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Trazabilidad del puente E2E (eventos publicados hacia la app cliente). */
export async function fetchSyncLog(limit = 8) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('sync_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.warn('[Supabase]', error.message);
    return [];
  }
  return data ?? [];
}

// ─── MOCKS (sólo si no hay .env configurado) ─────────────────────────────────

function getMockKpis() {
  return {
    visitas_pendientes: 2,
    visitas_total_cartera: 4,
    gestionadas_hoy: 4,
    monto_cartera: 31700,
    solicitudes_aprobadas: 1,
    solicitudes_mes: 4,
  };
}

function getMockCartera() {
  return [
    {
      id: 'c1',
      name: 'María Elena Vásquez',
      dni: '1712345678',
      business_name: 'Panadería La Espiga',
      credit_score: 720,
      total_debt: 3200,
      days_overdue: 0,
      status: 'active',
    },
    {
      id: 'c2',
      name: 'Patricia Gómez',
      dni: '1799887766',
      business_name: 'Farmacia Salud',
      credit_score: 590,
      total_debt: 12000,
      days_overdue: 45,
      status: 'active',
    },
  ];
}

function getMockSolicitudes() {
  return [
    {
      id: 'sol-001',
      client_name: 'María Elena Vásquez',
      client_dni: '1712345678',
      amount: 8500,
      term_months: 18,
      status: 'enviado',
    },
  ];
}
