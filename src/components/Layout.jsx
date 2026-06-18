import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LiveClock } from './Ui';
import { navItems } from '../config/theme';
import { isSupabaseConfigured } from '../lib/supabase';

// RBAC: el supervisor puede aprobar/rechazar solicitudes (Criterio 4).
const USER = { name: 'Carlos Ramírez', role: 'Supervisor', rol: 'supervisor', initials: 'CR' };

export default function Layout() {
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      {!isSupabaseConfigured && (
        <div className="banner-config">
          Modo demo — Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env y ejecuta los
          scripts SQL en Supabase
        </div>
      )}

      <header className="top-bar">
        <div className="top-bar__brand">
          <div className="top-bar__logo">BP</div>
          <div>
            <div>Banco Pichincha</div>
            <div style={{ fontSize: '0.65rem', fontWeight: 500, opacity: 0.85 }}>
              CORE FINANCIERO · Fuerza de Ventas
            </div>
          </div>
        </div>
        <LiveClock />
        <div className="top-bar__user">
          <div className="top-bar__avatar">{USER.initials}</div>
          <div className="top-bar__user-info">
            <div className="top-bar__user-name">{USER.name}</div>
            <div className="top-bar__user-role">{USER.role}</div>
          </div>
        </div>
      </header>

      <nav className="nav-bar">
        {navItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `nav-bar__link${isActive ? ' nav-bar__link--active' : ''}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <main className="main-content">
        <Outlet context={{ user: USER, navigate }} />
      </main>
    </div>
  );
}
