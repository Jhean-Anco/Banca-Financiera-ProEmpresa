import { useEffect, useState } from 'react';
import { EstadoBadge, formatMoney } from '../components/Ui';
import { fetchCobranza } from '../lib/supabase';

export default function CobranzaPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [soloVencidos, setSoloVencidos] = useState(false);

  useEffect(() => {
    fetchCobranza().then((data) => {
      setRows(data);
      setLoading(false);
    });
  }, []);

  const filtered = soloVencidos ? rows.filter((r) => r.days_overdue > 0) : rows;
  const vencidos = rows.filter((r) => r.days_overdue > 0);
  const saldoTotal = rows.reduce((s, r) => s + Number(r.balance || 0), 0);
  const saldoVencido = vencidos.reduce((s, r) => s + Number(r.balance || 0), 0);

  return (
    <>
      <div className="page-header">
        <h2>Cobranza</h2>
        <p style={{ color: 'var(--bp-gris-medio)', marginTop: 4 }}>
          Seguimiento basado en fv_daily_portfolio y saldos de cartera.
        </p>
      </div>

      <div className="panel-grid" style={{ marginBottom: 16 }}>
        <div className="info-panel">
          <div className="info-panel__label">Operaciones</div>
          <div className="info-panel__value">{rows.length}</div>
        </div>
        <div className="info-panel">
          <div className="info-panel__label">Saldo total</div>
          <div className="info-panel__value">{formatMoney(saldoTotal)}</div>
        </div>
        <div className="info-panel">
          <div className="info-panel__label">Saldo vencido</div>
          <div className="info-panel__value">{formatMoney(saldoVencido)}</div>
        </div>
      </div>

      <div className="toolbar">
        <label className="field" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={soloVencidos}
            onChange={(e) => setSoloVencidos(e.target.checked)}
          />
          Solo vencidos
        </label>
      </div>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>DNI</th>
              <th>Operación</th>
              <th>Producto</th>
              <th>Saldo</th>
              <th>Vencimiento</th>
              <th>Días vencidos</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32 }}>Cargando...</td></tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: 32 }}>
                  Sin operaciones para el filtro aplicado.
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={`${r.id}-${r.operation || 'sin-operacion'}`}>
                  <td><strong>{r.client_name}</strong></td>
                  <td>{r.client_dni || '-'}</td>
                  <td>{r.operation || '-'}</td>
                  <td>{r.product_name}</td>
                  <td>{formatMoney(r.balance)}</td>
                  <td>{formatDate(r.due_date)}</td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        background: r.days_overdue > 0 ? '#FDECEE' : '#DCFCE7',
                        color: r.days_overdue > 0 ? '#B40012' : '#166534',
                      }}
                    >
                      {r.days_overdue}
                    </span>
                  </td>
                  <td><EstadoBadge estado={r.status} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('es-PE').format(new Date(`${value}T00:00:00`));
}
