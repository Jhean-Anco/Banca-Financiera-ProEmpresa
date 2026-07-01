import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { MapPin, CheckCircle2, TrendingUp, FileText, Users, ClipboardCheck } from 'lucide-react';
import { EstadoBadge, KpiCard, QuickCard, SegmentBadge, formatMoney } from '../components/Ui';
import { colors, quickAccess } from '../config/theme';
import { fetchCartera, fetchDashboardKpis, fetchSolicitudes } from '../lib/supabase';

export default function DashboardPage() {
  const { user, navigate } = useOutletContext();
  const [kpis, setKpis] = useState(null);
  const [cartera, setCartera] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchDashboardKpis(), fetchCartera(5), fetchSolicitudes(5)]).then(([data, clients, apps]) => {
      setKpis(data);
      setCartera(clients);
      setSolicitudes(apps);
      setLoading(false);
    });
  }, []);

  const k = kpis ?? {};

  return (
    <>
      <div className="page-greeting">
        <h1>Hola, {user.name.split(' ')[0]}</h1>
        <p>Resumen operativo de Financiera ProEmpresa para la jornada comercial.</p>
      </div>

      <div className="kpi-grid">
        <KpiCard
          label="Visitas pendientes"
          value={loading ? '...' : k.visitas_pendientes ?? 0}
          sub={`de ${k.visitas_total_cartera ?? 0} clientes en cartera`}
          accent={colors.rojoCaja}
          icon={MapPin}
        />
        <KpiCard
          label="Gestionadas hoy"
          value={loading ? '...' : k.gestionadas_hoy ?? 0}
          sub="visitas registradas"
          accent={colors.premier}
          icon={CheckCircle2}
        />
        <KpiCard
          label="Monto en cartera"
          value={loading ? '...' : formatMoney(k.monto_cartera)}
          sub="colocación gestionada"
          accent={colors.doradoOscuro}
          icon={TrendingUp}
        />
        <KpiCard
          label="Solicitudes aprobadas"
          value={loading ? '...' : k.solicitudes_aprobadas ?? 0}
          sub={`de ${k.solicitudes_mes ?? 0} este mes`}
          accent={colors.rojoOscuro}
          icon={FileText}
        />
      </div>

      <h2 className="section-title">Accesos rápidos</h2>
      <div className="quick-grid">
        {quickAccess.map((item) => (
          <QuickCard
            key={item.title}
            {...item}
            onClick={() => navigate(item.path)}
          />
        ))}
      </div>

      <div className="panel-grid" style={{ marginTop: 28 }}>
        <div className="info-panel">
          <div className="section-row">
            <h2 className="section-title" style={{ margin: 0 }}>Cartera reciente</h2>
            <Users size={20} color={colors.rojoCaja} />
          </div>
          <table className="data-table">
            <tbody>
              {loading ? (
                <tr><td>Cargando...</td></tr>
              ) : cartera.length === 0 ? (
                <tr><td>Sin clientes en fv_clients.</td></tr>
              ) : (
                cartera.slice(0, 4).map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div className="stack">
                        <strong>{row.name}</strong>
                        <span className="muted">{row.business_name || '-'} · {formatMoney(row.amount)}</span>
                      </div>
                    </td>
                    <td><SegmentBadge segmento={row.segmento} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="info-panel">
          <div className="section-row">
            <h2 className="section-title" style={{ margin: 0 }}>Solicitudes recientes</h2>
            <ClipboardCheck size={20} color={colors.rojoCaja} />
          </div>
          <table className="data-table">
            <tbody>
              {loading ? (
                <tr><td>Cargando...</td></tr>
              ) : solicitudes.length === 0 ? (
                <tr><td>Sin registros en fv_credit_applications.</td></tr>
              ) : (
                solicitudes.slice(0, 4).map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div className="stack">
                        <strong>{row.client_name || row.client_dni || row.id}</strong>
                        <span className="muted">{formatMoney(row.amount)} · {row.term_months} meses</span>
                      </div>
                    </td>
                    <td><EstadoBadge estado={row.status} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
