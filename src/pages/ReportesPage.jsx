import { useEffect, useState } from 'react';
import { BarChart3, FileText, ShieldCheck, Users } from 'lucide-react';
import { KpiCard, formatMoney } from '../components/Ui';
import { colors } from '../config/theme';
import { fetchReportesData } from '../lib/supabase';

export default function ReportesPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportesData().then((result) => {
      setData(result);
      setLoading(false);
    });
  }, []);

  const d = data ?? {};
  const k = d.kpis ?? {};

  return (
    <>
      <div className="page-header">
        <h2>Reportes</h2>
        <p style={{ color: 'var(--bp-gris-medio)', marginTop: 4 }}>
          Indicadores calculados desde las tablas operativas de Supabase.
        </p>
      </div>

      <div className="kpi-grid">
        <KpiCard
          label="Cartera total"
          value={loading ? '...' : d.carteraTotal ?? 0}
          sub={loading ? '' : formatMoney(d.montoHipotesis)}
          accent={colors.rojoCaja}
          icon={Users}
        />
        <KpiCard
          label="Solicitudes"
          value={loading ? '...' : d.solicitudesTotal ?? 0}
          sub={loading ? '' : formatMoney(d.solicitudesMonto)}
          accent={colors.premier}
          icon={FileText}
        />
        <KpiCard
          label="Evaluaciones completas"
          value={loading ? '...' : d.evaluacionesCompletadas ?? 0}
          sub={loading ? '' : `Score promedio ${Number(d.scorePromedio || 0).toFixed(0)}`}
          accent={colors.doradoOscuro}
          icon={ShieldCheck}
        />
        <KpiCard
          label="Visitas hoy"
          value={loading ? '...' : k.gestionadas_hoy ?? d.visitasHoy ?? 0}
          sub={`${d.buroTotal ?? 0} consultas de buró`}
          accent={colors.teal}
          icon={BarChart3}
        />
      </div>

      <div className="panel-grid">
        <DistributionPanel title="Estados de cartera" data={d.estadoCartera} />
        <DistributionPanel title="Segmentos de cartera" data={d.segmentoCartera} />
        <DistributionPanel title="Estados de solicitudes" data={d.estadoSolicitudes} />
      </div>
    </>
  );
}

function DistributionPanel({ title, data = {} }) {
  const entries = Object.entries(data);
  const total = entries.reduce((sum, [, value]) => sum + value, 0);

  return (
    <div className="info-panel">
      <h2 className="section-title">{title}</h2>
      {entries.length === 0 ? (
        <p className="muted">Sin datos registrados.</p>
      ) : (
        <div className="stack" style={{ gap: 10 }}>
          {entries.map(([label, value]) => {
            const pct = total ? Math.round((value / total) * 100) : 0;
            return (
              <div key={label}>
                <div className="section-row" style={{ marginBottom: 4 }}>
                  <strong>{label}</strong>
                  <span className="muted">{value} · {pct}%</span>
                </div>
                <div style={{ height: 8, borderRadius: 999, background: 'var(--bp-rojo-suave)' }}>
                  <div
                    style={{
                      width: `${pct}%`,
                      height: '100%',
                      borderRadius: 999,
                      background: 'var(--bp-azul)',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
