import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SUPERVISOR_EMAIL = 'supervisor@pichincha.com';
const SUPERVISOR_PASS = 'Docente2025!';

export default function LoginPage() {
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState(null);

  if (!loading && isAuthenticated) {
    const redirect = location.state?.from || '/';
    return <Navigate to={redirect} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setLocalError(null);
    const result = await login(email.trim(), password);
    setBusy(false);
    if (result.ok) {
      navigate(location.state?.from || '/', { replace: true });
    } else {
      setLocalError(result.error || 'No se pudo iniciar sesión.');
    }
  };

  const fillSupervisor = () => {
    setEmail(SUPERVISOR_EMAIL);
    setPassword(SUPERVISOR_PASS);
  };

  const displayError = localError;

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__brand">
          <div className="login-card__logo">BP</div>
          <div>
            <h1>Fuerza de Ventas Web</h1>
            <p>Banco Pichincha · Panel supervisor</p>
          </div>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            Correo electrónico
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="supervisor@pichincha.com"
              required
              autoComplete="username"
            />
          </label>
          <label>
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </label>

          {displayError && <div className="login-form__error">{displayError}</div>}

          <button type="submit" className="login-form__submit" disabled={busy}>
            {busy ? 'Ingresando…' : 'Ingresar como supervisor'}
          </button>

          <button type="button" className="login-form__secondary" onClick={fillSupervisor}>
            Rellenar credenciales demo
          </button>
        </form>

        <div className="login-card__hint">
          <strong>Supervisor (web)</strong>
          <span>{SUPERVISOR_EMAIL}</span>
          <span>{SUPERVISOR_PASS}</span>
          <p className="login-card__note">
            Usuario creado en Supabase Auth + script <code>03_usuarios_demo_docente.sql</code>
          </p>
        </div>
      </div>
    </div>
  );
}
