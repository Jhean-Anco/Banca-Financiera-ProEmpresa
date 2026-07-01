import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LiveClock } from './Ui';
import { navItems } from '../config/theme';
import { isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const navigate = useNavigate();
  const { user, logout, puedeAprobar } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="app-shell">
      {!isSupabaseConfigured && (
        <div className="banner-config">
          Modo demo: configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env y ejecuta los
          scripts SQL en Supabase
        </div>
      )}

      <header className="top-bar">
        <div className="top-bar__brand">
          <img src="/logo.png" alt="Financiera ProEmpresa" className="top-bar__brand-mark" />
          <div>
            <div>Financiera ProEmpresa</div>
            <div className="top-bar__brand-subtitle">Fuerza de ventas institucional</div>
          </div>
        </div>
        <LiveClock />
        <div className="top-bar__user">
          <div className="top-bar__avatar">{user?.initials ?? 'FV'}</div>
          <div className="top-bar__user-info">
            <div className="top-bar__user-name">{user?.name ?? 'Usuario'}</div>
            <div className="top-bar__user-role">
              {user?.role ?? '-'}
              {!puedeAprobar && ' · sin permiso de aprobación'}
            </div>
          </div>
          <button type="button" className="top-bar__logout" onClick={handleLogout} title="Cerrar sesión">
            Salir
          </button>
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
        <Outlet context={{ user, navigate, puedeAprobar }} />
      </main>
    </div>
  );
}
