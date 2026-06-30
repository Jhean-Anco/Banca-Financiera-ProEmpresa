import { Fragment, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { EstadoBadge, formatMoney } from '../components/Ui';
import {
  fetchSolicitudes,
  actualizarEstadoSolicitud,
  fetchAdvisors,
  asignarAsesorASolicitud,
  fetchExpedienteSolicitud,
} from '../lib/supabase';

const ESTADOS_FINALES = ['aprobado', 'desembolsado', 'rechazado'];

export default function SolicitudesPage() {
  const { puedeAprobar } = useOutletContext();
  const [rows, setRows] = useState([]);
  const [advisors, setAdvisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState(null);
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [expedientes, setExpedientes] = useState({});

  async function load() {
    setLoading(true);
    const [sols, advs] = await Promise.all([
      fetchSolicitudes(),
      fetchAdvisors(),
    ]);
    setRows(sols);
    setAdvisors(advs);
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
          ? 'Solicitud aprobada y desembolsada. El credito quedo publicado para la app del cliente.'
          : 'Solicitud rechazada.'
      );
      await load();
    } else {
      setToast(res.demo ? 'Modo demo: configura Supabase para aprobar.' : `Error: ${res.error}`);
    }
    setTimeout(() => setToast(null), 4000);
  }

  async function asignarAsesor(solicitudId, asesorId) {
    if (!asesorId) return;
    setBusyId(solicitudId);
    const res = await asignarAsesorASolicitud(solicitudId, asesorId);
    setBusyId(null);
    if (res.ok) {
      setToast('Asesor asignado correctamente. La solicitud paso a Evaluacion de Campo.');
      await load();
    } else {
      setToast(`Error al asignar asesor: ${res.error}`);
    }
    setTimeout(() => setToast(null), 4000);
  }

  async function toggleExpediente(row) {
    const nextId = expandedId === row.id ? null : row.id;
    setExpandedId(nextId);
    if (nextId && !expedientes[row.id]) {
      setExpedientes((prev) => ({ ...prev, [row.id]: { loading: true } }));
      const data = await fetchExpedienteSolicitud(row);
      setExpedientes((prev) => ({ ...prev, [row.id]: { loading: false, ...data } }));
    }
  }

  const estados = [...new Set(rows.map((r) => r.status).filter(Boolean))];
  const filtered = estadoFiltro ? rows.filter((r) => r.status === estadoFiltro) : rows;

  return (
    <>
      <div className="page-header">
        <h2>Solicitudes Caja Ica</h2>
        <p style={{ color: 'var(--bp-gris-medio)', marginTop: 4 }}>
          Primero se reciben en web, luego se asignan al asesor y finalmente se revisa el expediente de campo.
        </p>
      </div>

      <div className="panel-grid" style={{ marginBottom: 16 }}>
        <div className="info-panel">
          <div className="info-panel__label">Solicitudes</div>
          <div className="info-panel__value">{rows.length}</div>
        </div>
        <div className="info-panel">
          <div className="info-panel__label">Monto solicitado</div>
          <div className="info-panel__value">{formatMoney(rows.reduce((s, r) => s + Number(r.amount || 0), 0))}</div>
        </div>
        <div className="info-panel">
          <div className="info-panel__label">Pendientes de decision</div>
          <div className="info-panel__value">
            {rows.filter((r) => !ESTADOS_FINALES.includes((r.status || '').toLowerCase())).length}
          </div>
        </div>
      </div>

      <div className="toolbar">
        <select className="field" value={estadoFiltro} onChange={(e) => setEstadoFiltro(e.target.value)}>
          <option value="">Todos los estados</option>
          {estados.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>

      {toast && (
        <div
          style={{
            background: '#0F8A5F',
            color: '#fff',
            padding: '10px 16px',
            borderRadius: 10,
            marginBottom: 16,
            fontSize: 14,
            fontWeight: 600,
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
              <th>Negocio</th>
              <th>Monto</th>
              <th>Plazo</th>
              <th>Destino</th>
              <th>Estado</th>
              <th>Asesor asignado</th>
              {puedeAprobar && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={puedeAprobar ? 9 : 8} style={{ textAlign: 'center', padding: 32 }}>
                  Cargando...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={puedeAprobar ? 9 : 8} style={{ textAlign: 'center', padding: 32 }}>
                  Sin solicitudes de credito para el filtro aplicado.
                </td>
              </tr>
            ) : (
              filtered.map((r) => {
                const estado = (r.status || '').toLowerCase();
                const esFinal = ESTADOS_FINALES.includes(estado);
                const enComite = estado === 'comite';
                const puedeAsignar = estado === 'enviado' || estado === 'en_evaluacion';

                return (
                  <Fragment key={r.id}>
                    <tr>
                      <td><strong>{r.client_name || r.client_dni || r.id}</strong></td>
                      <td>{r.client_dni || '-'}</td>
                      <td>{r.business_name || '-'}</td>
                      <td>{formatMoney(r.amount)}</td>
                      <td>{r.term_months} meses</td>
                      <td>{r.destino_fondos || '-'}</td>
                      <td><EstadoBadge estado={r.status} /></td>
                      <td>
                        {puedeAsignar ? (
                          <select
                            className="field"
                            style={{ padding: '4px 8px', fontSize: 13, width: '100%', minWidth: 150 }}
                            value={r.asesor_id || ''}
                            disabled={busyId === r.id}
                            onChange={(e) => asignarAsesor(r.id, e.target.value)}
                          >
                            <option value="">-- Seleccionar asesor --</option>
                            {advisors.map((adv) => (
                              <option key={adv.id} value={adv.id}>
                                {adv.nombre || adv.email}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span>{advisors.find((a) => a.id === r.asesor_id)?.nombre || r.asesor_id || 'No asignado'}</span>
                        )}
                      </td>
                      {puedeAprobar && (
                        <td>
                          {enComite ? (
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                              <button type="button" onClick={() => toggleExpediente(r)} style={btnStyle('#334155')}>
                                Expediente
                              </button>
                              <button
                                type="button"
                                disabled={busyId === r.id}
                                onClick={() => cambiarEstado(r.id, 'aprobado')}
                                style={btnStyle('#0F8A5F')}
                              >
                                {busyId === r.id ? '...' : 'Aprobar'}
                              </button>
                              <button
                                type="button"
                                disabled={busyId === r.id}
                                onClick={() => cambiarEstado(r.id, 'rechazado')}
                                style={btnStyle('#B40012')}
                              >
                                Rechazar
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => toggleExpediente(r)}
                              style={btnStyle(esFinal ? '#64748b' : '#475569')}
                            >
                              {esFinal ? 'Expediente' : 'Ver avance'}
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                    {expandedId === r.id && (
                      <tr>
                        <td colSpan={puedeAprobar ? 9 : 8} className="expediente-cell">
                          <ExpedienteSolicitud
                            data={expedientes[r.id]}
                            asesor={advisors.find((a) => a.id === r.asesor_id)}
                          />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

function ExpedienteSolicitud({ data, asesor }) {
  if (!data || data.loading) {
    return <div className="expediente-panel">Cargando expediente de campo...</div>;
  }

  const ficha = data.ficha;
  const docs = data.documentos || [];
  const obligatorios = ['dniAnverso', 'dniReverso', 'fotoNegocio', 'fotoAsesorCliente'];
  const completos = obligatorios.filter((tipo) => docs.some((d) => d.tipo === tipo)).length;

  return (
    <div className="expediente-panel">
      <div className="expediente-section">
        <h3>Expediente levantado por asesor</h3>
        <div className="expediente-kpis">
          <MiniDato label="Asesor" value={asesor?.nombre || 'No asignado'} />
          <MiniDato label="Ficha de campo" value={ficha?.completada ? 'Completa' : 'Pendiente'} />
          <MiniDato label="Documentos clave" value={`${completos}/${obligatorios.length}`} />
          <MiniDato label="Score final" value={ficha?.score_final ? Number(ficha.score_final).toFixed(0) : '-'} />
          <MiniDato label="Monto propuesto" value={ficha?.monto_propuesto ? formatMoney(ficha.monto_propuesto) : '-'} />
          <MiniDato label="Cuota estimada" value={ficha?.cuota_estimada ? formatMoney(ficha.cuota_estimada) : '-'} />
        </div>
      </div>
      <div className="expediente-section">
        <h3>Documentos y fotografias</h3>
        {docs.length === 0 ? (
          <p className="muted">Aun no hay fotografias ni documentos cargados por el asesor.</p>
        ) : (
          <div className="doc-grid">
            {docs.map((doc) => (
              <a className="doc-card" key={doc.id} href={doc.url || '#'} target="_blank" rel="noreferrer">
                {isImage(doc.url) ? (
                  <img src={doc.url} alt={labelDocumento(doc.tipo)} />
                ) : (
                  <div className="doc-card__placeholder">DOC</div>
                )}
                <div>
                  <strong>{labelDocumento(doc.tipo)}</strong>
                  <span>{doc.es_nitido ? 'Nitido' : 'Pendiente de validar'} - {Number(doc.sharpness_score || 0).toFixed(2)}</span>
                </div>
              </a>
            ))}
          </div>
        )}
        {data.error && <p className="muted">No se pudo cargar todo el expediente: {data.error}</p>}
      </div>
    </div>
  );
}

function MiniDato({ label, value }) {
  return (
    <div className="mini-dato">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function isImage(url = '') {
  return /\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(url);
}

function labelDocumento(tipo = '') {
  const labels = {
    dniAnverso: 'DNI anverso',
    dniReverso: 'DNI reverso',
    fotoNegocio: 'Foto del negocio',
    fotoAsesorCliente: 'Asesor con cliente',
    ruc: 'RUC',
    reciboServicios: 'Recibo de servicios',
    contrato: 'Contrato',
    'DNI frente': 'DNI anverso',
    'Foto negocio': 'Foto del negocio',
  };
  return labels[tipo] || tipo || 'Documento';
}

function btnStyle(bg) {
  return {
    background: bg,
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '7px 14px',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
  };
}
