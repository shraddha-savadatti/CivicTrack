import { Router } from 'express';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { randomBytes } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { env } from '../config.js';
import { Report, User } from '../models/index.js';
import { requireAuth, optionalAuth, requireRole } from '../middleware/auth.js';
import { CATEGORIES, STATUSES, PRIORITIES, makeTicketId, similarity, detectImage, publicReport, staffReport } from '../lib/util.js';
export const UPLOAD_DIR = path.resolve('uploads');
const r = Router();
const up = multer({ storage: multer.memoryStorage(), limits: { fileSize: env.UPLOAD_MAX_MB * 1024 * 1024, files: 1 } });
const createLimiter = rateLimit({ windowMs: 60 * 60e3, limit: 20, standardHeaders: true, legacyHeaders: false });
const staffOnly = [requireAuth, requireRole('staff', 'admin')];
const createSchema = z.object({
  title: z.string().trim().min(5).max(120), description: z.string().trim().min(10).max(2000), category: z.enum(CATEGORIES),
  location: z.string().trim().min(3).max(200), landmark: z.string().trim().max(120).optional(), ward: z.string().trim().min(1).max(40),
  priority: z.enum(PRIORITIES).default('Medium'), anonymous: z.preprocess(v => v === true || v === 'true', z.boolean()).default(false),
});
async function findDuplicates({ category, ward, title, description }) {
  const since = new Date(Date.now() - 30 * 864e5);
  const cands = await Report.find({ category, ward, createdAt: { $gte: since }, status: { $ne: 'Resolved' } }).limit(50);
  return cands.map(c => ({ ticketId: c.ticketId, title: c.title, score: similarity(`${title} ${description || ''}`, `${c.title} ${c.description}`) }))
    .filter(x => x.score >= 0.25).sort((a, b) => b.score - a.score).slice(0, 3);
}
r.get('/duplicates', async (req, res) => {
  const p = z.object({ category: z.enum(CATEGORIES), ward: z.string().min(1), title: z.string().min(3), description: z.string().optional() }).safeParse(req.query);
  if (!p.success) return res.json({ duplicates: [] });
  res.json({ duplicates: await findDuplicates(p.data) });
});
r.post('/', requireAuth, createLimiter, up.single('image'), async (req, res) => {
  const p = createSchema.safeParse(req.body); if (!p.success) return res.status(400).json({ error: 'Invalid input', details: p.error.flatten().fieldErrors });
  let image;
  if (req.file) {
    const t = detectImage(req.file.buffer); if (!t) return res.status(400).json({ error: 'Only JPEG, PNG or WebP images are allowed' });
    image = `${randomBytes(16).toString('hex')}.${t.ext}`; // generated name: no user-controlled path
    await writeFile(path.join(UPLOAD_DIR, image), req.file.buffer);
  }
  const duplicates = await findDuplicates(p.data);
  for (let i = 0; i < 5; i++) {
    try {
      const doc = await Report.create({ ...p.data, image, ticketId: makeTicketId(), reporter: req.user._id,
        history: [{ status: 'Submitted', note: 'Report submitted', actor: req.user._id, actorRole: 'citizen' }] });
      return res.status(201).json({ ticketId: doc.ticketId, report: publicReport(doc), possibleDuplicates: duplicates });
    } catch (e) { if (e.code !== 11000) throw e; }
  }
  res.status(500).json({ error: 'Could not generate ticket ID' });
});
const pageOf = q => ({ page: Math.max(1, +q.page || 1), limit: Math.min(50, Math.max(1, +q.limit || 20)) });
r.get('/mine', requireAuth, async (req, res) => {
  const { page, limit } = pageOf(req.query); const f = { reporter: req.user._id };
  if (STATUSES.includes(req.query.status)) f.status = req.query.status;
  if (CATEGORIES.includes(req.query.category)) f.category = req.query.category;
  const [items, total] = await Promise.all([Report.find(f).sort('-createdAt').skip((page - 1) * limit).limit(limit), Report.countDocuments(f)]);
  res.json({ items: items.map(publicReport), total, page, limit });
});
r.get('/', ...staffOnly, async (req, res) => {
  const { page, limit } = pageOf(req.query); const f = {};
  if (STATUSES.includes(req.query.status)) f.status = req.query.status;
  if (CATEGORIES.includes(req.query.category)) f.category = req.query.category;
  if (req.query.ticket) f.ticketId = String(req.query.ticket).toUpperCase().trim();
  const [items, total] = await Promise.all([Report.find(f).sort('-createdAt').skip((page - 1) * limit).limit(limit), Report.countDocuments(f)]);
  res.json({ items: items.map(staffReport), total, page, limit });
});
r.get('/:ticketId', optionalAuth, async (req, res) => {
  const d = await Report.findOne({ ticketId: req.params.ticketId.toUpperCase() });
  if (!d) return res.status(404).json({ error: 'Ticket not found' });
  res.json({ report: ['staff', 'admin'].includes(req.user?.role) ? staffReport(d) : publicReport(d) });
});
const find = async (req, res) => { const d = await Report.findOne({ ticketId: req.params.ticketId.toUpperCase() }); if (!d) res.status(404).json({ error: 'Ticket not found' }); return d; };
const entry = (req, d, note, internal = false) => ({ status: d.status, note, internal, actor: req.user._id, actorRole: req.user.role });
r.patch('/:ticketId/status', ...staffOnly, async (req, res, next) => {
  try {
    const p = z.object({ status: z.enum(STATUSES), note: z.string().trim().max(1000).optional(), internal: z.boolean().default(false), resolution: z.string().trim().max(1000).optional() }).safeParse(req.body);
    if (!p.success) return res.status(400).json({ error: 'Invalid input' });
    if (p.data.status === 'Resolved' && !p.data.resolution) return res.status(400).json({ error: 'Resolution details required' });
    const d = await find(req, res); if (!d) return;
    d.status = p.data.status; if (p.data.resolution) d.resolution = p.data.resolution;
    d.history.push(entry(req, d, p.data.note || `Status changed to ${p.data.status}`, p.data.internal));
    await d.save(); res.json({ report: staffReport(d) });
  } catch (e) {
    if (e.name === 'ValidationError') return res.status(400).json({ error: e.message });
    next(e);
  }
});
r.patch('/:ticketId/assign', ...staffOnly, async (req, res, next) => {
  try {
    const p = z.object({ department: z.string().trim().min(2).max(80), staffId: z.string().optional() }).safeParse(req.body);
    if (!p.success) return res.status(400).json({ error: 'Invalid input' });
    const d = await find(req, res); if (!d) return;
    if (p.data.staffId) { const s = await User.findOne({ _id: p.data.staffId, role: { $in: ['staff', 'admin'] } }).catch(() => null); if (!s) return res.status(400).json({ error: 'Unknown staff member' }); d.assignedTo = s._id; }
    d.department = p.data.department; d.history.push(entry(req, d, `Assigned to ${p.data.department}`));
    await d.save(); res.json({ report: staffReport(d) });
  } catch (e) {
    if (e.name === 'ValidationError') return res.status(400).json({ error: e.message });
    next(e);
  }
});
r.patch('/:ticketId/priority', ...staffOnly, async (req, res, next) => {
  try {
    const p = z.object({ priority: z.enum(PRIORITIES) }).safeParse(req.body); if (!p.success) return res.status(400).json({ error: 'Invalid input' });
    const d = await find(req, res); if (!d) return;
    d.priority = p.data.priority; d.history.push(entry(req, d, `Priority set to ${p.data.priority}`, true));
    await d.save(); res.json({ report: staffReport(d) });
  } catch (e) {
    if (e.name === 'ValidationError') return res.status(400).json({ error: e.message });
    next(e);
  }
});
export default r;
