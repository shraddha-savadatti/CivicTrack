import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import { env } from './config.js';
import { csrfGuard } from './middleware/auth.js';
import auth from './routes/auth.js';
import reports from './routes/reports.js';
import { analytics, admin, abuse } from './routes/misc.js';
const app = express();
app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: '50kb' })); app.use(cookieParser());
app.use('/api', rateLimit({ windowMs: 60e3, limit: 200, standardHeaders: true, legacyHeaders: false }), csrfGuard);
// Uploads: only generated filenames (hex + allowed ext) are servable; dotfiles/traversal rejected.
app.get('/uploads/:name', (req, res) => {
  if (!/^[a-f0-9]{32}\.(jpg|png|webp)$/.test(req.params.name)) return res.status(404).end();
  res.sendFile(path.resolve('uploads', req.params.name), { dotfiles: 'deny' });
});
app.use('/api/auth', auth); app.use('/api/reports', reports); app.use('/api/admin', admin); app.use('/api/abuse', abuse); app.use('/api', analytics);
app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, _req, res, _next) => {
  if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: `Image exceeds ${env.UPLOAD_MAX_MB} MB` });
  console.error('Error:', err.message); // no stack/body logged
  res.status(500).json({ error: 'Internal server error' });
});
export default app;
