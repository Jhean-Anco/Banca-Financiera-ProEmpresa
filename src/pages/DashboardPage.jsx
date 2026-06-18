import { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { MapPin, CheckCircle2, TrendingUp, FileText } from 'lucide-react';
import { KpiCard, QuickCard, formatMoney } from '../components/Ui';
import { colors, quickAccess } from '../config/theme';
import { fetchDashboardKpis } from '../lib/supabase';

export default function DashboardPage() {
  const { user, navigate } = useOutletContext();
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardKpis().then((data) => {
      setKpis(data);
      setLoading(false);
    });
  }, []);

  const k = kpis ?? {};

  return (
    <>
      <div className="page-greeting">
        <h1>Hola, {user.name.split(' ')[0]}</h1>
        <p>Este es el resumen de tu jornada en campo</p>
      </div>

      <div className="kpi-grid">
        <KpiCard
          label="Visitas pendientes"
          value={loading ? '…' : k.visitas_pendientes ?? 0}
          sub={`de ${k.visitas_total_cartera ?? 0} en cartera`}
          accent="#DC2626"
          icon={MapPin}
        />
        <KpiCard
          label="Gestionadas hoy"
          value={loading ? '…' : k.gestionadas_hoy ?? 0}
          sub="visitas registradas"
          accent={colors.teal}
          icon={CheckCircle2}
        />
        <KpiCard
          label="Monto en cartera"
          value={loading ? '…' : formatMoney(k.monto_cartera)}
          sub="colocación gestionada"
          accent={colors.naranja}
          icon={TrendingUp}
        />
        <KpiCard
          label="Solicitudes aprobadas"
          value={loading ? '…' : k.solicitudes_aprobadas ?? 0}
          sub={`de ${k.solicitudes_mes ?? 0} este mes`}
          accent={colors.morado}
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
    </>
  );
}
