import jwt from 'jsonwebtoken';
import { env } from '../config.js';
import { User } from '../models/index.js';
export const COOKIE = 'ct_token';
export const cookieOpts = () => ({ httpOnly: true, sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax', secure: env.NODE_ENV === 'production', maxAge: 7 * 864e5 });
export const signToken = u => jwt.sign({ sub: String(u._id) }, env.JWT_SECRET, { expiresIn: '7d' });
async function load(req) {
  const t = req.cookies?.[COOKIE]; if (!t) return null;
  try { const { sub } = jwt.verify(t, env.JWT_SECRET); const u = await User.findById(sub); return u?.active ? u : null; } catch { return null; }
}
export const optionalAuth = async (req, _res, next) => { req.user = await load(req); next(); };
export const requireAuth = async (req, res, next) => { req.user = await load(req); if (!req.user) return res.status(401).json({ error: 'Authentication required' }); next(); };
// Role is always read from the database, never from the client.
export const requireRole = (...roles) => (req, res, next) => roles.includes(req.user?.role) ? next() : res.status(403).json({ error: 'Forbidden' });
// CSRF defence: cookies + SameSite + CORS allow-list + required custom header on state-changing requests.
export const csrfGuard = (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  if (req.get('X-Requested-With') !== 'civictrack') return res.status(403).json({ error: 'Missing CSRF header' });
  next();
};
