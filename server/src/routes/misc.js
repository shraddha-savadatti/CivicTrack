import { Router } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import mongoose from 'mongoose';
import { User, Report, Abuse } from '../models/index.js';
import { requireAuth, requireRole, optionalAuth } from '../middleware/auth.js';
export const analytics = Router(); export const admin = Router(); export const abuse = Router();
// Aggregate-only: no names, emails, descriptions, or exact addresses leave this endpoint.
analytics.get('/analytics', async (_req, res) => {
  const [o] = await Report.aggregate([{ $facet: {
    total: [{ $count: 'n' }], byStatus: [{ $group: { _id: '$status', n: { $sum: 1 } } }],
    byCategory: [{ $group: { _id: '$category', n: { $sum: 1 } } }, { $sort: { n: -1 } }],
    byWard: [{ $group: { _id: '$ward', total: { $sum: 1 }, resolved: { $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] } } } }, { $sort: { total: -1 } }],
    demo: [{ $match: { isDemo: true } }, { $count: 'n' }] } }]);
  const s = Object.fromEntries(o.byStatus.map(x => [x._id, x.n])); const total = o.total[0]?.n || 0; const resolved = s.Resolved || 0;
  res.json({ total, open: total - resolved, inProgress: s['In Progress'] || 0, resolved, resolutionRate: total ? Math.round(resolved / total * 100) : 0,
    byStatus: o.byStatus.map(x => ({ status: x._id, count: x.n })), byCategory: o.byCategory.map(x => ({ category: x._id, count: x.n })),
    byWard: o.byWard.map(x => ({ ward: x._id, total: x.total, resolved: x.resolved })), demoRecords: o.demo[0]?.n || 0,
    note: 'Includes clearly labelled demonstration records; not real municipal data.' });
});
analytics.get('/health', (_req, res) => res.json({ ok: true, db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }));
const adminOnly = [requireAuth, requireRole('admin')];
admin.post('/staff', ...adminOnly, async (req, res) => {
  const p = z.object({ name: z.string().trim().min(2).max(80), email: z.string().email(), password: z.string().min(10).max(100), department: z.string().trim().max(80).optional() }).safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: 'Invalid input', details: p.error.flatten().fieldErrors });
  if (await User.exists({ email: p.data.email.toLowerCase() })) return res.status(409).json({ error: 'Email already registered' });
  const u = await User.create({ name: p.data.name, email: p.data.email, department: p.data.department, role: 'staff', passwordHash: await bcrypt.hash(p.data.password, 12) });
  res.status(201).json({ user: { id: u._id, name: u.name, email: u.email, role: u.role, department: u.department } });
});
admin.get('/users', ...adminOnly, async (_req, res) => res.json({ users: await User.find({ role: { $ne: 'citizen' } }).select('name email role department active') }));
admin.patch('/users/:id/active', ...adminOnly, async (req, res) => {
  const p = z.object({ active: z.boolean() }).safeParse(req.body); if (!p.success) return res.status(400).json({ error: 'Invalid input' });
  if (String(req.user._id) === req.params.id) return res.status(400).json({ error: 'Cannot change your own access' });
  const u = await User.findOneAndUpdate({ _id: req.params.id, role: { $ne: 'citizen' } }, { active: p.data.active }, { new: true }).catch(() => null);
  u ? res.json({ ok: true }) : res.status(404).json({ error: 'User not found' });
});
const lim = rateLimit({ windowMs: 60 * 60e3, limit: 10, standardHeaders: true, legacyHeaders: false });
abuse.post('/', optionalAuth, lim, async (req, res) => {
  const p = z.object({ ticketId: z.string().min(3).max(30), reason: z.string().trim().min(5).max(500) }).safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: 'Invalid input' });
  if (!await Report.exists({ ticketId: p.data.ticketId.toUpperCase() })) return res.status(404).json({ error: 'Ticket not found' });
  await Abuse.create({ ...p.data, ticketId: p.data.ticketId.toUpperCase(), reportedBy: req.user?._id }); res.status(201).json({ ok: true });
});
abuse.get('/', requireAuth, requireRole('staff', 'admin'), async (_req, res) => res.json({ items: await Abuse.find({ resolved: false }).sort('-createdAt').limit(100) }));
abuse.patch('/:id', requireAuth, requireRole('staff', 'admin'), async (req, res) => {
  const p = z.object({ action: z.string().trim().max(300).optional() }).safeParse(req.body);
  const a = await Abuse.findByIdAndUpdate(req.params.id, { resolved: true, action: p.data?.action }, { new: true }).catch(() => null);
  a ? res.json({ item: a }) : res.status(404).json({ error: 'Not found' });
});
