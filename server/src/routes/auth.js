import { Router } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { User } from '../models/index.js';
import { COOKIE, cookieOpts, signToken, requireAuth } from '../middleware/auth.js';
const r = Router();
const limiter = rateLimit({ windowMs: 15 * 60e3, limit: 30, standardHeaders: true, legacyHeaders: false });
const safe = u => ({ id: u._id, name: u.name, email: u.email, role: u.role, department: u.department });
const reg = z.object({ name: z.string().trim().min(2).max(80), email: z.string().email(), password: z.string().min(8).max(100) });
r.post('/register', limiter, async (req, res) => {
  const p = reg.safeParse(req.body); if (!p.success) return res.status(400).json({ error: 'Invalid input', details: p.error.flatten().fieldErrors });
  if (await User.exists({ email: p.data.email.toLowerCase() })) return res.status(409).json({ error: 'Email already registered' });
  // role is forced to citizen; any client-supplied role is ignored.
  const u = await User.create({ name: p.data.name, email: p.data.email, passwordHash: await bcrypt.hash(p.data.password, 12), role: 'citizen' });
  res.cookie(COOKIE, signToken(u), cookieOpts()).status(201).json({ user: safe(u) });
});
r.post('/login', limiter, async (req, res) => {
  const p = z.object({ email: z.string().email(), password: z.string().min(1) }).safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: 'Invalid input' });
  const u = await User.findOne({ email: p.data.email.toLowerCase() }).select('+passwordHash');
  const ok = u && u.active && await bcrypt.compare(p.data.password, u.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid email or password' });
  res.cookie(COOKIE, signToken(u), cookieOpts()).json({ user: safe(u) });
});
r.post('/logout', (_req, res) => res.clearCookie(COOKIE, { ...cookieOpts(), maxAge: undefined }).json({ ok: true }));
r.get('/me', requireAuth, (req, res) => res.json({ user: safe(req.user) }));
export default r;
