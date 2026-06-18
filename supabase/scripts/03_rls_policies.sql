-- ============================================================
-- Script 03: Row Level Security (RLS) — lectura para web/móvil
-- Ajusta políticas según tu modelo de auth en producción
-- ============================================================

ALTER TABLE public.creditos_preaprobados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fichas_campo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historial_visitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitudes_credito ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultas_buro ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos_activos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historial_crediticio ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública con anon key (DESARROLLO)
-- ⚠️ En producción reemplaza por auth.uid() = asesor_id

DROP POLICY IF EXISTS "lectura_creditos_anon" ON public.creditos_preaprobados;
CREATE POLICY "lectura_creditos_anon" ON public.creditos_preaprobados
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "escritura_creditos_anon" ON public.creditos_preaprobados;
CREATE POLICY "escritura_creditos_anon" ON public.creditos_preaprobados
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "lectura_fichas" ON public.fichas_campo;
CREATE POLICY "lectura_fichas" ON public.fichas_campo
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "lectura_historial" ON public.historial_visitas;
CREATE POLICY "lectura_historial" ON public.historial_visitas
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "lectura_solicitudes" ON public.solicitudes_credito;
CREATE POLICY "lectura_solicitudes" ON public.solicitudes_credito
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "lectura_buro" ON public.consultas_buro;
CREATE POLICY "lectura_buro" ON public.consultas_buro
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "lectura_productos" ON public.productos_activos;
CREATE POLICY "lectura_productos" ON public.productos_activos
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "lectura_hist_cred" ON public.historial_crediticio;
CREATE POLICY "lectura_hist_cred" ON public.historial_crediticio
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Storage bucket para documentos (ejecutar si usas Storage)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('documentos_campo', 'documentos_campo', false)
-- ON CONFLICT DO NOTHING;
