import { useState, useEffect } from 'react';
import {
  MapPin,
  CheckCircle2,
  TrendingUp,
  FileText,
  Briefcase,
  Plus,
  Shield,
  Coins,
  BarChart3,
  ChevronRight,
} from 'lucide-react';

const iconMap = {
  briefcase: Briefcase,
  plus: Plus,
  shield: Shield,
  coins: Coins,
  file: FileText,
  chart: BarChart3,
};

export function LiveClock() {
  const [time, setTime] = useState(formatTime(new Date()));

  useEffect(() => {
    const id = setInterval(() => setTime(formatTime(new Date())), 1000);
    return () => clearInterval(id);
  }, []);

  return <span className="top-bar__clock">{time}</span>;
}

function formatTime(d) {
  return d.toLocaleTimeString('es-EC', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export function KpiCard({ label, value, sub, accent, icon: Icon }) {
  return (
    <div className="kpi-card" style={{ '--accent': accent }}>
      <div className="kpi-card__header">
        <div className="kpi-card__icon">
          <Icon size={20} />
        </div>
        <span className="kpi-card__label">{label}</span>
      </div>
      <div className="kpi-card__value">{value}</div>
      {sub && <div className="kpi-card__sub">{sub}</div>}
    </div>
  );
}

export function QuickCard({ title, desc, color, iconName, onClick }) {
  const Icon = iconMap[iconName] || Briefcase;
  return (
    <button type="button" className="quick-card" onClick={onClick}>
      <div className="quick-card__icon" style={{ background: color }}>
        <Icon size={22} color="#fff" />
      </div>
      <div className="quick-card__body">
        <div className="quick-card__title">{title}</div>
        <div className="quick-card__desc">{desc}</div>
      </div>
      <ChevronRight className="quick-card__arrow" size={20} />
    </button>
  );
}

export function KpiIcons() {
  return {
    MapPin,
    CheckCircle2,
    TrendingUp,
    FileText,
  };
}

export function SegmentBadge({ segmento }) {
  const s = (segmento || '').toUpperCase();
  const cls =
    s === 'PREMIER' ? 'badge--premier' : s === 'ESTANDAR' ? 'badge--estandar' : 'badge--basico';
  return <span className={`badge ${cls}`}>{segmento}</span>;
}

export function EstadoBadge({ estado }) {
  const e = (estado || '').toLowerCase();
  const cls =
    e === 'aprobado' || e === 'desembolsado'
      ? 'badge--aprobado'
      : e === 'enviado' || e === 'comite'
        ? 'badge--enviado'
        : 'badge--pendiente';
  return <span className={`badge ${cls}`}>{estado}</span>;
}

export function formatMoney(n) {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(n ?? 0);
}
