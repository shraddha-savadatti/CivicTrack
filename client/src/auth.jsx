import { createContext, useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { api } from './api';
const Ctx = createContext(null); export const useAuth = () => useContext(Ctx);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); const [loading, setLoading] = useState(true);
  useEffect(() => { api('/auth/me').then(d => setUser(d.user)).catch(() => setUser(null)).finally(() => setLoading(false)); }, []);
  const login = async (email, password) => { const d = await api('/auth/login', { method: 'POST', body: { email, password } }); setUser(d.user); return d.user; };
  const register = async b => { const d = await api('/auth/register', { method: 'POST', body: b }); setUser(d.user); };
  const logout = async () => { await api('/auth/logout', { method: 'POST' }).catch(() => {}); setUser(null); };
  return <Ctx.Provider value={{ user, loading, login, register, logout }}>{children}</Ctx.Provider>;
}
export function Guard({ roles, children }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="p-8 text-center">Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}
