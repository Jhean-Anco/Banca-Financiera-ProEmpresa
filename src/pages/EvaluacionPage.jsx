import { useEffect, useState } from 'react';
import { EstadoBadge, SegmentBadge, formatMoney } from '../components/Ui';
import { fetchEvaluaciones } from '../lib/supabase';

export default function EvaluacionPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [soloCompletadas, setSoloCompletadas] = useState(false);

  useEffect(() => {
    fetchEvaluaciones().then((data) => {
      setRows(data);
      setLoading(false);
    });
  }, []);

  const filtered = soloCompletadas ? rows.filter((r) => r.completada) : rows;
  const completadas = rows.filter((r) => r.completada).length;
  const scorePromedio = average(rows.map((r) => r.score_final));

  return (
    <>
      <div className="page-header">
        <h2>Evaluación crediticia</h2>
        <p style={{ color: 'var(--bp-gris-medio)', marginTop: 4 }}>
          Información tomada de fv_credit_applications para evaluación supervisora.
        </p>
      </div>

      <div className="panel-grid" style={{ marginBottom: 16 }}>
        <div className="info-panel">
          <div className="info-panel__label">Fichas registradas</div>
          <div className="info-panel__value">{rows.length}</div>
        </div>
        <div className="info-panel">
          <div className="info-panel__label">Completadas</div>
          <div className="info-panel__value">{completadas}</div>
        </div>
        <div className="info-panel">
          <div className="info-panel__label">Score promedio</div>
          <div className="info-panel__value">{scorePromedio.toFixed(0)}</div>
        </div>
      </div>

      <div className="toolbar">
        <label className="field" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={soloCompletadas}
            onChange={(e) => setSoloCompletadas(e.target.checked)}
          />
          Solo completadas
        </label>
      </div>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>DNI</th>
              <th>Negocio</th>
              <th>Segmento</th>
              <th>Score F1-F4</th>
              <th>Score final</th>
              <th>Monto propuesto</th>
              <th>Cuota</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: 32 }}>Cargando...</td></tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: 32 }}>
                  Sin registros en fv_credit_applications para el filtro aplicado.
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id}>
                  <td><strong>{r.client_name || r.cliente_id}</strong></td>
                  <td>{r.client_dni || '-'}</td>
                  <td>{r.business_name || '-'}</td>
                  <td><SegmentBadge segmento={r.segment} /></td>
                  <td>{[r.score_f1, r.score_f2, r.score_f3, r.score_f4].map((n) => Number(n || 0).toFixed(0)).join(' / ')}</td>
                  <td><strong>{Number(r.score_final || 0).toFixed(0)}</strong></td>
                  <td>{formatMoney(r.monto_propuesto)}</td>
                  <td>{formatMoney(r.cuota_estimada)}</td>
                  <td><EstadoBadge estado={r.completada ? 'completada' : 'pendiente'} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

function average(values) {
  const nums = values.map(Number).filter((n) => Number.isFinite(n) && n > 0);
  if (!nums.length) return 0;
  return nums.reduce((acc, n) => acc + n, 0) / nums.length;
}
