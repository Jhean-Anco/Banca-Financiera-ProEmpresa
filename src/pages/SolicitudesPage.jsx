import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { EstadoBadge, formatMoney } from '../components/Ui';
import {
  fetchSolicitudes,
  actualizarEstadoSolicitud,
  fetchSyncLog,
  isSupabaseConfigured,
} from '../lib/supabase';

const ESTADOS_FINALES = ['aprobado', 'desembolsado', 'rechazado'];

export default function SolicitudesPage() {
  const { user } = useOutletContext();
  const puedeAprobar = user?.rol === 'supervisor' || user?.rol === 'admin';

  const [rows, setRows] = useState([]);
  const [syncLog, setSyncLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState(null);

  async function load() {
    setLoading(true);
    const [sols, log] = await Promise.all([fetchSolicitudes(), fetchSyncLog()]);
    setRows(sols);
    setSyncLog(log);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function cambiarEstado(id, estado) {
    setBusyId(id);
    const res = await actualizarEstadoSolicitud(id, estado);
    setBusyId(null);
    if (res.ok) {
      setToast(
        estado === 'aprobado'
          ? 'Solicitud aprobada — crédito publicado a la app del cliente'
          : 'Solicitud rechazada'
      );
      await load();
    } else {
      setToast(res.demo ? 'Modo demo: configura Supabase para aprobar' : `Error: ${res.error}`);
    }
    setTimeout(() => setToast(null), 4000);
  }

  return (
    <>
      <div className="page-header">
        <h2>Mis solicitudes</h2>
        <p style={{ color: 'var(--bp-gris-medio)', marginTop: 4 }}>
          Expedientes transmitidos desde campo (tabla compartida{' '}
          <code>credit_applications</code>)
        </p>
      </div>

      {toast && (
        <div
          style={{
            background: '#0F766E',
            color: '#fff',
            padding: '10px 16px',
            borderRadius: 8,
            marginBottom: 16,
            fontSize: 14,
          }}
        >
          {toast}
        </div>
      )}

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>DNI</th>
              <th>Monto</th>
              <th>Plazo</th>
              <th>Estado</th>
              {puedeAprobar && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={puedeAprobar ? 6 : 5} style={{ textAlign: 'center', padding: 32 }}>
                  Cargando…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={puedeAprobar ? 6 : 5} style={{ textAlign: 'center', padding: 32 }}>
                  Sin solicitudes — ejecuta los scripts SQL en Supabase
                </td>
              </tr>
            ) : (
              rows.map((r) => {
                const estado = (r.status || '').toLowerCase();
                const esFinal = ESTADOS_FINALES.includes(estado);
                return (
                  <tr key={r.id}>
                    <td>
                      <strong>{r.client_name || r.client_dni || r.id}</strong>
                    </td>
                    <td>{r.client_dni || '—'}</td>
                    <td>{formatMoney(r.amount)}</td>
                    <td>{r.term_months} meses</td>
                    <td>
                      <EstadoBadge estado={r.status} />
                    </td>
                    {puedeAprobar && (
                      <td>
                        {esFinal ? (
                          <span style={{ color: 'var(--bp-gris-medio)', fontSize: 13 }}>—</span>
                        ) : (
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              type="button"
                              className="btn-aprobar"
                              disabled={busyId === r.id}
                              onClick={() => cambiarEstado(r.id, 'aprobado')}
                              style={btnStyle('#0F766E')}
                            >
                              {busyId === r.id ? '…' : 'Aprobar'}
                            </button>
                            <button
                              type="button"
                              className="btn-rechazar"
                              disabled={busyId === r.id}
                              onClick={() => cambiarEstado(r.id, 'rechazado')}
                              style={btnStyle('#B91C1C')}
                            >
                              Rechazar
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Trazabilidad del puente End-to-End */}
      <div style={{ marginTop: 28 }}>
        <h2 className="section-title">Integración End-to-End</h2>
        <p style={{ color: 'var(--bp-gris-medio)', marginTop: -8, marginBottom: 12, fontSize: 13 }}>
          Eventos publicados hacia la app del cliente al aprobar (tabla <code>sync_log</code>)
        </p>
        {!isSupabaseConfigured ? (
          <p style={{ fontSize: 13, color: 'var(--bp-gris-medio)' }}>
            Configura Supabase para ver la trazabilidad real.
          </p>
        ) : syncLog.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--bp-gris-medio)' }}>
            Aún no hay eventos. Aprueba una solicitud con DNI de un cliente registrado en la app.
          </p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {syncLog.map((l) => (
              <li
                key={l.id}
                style={{
                  borderLeft: '3px solid #0F766E',
                  padding: '8px 12px',
                  marginBottom: 8,
                  background: 'var(--bp-gris-claro, #f4f6f8)',
                  borderRadius: 6,
                  fontSize: 13,
                }}
              >
                <strong>{l.evento}</strong> — {l.detalle}
                <div style={{ color: 'var(--bp-gris-medio)', fontSize: 11, marginTop: 2 }}>
                  {new Date(l.created_at).toLocaleString('es-EC')}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function btnStyle(bg) {
  return {
    background: bg,
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    padding: '6px 14px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  };
}
