import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  getSessionUser,
  signInAdvisor,
  signOutAdvisor,
  subscribeAuthChanges,
} from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const sessionUser = await getSessionUser();
      if (mounted) {
        setUser(sessionUser);
        setLoading(false);
      }
    })();
    const unsubscribe = subscribeAuthChanges((nextUser) => {
      if (mounted) setUser(nextUser);
    });
    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, []);

  const login = async (email, password) => {
    setError(null);
    const result = await signInAdvisor(email, password);
    if (!result.ok) {
      setError(result.error);
      return { ok: false, error: result.error };
    }
    setUser(result.user);
    return { ok: true };
  };

  const logout = async () => {
    await signOutAdvisor();
    setUser(null);
    setError(null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      login,
      logout,
      isAuthenticated: !!user,
      puedeAprobar: user?.rol === 'supervisor' || user?.rol === 'admin',
    }),
    [user, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
