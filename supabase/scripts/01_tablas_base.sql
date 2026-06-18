-- ============================================================
-- FUERZA DE VENTAS — BANCO PICHINCHA
-- Script 01: Tablas base (misma estructura que app Flutter)
-- Ejecutar en: Supabase → SQL Editor → New query → Run
-- ============================================================

-- Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------
-- 1. Créditos preaprobados / Cartera
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.creditos_preaprobados (
  id TEXT PRIMARY KEY,
  nombres TEXT NOT NULL,
  apellidos TEXT NOT NULL,
  cedula TEXT,
  telefono TEXT,
  distrito TEXT,
  tipo_negocio TEXT,
  direccion_negocio TEXT,
  latitud DOUBLE PRECISION,
  longitud DOUBLE PRECISION,
  segmento TEXT CHECK (segmento IN ('PREMIER', 'ESTANDAR', 'BASICO', 'NO_APLICA')),
  score_transaccional DOUBLE PRECISION DEFAULT 0,
  monto_hipotesis DOUBLE PRECISION DEFAULT 0,
  estado TEXT DEFAULT 'pendiente',
  es_renovacion BOOLEAN DEFAULT FALSE,
  fecha_vencimiento_credito DATE,
  monto_credito_anterior DOUBLE PRECISION DEFAULT 0,
  numero_credito_anterior TEXT,
  asesor_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 2. Fichas de evaluación en campo
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fichas_campo (
  id TEXT PRIMARY KEY,
  cliente_id TEXT NOT NULL REFERENCES public.creditos_preaprobados(id) ON DELETE CASCADE,
  negocio_verificado BOOLEAN DEFAULT FALSE,
  antiguedad_meses INTEGER DEFAULT 0,
  tenencia_local TEXT,
  ventas_diarias DOUBLE PRECISION DEFAULT 0,
  gastos_fijos DOUBLE PRECISION DEFAULT 0,
  consistencia_cuenta BOOLEAN DEFAULT FALSE,
  prestamos_informales BOOLEAN DEFAULT FALSE,
  pandero_junta BOOLEAN DEFAULT FALSE,
  stock_visible BOOLEAN DEFAULT FALSE,
  activos_hogar DOUBLE PRECISION DEFAULT 0,
  caracter TEXT DEFAULT 'sinPenalidad',
  score_f1 DOUBLE PRECISION DEFAULT 0,
  score_f2 DOUBLE PRECISION DEFAULT 0,
  score_f3 DOUBLE PRECISION DEFAULT 0,
  score_f4 DOUBLE PRECISION DEFAULT 0,
  score_final DOUBLE PRECISION DEFAULT 0,
  segmento_resultante TEXT,
  monto_propuesto DOUBLE PRECISION DEFAULT 0,
  plazo_meses INTEGER DEFAULT 12,
  cuota_estimada DOUBLE PRECISION DEFAULT 0,
  recomendacion TEXT,
  completada BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 3. Historial de visitas
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.historial_visitas (
  id TEXT PRIMARY KEY,
  cliente_id TEXT NOT NULL REFERENCES public.creditos_preaprobados(id) ON DELETE CASCADE,
  cliente_nombre TEXT,
  fecha TIMESTAMPTZ DEFAULT NOW(),
  resultado TEXT,
  score_final DOUBLE PRECISION,
  segmento TEXT,
  monto_propuesto DOUBLE PRECISION,
  observaciones TEXT,
  asesor_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 4. Solicitudes de crédito (app móvil + web)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.solicitudes_credito (
  id TEXT PRIMARY KEY,
  cliente_id TEXT NOT NULL REFERENCES public.creditos_preaprobados(id) ON DELETE CASCADE,
  monto_solicitado DOUBLE PRECISION DEFAULT 0,
  plazo_meses INTEGER DEFAULT 12,
  destino_fondos TEXT,
  tipo_garantia TEXT,
  referencia_personal TEXT,
  referencia_comercial TEXT,
  observaciones TEXT,
  estado TEXT DEFAULT 'borrador',
  transmitida BOOLEAN DEFAULT FALSE,
  asesor_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 5. Consultas de buró
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.consultas_buro (
  id TEXT PRIMARY KEY,
  cliente_id TEXT NOT NULL REFERENCES public.creditos_preaprobados(id) ON DELETE CASCADE,
  cedula TEXT,
  score_buro INTEGER,
  deudas_vigentes DOUBLE PRECISION DEFAULT 0,
  morosidad TEXT,
  recomendacion TEXT,
  fecha_consulta TIMESTAMPTZ DEFAULT NOW(),
  asesor_id UUID
);

-- ------------------------------------------------------------
-- 6. Productos activos (ficha cliente web)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.productos_activos (
  id TEXT PRIMARY KEY,
  cliente_id TEXT NOT NULL REFERENCES public.creditos_preaprobados(id) ON DELETE CASCADE,
  nombre TEXT,
  numero_operacion TEXT,
  monto DOUBLE PRECISION,
  saldo DOUBLE PRECISION,
  estado TEXT,
  fecha_desembolso DATE,
  fecha_vencimiento DATE
);

-- ------------------------------------------------------------
-- 7. Historial crediticio
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.historial_crediticio (
  id TEXT PRIMARY KEY,
  cliente_id TEXT NOT NULL REFERENCES public.creditos_preaprobados(id) ON DELETE CASCADE,
  fecha DATE,
  tipo TEXT,
  monto DOUBLE PRECISION,
  estado TEXT,
  observacion TEXT
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_creditos_estado ON public.creditos_preaprobados(estado);
CREATE INDEX IF NOT EXISTS idx_creditos_renovacion ON public.creditos_preaprobados(es_renovacion);
CREATE INDEX IF NOT EXISTS idx_solicitudes_estado ON public.solicitudes_credito(estado);
CREATE INDEX IF NOT EXISTS idx_historial_fecha ON public.historial_visitas(fecha);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_creditos_updated ON public.creditos_preaprobados;
CREATE TRIGGER trg_creditos_updated
  BEFORE UPDATE ON public.creditos_preaprobados
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_solicitudes_updated ON public.solicitudes_credito;
CREATE TRIGGER trg_solicitudes_updated
  BEFORE UPDATE ON public.solicitudes_credito
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

COMMENT ON TABLE public.creditos_preaprobados IS 'Cartera diaria — sincronizada con app Flutter';
