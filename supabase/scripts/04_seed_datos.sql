-- ============================================================
-- Script 04: Datos de ejemplo (opcional — misma cartera que app)
-- Ejecutar DESPUÉS de scripts 01 y 03
-- ============================================================

INSERT INTO public.creditos_preaprobados (
  id, nombres, apellidos, cedula, telefono, distrito, tipo_negocio,
  direccion_negocio, latitud, longitud, segmento, score_transaccional,
  monto_hipotesis, estado, es_renovacion, fecha_vencimiento_credito,
  monto_credito_anterior, numero_credito_anterior
) VALUES
  ('cli-001', 'María Elena', 'Quishpe Torres', '1712345678', '0991234567', 'La Magdalena', 'Bodega',
   'Av. 6 de Diciembre', -0.1807, -78.4678, 'PREMIER', 87.5, 5000, 'pendiente', TRUE, '2026-06-15', 4500, 'CR-2024-001234'),
  ('cli-002', 'Carlos Alberto', 'Mena Villacís', '1723456789', '0987654321', 'Chimbacalle', 'Taller mecánico',
   'Av. Maldonado', -0.2456, -78.5123, 'ESTANDAR', 72.3, 3500, 'pendiente', TRUE, '2026-06-20', 3000, 'CR-2024-005678'),
  ('cli-003', 'Rosa Isabel', 'Pérez Guamán', '1734567890', '0976543210', 'Solanda', 'Comida rápida',
   'Mercado Solanda', -0.2891, -78.5345, 'BASICO', 55.8, 2000, 'pendiente', TRUE, '2026-06-10', 1800, 'CR-2024-009012'),
  ('cli-004', 'José Luis', 'Castro Mendoza', '1745678901', '0965432109', 'La Floresta', 'Peluquería',
   'Av. República', -0.2012, -78.4890, 'PREMIER', 91.2, 6000, 'enVisita', TRUE, '2026-06-25', 5500, 'CR-2023-003456'),
  ('cli-005', 'Ana Lucía', 'Vega Herrera', '1756789012', '0954321098', 'El Condado', 'Farmacia',
   'Av. Mariscal Sucre', -0.1567, -78.4789, 'ESTANDAR', 68.4, 4500, 'evaluado', FALSE, NULL, 0, NULL),
  ('cli-006', 'Pedro Antonio', 'Ruiz Salazar', '1767890123', '0943210987', 'Quitumbe', 'Ferretería',
   'Av. Quitumbe', -0.3012, -78.5456, 'BASICO', 48.9, 2500, 'enviado', TRUE, '2026-07-01', 2200, 'CR-2024-011122'),
  ('cli-007', 'Lucía Fernanda', 'Ortega Paredes', '1778901234', '0932109876', 'Carcelén', 'Tienda de ropa',
   'Calle Carcelén', -0.1234, -78.4567, 'ESTANDAR', 75.6, 4000, 'comite', FALSE, NULL, 0, NULL),
  ('cli-008', 'Fernando Javier', 'Aguirre López', '1789012345', '0921098765', 'La Kennedy', 'Panadería',
   'Av. Kennedy', -0.1678, -78.4923, 'PREMIER', 84.1, 5500, 'aprobado', TRUE, '2026-05-30', 5000, 'CR-2023-007890'),
  ('cli-009', 'Gabriela', 'Morales Intriago', '1790123456', '0910987654', 'Tumbaco', 'Restaurante',
   'Av. Interoceánica', -0.2134, -78.4012, 'ESTANDAR', 70.2, 8000, 'desembolsado', FALSE, NULL, 0, NULL),
  ('cli-010', 'Héctor Manuel', 'Bravo Cedeño', '1701234567', '0909876543', 'Calderón', 'Venta de celulares',
   'Centro Calderón', -0.0987, -78.4234, 'BASICO', 42.3, 1500, 'rechazado', FALSE, NULL, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  estado = EXCLUDED.estado,
  score_transaccional = EXCLUDED.score_transaccional,
  updated_at = NOW();

INSERT INTO public.solicitudes_credito (id, cliente_id, monto_solicitado, plazo_meses, destino_fondos, tipo_garantia, estado, transmitida)
VALUES
  ('sol-001', 'cli-006', 2500, 12, 'Capital de trabajo', 'Personal', 'enviado', TRUE),
  ('sol-002', 'cli-008', 5500, 18, 'Ampliación local', 'Personal', 'aprobado', TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.historial_visitas (id, cliente_id, cliente_nombre, fecha, resultado, score_final, segmento, monto_propuesto)
VALUES
  ('hv-001', 'cli-005', 'Ana Lucía Vega Herrera', NOW() - INTERVAL '2 hours', 'Evaluado', 72.0, 'ESTANDAR', 4500),
  ('hv-002', 'cli-004', 'José Luis Castro Mendoza', NOW() - INTERVAL '5 hours', 'En visita', 85.0, 'PREMIER', 6000)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.productos_activos (id, cliente_id, nombre, numero_operacion, monto, saldo, estado, fecha_desembolso, fecha_vencimiento)
VALUES
  ('prod-001', 'cli-001', 'Microcrédito Emprendimiento', 'CR-2024-1234', 5000, 1200, 'Vigente', '2024-06-15', '2026-06-15')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.historial_crediticio (id, cliente_id, fecha, tipo, monto, estado, observacion)
VALUES
  ('hc-001', 'cli-001', '2024-06-15', 'Desembolso', 5000, 'Completado', 'Primer crédito microempresa'),
  ('hc-002', 'cli-001', '2025-12-01', 'Renovación', 4500, 'En curso', 'Buen comportamiento de pago')
ON CONFLICT (id) DO NOTHING;
