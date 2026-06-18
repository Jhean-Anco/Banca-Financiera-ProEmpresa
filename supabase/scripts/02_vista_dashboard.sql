-- ============================================================
-- Script 02: Vista KPIs para dashboard web
-- Ejecutar DESPUÉS del script 01
-- ============================================================

CREATE OR REPLACE VIEW public.v_dashboard_kpis AS
SELECT
  NULL::UUID AS asesor_id,
  COUNT(*) FILTER (
    WHERE estado IN ('pendiente', 'enVisita')
  )::INTEGER AS visitas_pendientes,
  COUNT(*)::INTEGER AS visitas_total_cartera,
  (
    SELECT COUNT(*)::INTEGER
    FROM public.historial_visitas hv
    WHERE hv.fecha::DATE = CURRENT_DATE
  ) AS gestionadas_hoy,
  COALESCE(SUM(monto_hipotesis) FILTER (
    WHERE estado IN ('aprobado', 'desembolsado', 'evaluado', 'enviado', 'comite')
  ), 0)::DOUBLE PRECISION AS monto_cartera,
  (
    SELECT COUNT(*)::INTEGER
    FROM public.creditos_preaprobados c2
    WHERE c2.estado IN ('aprobado', 'desembolsado')
      AND DATE_TRUNC('month', c2.updated_at) = DATE_TRUNC('month', CURRENT_DATE)
  ) AS solicitudes_aprobadas,
  (
    SELECT COUNT(*)::INTEGER
    FROM public.solicitudes_credito s
    WHERE DATE_TRUNC('month', s.created_at) = DATE_TRUNC('month', CURRENT_DATE)
  ) AS solicitudes_mes
FROM public.creditos_preaprobados;

-- Vista por asesor (opcional, cuando uses auth)
CREATE OR REPLACE VIEW public.v_dashboard_kpis_por_asesor AS
SELECT
  c.asesor_id,
  COUNT(*) FILTER (WHERE c.estado IN ('pendiente', 'enVisita'))::INTEGER AS visitas_pendientes,
  COUNT(*)::INTEGER AS visitas_total_cartera,
  (
    SELECT COUNT(*)::INTEGER FROM public.historial_visitas hv
    WHERE hv.asesor_id = c.asesor_id AND hv.fecha::DATE = CURRENT_DATE
  ) AS gestionadas_hoy,
  COALESCE(SUM(c.monto_hipotesis) FILTER (
    WHERE c.estado IN ('aprobado', 'desembolsado', 'evaluado', 'enviado', 'comite')
  ), 0)::DOUBLE PRECISION AS monto_cartera,
  COUNT(*) FILTER (
    WHERE c.estado IN ('aprobado', 'desembolsado')
      AND DATE_TRUNC('month', c.updated_at) = DATE_TRUNC('month', CURRENT_DATE)
  )::INTEGER AS solicitudes_aprobadas,
  (
    SELECT COUNT(*)::INTEGER FROM public.solicitudes_credito s
    WHERE s.asesor_id = c.asesor_id
      AND DATE_TRUNC('month', s.created_at) = DATE_TRUNC('month', CURRENT_DATE)
  ) AS solicitudes_mes
FROM public.creditos_preaprobados c
GROUP BY c.asesor_id;

GRANT SELECT ON public.v_dashboard_kpis TO anon, authenticated;
GRANT SELECT ON public.v_dashboard_kpis_por_asesor TO anon, authenticated;
