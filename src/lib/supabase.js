import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured =
  url &&
  key &&
  url !== 'https://tu-proyecto.supabase.co' &&
  !key.includes('tu-anon');

export const supabase = isSupabaseConfigured ? createClient(url, key) : null;

export async function fetchDashboardKpis() {
  if (!supabase) return getEmptyKpis();
  try {
    const { data, error } = await supabase.from('v_dashboard_kpis').select('*').maybeSingle();
    if (error) throw error;
    return data ?? getEmptyKpis();
  } catch (e) {
    console.warn('[Supabase]', e.message);
    return getEmptyKpis();
  }
}

export async function fetchCartera(limit = 100) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('fv_clients')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.warn('[Supabase]', error.message);
    return [];
  }
  return (data ?? []).map(mapCliente);
}

export async function fetchSolicitudes(limit = 100) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('v_solicitudes_completas')
    .select('*')
    .order('submitted_at', { ascending: false })
    .limit(limit);
  if (error) {
    // Fallback a la tabla directa si la vista aún no existe en la BD
    const { data: raw, error: err2 } = await supabase
      .from('solicitudes_credito')
      .select('*')
      .order('submitted_at', { ascending: false })
      .limit(limit);
    if (err2) { console.warn('[Supabase]', err2.message); return []; }
    return (raw ?? []).map((r) => mapSolicitud(r));
  }
  return (data ?? []).map((r) => mapSolicitud(r));
}

export async function actualizarEstadoSolicitud(id, estado) {
  if (!supabase) return { ok: false, error: 'Sin conexión a Supabase.' };
  const dbEstado = estado === 'aprobado' ? 'desembolsado' : estado;
  const { error } = await supabase
    .from('solicitudes_credito')
    .update({ estado: dbEstado, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function fetchAdvisors() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('profiles')
    .select('id, nombres, apellidos, email')
    .eq('rol', 'asesor');
  if (error) {
    console.warn('[Supabase]', error.message);
    return [];
  }
  return (data ?? []).map((row) => ({
    ...row,
    nombre: `${row.nombres || ''} ${row.apellidos || ''}`.trim() || row.email,
  }));
}

export async function asignarAsesorASolicitud(solicitudId, asesorId) {
  if (!supabase) return { ok: false, error: 'Sin conexión a Supabase.' };
  const { error } = await supabase
    .from('solicitudes_credito')
    .update({ 
      asesor_id: asesorId, 
      estado: 'en_evaluacion', 
      updated_at: new Date().toISOString() 
    })
    .eq('id', solicitudId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function fetchExpedienteSolicitud(solicitud) {
  if (!supabase || !solicitud) return emptyExpediente();
  const filters = [
    solicitud.id ? `solicitud_id.eq.${solicitud.id}` : '',
    solicitud.client_id ? `client_id.eq.${solicitud.client_id}` : '',
    solicitud.client_dni ? `dni.eq.${solicitud.client_dni}` : '',
  ].filter(Boolean).join(',');

  try {
    const [fichaRes, docsRes, solRes] = await Promise.all([
      supabase
        .from('fv_fichas_campo')
        .select('*')
        .eq('solicitud_id', solicitud.id)
        .maybeSingle(),
      filters
        ? supabase
            .from('fv_documentos')
            .select('*')
            .or(filters)
            .order('capturado_at', { ascending: false })
        : Promise.resolve({ data: [], error: null }),
      supabase
        .from('v_solicitudes_completas')
        .select('*')
        .eq('id', solicitud.id)
        .maybeSingle(),
    ]);
    if (fichaRes.error) throw fichaRes.error;
    if (docsRes.error) throw docsRes.error;
    return {
      ficha: fichaRes.data ? mapEvaluacion({ ...fichaRes.data, client: null }) : null,
      documentos: (docsRes.data ?? []).map(mapDocumento),
      solicitud: solRes.data ?? solicitud,
    };
  } catch (e) {
    console.warn('[Supabase expediente]', e.message);
    return emptyExpediente(e.message);
  }
}

export async function fetchEvaluaciones(limit = 100) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('fv_fichas_campo')
    .select(`*, client:fv_clients(nombres, apellidos, dni, nombre_negocio, sector_negocio)`)
    .order('updated_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.warn('[Supabase]', error.message);
    return [];
  }
  return (data ?? []).map((r) => mapEvaluacion(r));
}

function mapDocumento(row) {
  return {
    ...row,
    tipo: row.tipo_documento || row.doc_type || 'Documento',
    url: row.file_url || '',
    estado: row.estado || row.status || 'pendiente',
    es_nitido: row.es_nitido ?? row.is_sharp ?? false,
    sharpness_score: row.sharpness_score || 0,
    capturado_at: row.capturado_at || row.captured_at,
  };
}

function emptyExpediente(error = null) {
  return { ficha: null, documentos: [], error };
}

export async function fetchCobranza(limit = 100) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('fv_cartera_diaria')
    .select('*')
    .order('dias_mora', { ascending: false })
    .limit(limit);
  if (error) {
    console.warn('[Supabase]', error.message);
    return [];
  }
  return (data ?? []).map((r) => mapCobranza(r));
}

export async function fetchReportesData() {
  if (!supabase) return emptyReportes();
  try {
    const [kpisRes, carteraRes, solicitudesRes, visitasRes, buroRes] = await Promise.all([
      supabase.from('v_dashboard_kpis').select('*').maybeSingle(),
      supabase.from('fv_clients').select('estado, sector_negocio, deuda_total, dias_mora'),
      supabase.from('solicitudes_credito').select('estado, monto, submitted_at'),
      supabase.from('fv_visitas').select('estado_visita, fecha_visita'),
      supabase.from('fv_buro').select('en_blacklist, calificacion_sbs, dias_mora'),
    ]);
    const firstError = [kpisRes, carteraRes, solicitudesRes, visitasRes, buroRes].find((res) => res.error)?.error;
    if (firstError) throw firstError;
    return buildReportesData({
      kpis: kpisRes.data ?? getEmptyKpis(),
      cartera: carteraRes.data ?? [],
      solicitudes: solicitudesRes.data ?? [],
      visitas: visitasRes.data ?? [],
      buro: buroRes.data ?? [],
    });
  } catch (e) {
    console.warn('[Supabase]', e.message);
    return emptyReportes();
  }
}

function buildUser(email, profile, authId) {
  const name = `${profile.nombres} ${profile.apellidos}`.trim();
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
  return {
    id: authId || email,
    email,
    name,
    role: profile.rol === 'supervisor' ? 'Supervisor' : 'Asesor',
    rol: profile.rol,
    perfil: profile.perfil,
    initials: initials || 'FV',
  };
}

async function fetchAdvisorProfileByEmail(email) {
  const clean = email.trim().toLowerCase();
  if (!clean || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('nombres, apellidos, rol, activo, email')
      .ilike('email', clean)
      .in('rol', ['asesor', 'supervisor', 'admin'])
      .maybeSingle();
    if (!error && data && data.activo !== false) {
      return {
        nombres: data.nombres || '',
        apellidos: data.apellidos || '',
        rol: data.rol || 'asesor',
        perfil: data.rol === 'supervisor' ? 'Supervisor de Crédito' : 'Oficial de Crédito',
      };
    }
  } catch (e) {
    console.warn('[Supabase] perfil asesor:', e.message);
  }

  return null;
}

function profileFromAuthUser(user) {
  const meta = user?.user_metadata || {};
  const rol = meta.rol || 'asesor';
  const nombre = (meta.nombre || user?.email?.split('@')[0] || 'Usuario').trim();
  const parts = nombre.split(/\s+/);
  return {
    nombres: parts[0] || nombre,
    apellidos: parts.slice(1).join(' ') || '',
    rol,
    perfil: rol === 'supervisor' ? 'Supervisor de Credito' : 'Oficial de Credito',
  };
}

export async function getSessionUser() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  const session = data?.session;
  if (!session?.user?.email) return null;
  const profile = await fetchAdvisorProfileByEmail(session.user.email);
  return buildUser(session.user.email, profile ?? profileFromAuthUser(session.user), session.user.id);
}

export function subscribeAuthChanges(callback) {
  if (!supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
    if (!session?.user?.email) {
      callback(null);
      return;
    }
    const profile = await fetchAdvisorProfileByEmail(session.user.email);
    callback(buildUser(session.user.email, profile ?? profileFromAuthUser(session.user), session.user.id));
  });
  return () => data.subscription.unsubscribe();
}

export async function signInAdvisor(email, password) {
  if (!supabase) {
    return { ok: false, error: 'Supabase no está configurado. Verifica las variables de entorno.' };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) {
    const msg = error.message.toLowerCase().includes('invalid')
      ? 'Correo o contraseña incorrectos.'
      : error.message;
    return { ok: false, error: msg };
  }

  const profile = await fetchAdvisorProfileByEmail(data.user.email);
  return { ok: true, user: buildUser(data.user.email, profile ?? profileFromAuthUser(data.user), data.user.id) };
}

export async function signOutAdvisor() {
  if (supabase) await supabase.auth.signOut();
}

// fv_clients → campos: nombres, apellidos, dni, nombre_negocio, sector_negocio,
//              ingreso_mensual, score_transaccional, deuda_total, dias_mora, estado
function mapCliente(row) {
  return {
    ...row,
    name: `${row.nombres || ''} ${row.apellidos || ''}`.trim(),
    dni: row.dni,
    business_name: row.nombre_negocio || '',
    credit_score: row.score_transaccional || 0,
    total_debt: row.deuda_total || 0,
    amount: row.deuda_total || 0,
    days_overdue: row.dias_mora || 0,
    status: row.estado || 'activo',
    segmento: scoreSegment(row.score_transaccional),
  };
}

// solicitudes_credito → campos: client_name, client_dni, monto, plazo_meses,
//                        tea, cuota_mensual, proposito, nombre_negocio, estado
function mapSolicitud(row) {
  return {
    ...row,
    client_name: row.client_name,
    client_dni: row.client_dni,
    business_name: row.nombre_negocio || '',
    segment: scoreSegment(null),
    amount: row.monto || 0,
    term_months: row.plazo_meses || 0,
    monthly_payment: row.cuota_mensual || 0,
    status: row.estado,
    destino_fondos: row.proposito,
    submitted_at: row.submitted_at,
  };
}

// fv_fichas_campo → campos: score_f1..f4, score_final, monto_propuesto,
//                    cuota_estimada, completada, segmento_resultante
//                    + join client: nombres, apellidos, dni, nombre_negocio
function mapEvaluacion(row) {
  const client = row.client || {};
  return {
    ...row,
    client_name: `${client.nombres || ''} ${client.apellidos || ''}`.trim() || '—',
    client_dni: client.dni || '',
    business_name: client.nombre_negocio || '',
    score_f1: row.score_f1 || 0,
    score_f2: row.score_f2 || 0,
    score_f3: row.score_f3 || 0,
    score_f4: row.score_f4 || 0,
    score_final: row.score_final || 0,
    segment: scoreSegment(row.score_final),
    monto_propuesto: row.monto_propuesto || 0,
    cuota_estimada: row.cuota_estimada || 0,
    completada: row.completada || false,
    recomendacion: row.segmento_resultante || '',
  };
}

// fv_cartera_diaria → campos: client_name, saldo_credito, dias_mora,
//                      numero_credito, proposito, fecha_visita
function mapCobranza(row) {
  return {
    ...row,
    client_name: row.client_name,
    client_dni: '',
    business_name: row.proposito || '',
    operation: row.numero_credito || '',
    product_name: row.proposito || 'Crédito Financiera ProEmpresa',
    balance: row.saldo_credito || 0,
    amount: row.saldo_credito || 0,
    due_date: row.fecha_visita,
    days_overdue: row.dias_mora || 0,
    status: (row.dias_mora || 0) > 0 ? 'vencido' : 'vigente',
  };
}

function scoreSegment(score) {
  const s = Number(score || 0);
  if (s >= 700) return 'PREMIER';
  if (s >= 600) return 'ESTANDAR';
  return 'BASICO';
}

function getEmptyKpis() {
  return {
    visitas_pendientes: 0,
    visitas_total_cartera: 0,
    gestionadas_hoy: 0,
    monto_cartera: 0,
    solicitudes_aprobadas: 0,
    solicitudes_mes: 0,
  };
}

function countBy(rows, key) {
  return rows.reduce((acc, row) => {
    const value = row[key] || 'Sin dato';
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function sum(rows, key) {
  return rows.reduce((acc, row) => acc + Number(row[key] || 0), 0);
}

function average(values) {
  const nums = values.map(Number).filter((n) => Number.isFinite(n) && n > 0);
  if (!nums.length) return 0;
  return nums.reduce((acc, n) => acc + n, 0) / nums.length;
}

function isToday(value) {
  if (!value) return false;
  const d = new Date(value);
  const today = new Date();
  return d.toDateString() === today.toDateString();
}

function buildReportesData({ kpis, cartera, solicitudes, visitas, buro }) {
  return {
    kpis,
    carteraTotal: cartera.length,
    montoHipotesis: sum(cartera, 'deuda_total'),
    solicitudesTotal: solicitudes.length,
    solicitudesMonto: sum(solicitudes, 'monto'),
    evaluacionesCompletadas: solicitudes.filter((r) =>
      ['aprobado', 'rechazado', 'desembolsado'].includes((r.estado || '').toLowerCase())
    ).length,
    scorePromedio: average(buro.map((r) => r.calificacion_sbs)),
    visitasHoy: visitas.filter((r) => isToday(r.fecha_visita)).length,
    buroTotal: buro.length,
    estadoCartera: countBy(cartera, 'estado'),
    segmentoCartera: countBy(cartera.map((r) => ({ segmento: r.sector_negocio || 'Sin sector' })), 'segmento'),
    estadoSolicitudes: countBy(solicitudes, 'estado'),
  };
}

function emptyReportes() {
  return buildReportesData({
    kpis: getEmptyKpis(),
    cartera: [],
    solicitudes: [],
    visitas: [],
    buro: [],
  });
}
