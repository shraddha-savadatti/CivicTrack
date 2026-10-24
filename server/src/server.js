import mongoose from 'mongoose';
import { mkdirSync } from 'node:fs';
import { env } from './config.js';
import app from './app.js';
mkdirSync('uploads', { recursive: true });
try { await mongoose.connect(env.MONGODB_URI); console.log('MongoDB connected'); }
catch (e) { console.error('MongoDB connection failed:', e.message); process.exit(1); }
app.listen(env.PORT, () => console.log(`CivicTrack API on :${env.PORT}`));
