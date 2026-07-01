import { useEffect, useState } from 'react';
import { EstadoBadge, SegmentBadge, formatMoney } from '../components/Ui';
import { fetchCartera } from '../lib/supabase';

function MoraBadge({ dias }) {
  const d = Number(dias || 0);
  const color = d === 0 ? '#21A635' : d <= 30 ? '#71A621' : '#F2CC0C';
  const label = d === 0 ? 'Al día' : `${d} días`;
  return (
    <span
      style={{
        background: color,
        color: '#fff',
        borderRadius: 10,
        padding: '3px 10px',
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      {label}
    </span>
  );
}

export default function CarteraPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [estado, setEstado] = useState('');
  const [segmento, setSegmento] = useState('');

  useEffect(() => {
    fetchCartera().then((data) => {
      setRows(data);
      setLoading(false);
    });
  }, []);

  const filtered = rows.filter((r) => {
    const t = q.trim().toLowerCase();
    const matchesText = !t || (
      (r.name || '').toLowerCase().includes(t) ||
      (r.dni || '').toLowerCase().includes(t) ||
      (r.business_name || '').toLowerCase().includes(t)
    );
    const matchesEstado = !estado || r.status === estado;
    const matchesSegmento = !segmento || r.segmento === segmento;
    return matchesText && matchesEstado && matchesSegmento;
  });

  const estados = [...new Set(rows.map((r) => r.status).filter(Boolean))];
  const segmentos = [...new Set(rows.map((r) => r.segmento).filter(Boolean))];

  return (
    <>
      <div className="page-header">
        <h2>Cartera Financiera ProEmpresa</h2>
        <p style={{ color: 'var(--bp-gris-medio)', marginTop: 4 }}>
          Clientes asignados a la fuerza de ventas y sincronizados con la app de campo.
        </p>
      </div>

      <div className="panel-grid" style={{ marginBottom: 16 }}>
        <div className="info-panel">
          <div className="info-panel__label">Clientes</div>
          <div className="info-panel__value">{rows.length}</div>
        </div>
        <div className="info-panel">
          <div className="info-panel__label">Monto hipótesis</div>
          <div className="info-panel__value">{formatMoney(rows.reduce((s, r) => s + Number(r.amount || 0), 0))}</div>
        </div>
        <div className="info-panel">
          <div className="info-panel__label">Pendientes</div>
          <div className="info-panel__value">{rows.filter((r) => r.status === 'pendiente').length}</div>
        </div>
      </div>

      <div className="toolbar">
        <input
          className="field"
          type="search"
          placeholder="Buscar cliente, DNI o negocio"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className="field" value={estado} onChange={(e) => setEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          {estados.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <select className="field" value={segmento} onChange={(e) => setSegmento(e.target.value)}>
          <option value="">Todos los segmentos</option>
          {segmentos.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>DNI</th>
              <th>Negocio</th>
              <th>Segmento</th>
              <th>Score</th>
              <th>Monto hipótesis</th>
              <th>Estado</th>
              <th>Vencimiento</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: 32 }}>
                  Cargando...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: 32 }}>
                  Sin registros en fv_clients para los filtros aplicados.
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id}>
                  <td>
                    <strong>{r.name}</strong>
                  </td>
                  <td>{r.dni}</td>
                  <td>{r.business_name || '-'}</td>
                  <td><SegmentBadge segmento={r.segmento} /></td>
                  <td>{Number(r.credit_score || 0).toFixed(0)}</td>
                  <td>{formatMoney(r.amount)}</td>
                  <td><EstadoBadge estado={r.status} /></td>
                  <td><MoraBadge dias={r.days_overdue} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
