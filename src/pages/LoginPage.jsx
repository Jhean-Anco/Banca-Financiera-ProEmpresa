import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
    setEmail('supervisor@proempresa.com');
    setPassword('Docente2025!');
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__brand">
          <img src="/logo.png" alt="Financiera ProEmpresa" className="login-card__mark" />
          <div>
            <h1>ProEmpresa Ventas</h1>
            <p>Panel supervisor de fuerza de ventas</p>
          </div>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            Correo electrónico
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="supervisor@proempresa.com"
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

          {localError && <div className="login-form__error">{localError}</div>}

          <button type="submit" className="login-form__submit" disabled={busy}>
            {busy ? 'Ingresando...' : 'Ingresar al panel'}
          </button>

          <button type="button" className="login-form__secondary" onClick={fillSupervisor}>
            Usar credenciales demo
          </button>
        </form>

        <div className="login-card__hint">
          <strong>Acceso supervisor</strong>
          <span>supervisor@proempresa.com</span>
          <span>Docente2025!</span>
        </div>
      </div>
    </div>
  );
}
