import mongoose from 'mongoose';
import { CATEGORIES, STATUSES, PRIORITIES } from '../lib/util.js';
const { Schema } = mongoose;
export const User = mongoose.model('User', new Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['citizen', 'staff', 'admin'], default: 'citizen' },
  department: String, active: { type: Boolean, default: true },
}, { timestamps: true }));
const history = new Schema({
  status: { type: String, enum: STATUSES }, note: { type: String, maxlength: 1000 }, internal: { type: Boolean, default: false },
  actor: { type: Schema.Types.ObjectId, ref: 'User' }, actorRole: String, at: { type: Date, default: Date.now },
}, { _id: false });
const report = new Schema({
  ticketId: { type: String, unique: true, required: true },
  title: { type: String, required: true, maxlength: 120 }, description: { type: String, required: true, maxlength: 2000 },
  category: { type: String, enum: CATEGORIES, required: true }, location: { type: String, required: true, maxlength: 200 },
  landmark: { type: String, maxlength: 120 }, ward: { type: String, required: true, maxlength: 40 },
  priority: { type: String, enum: PRIORITIES, default: 'Medium' }, status: { type: String, enum: STATUSES, default: 'Submitted' },
  reporter: { type: Schema.Types.ObjectId, ref: 'User' }, anonymous: { type: Boolean, default: false },
  image: String, department: String, assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  resolution: String, history: [history], isDemo: { type: Boolean, default: false },
}, { timestamps: true });
report.index({ status: 1, createdAt: -1 }); report.index({ category: 1, ward: 1, createdAt: -1 }); report.index({ reporter: 1 });
export const Report = mongoose.model('Report', report);
export const Abuse = mongoose.model('Abuse', new Schema({
  ticketId: { type: String, required: true, index: true }, reason: { type: String, required: true, maxlength: 500 },
  reportedBy: { type: Schema.Types.ObjectId, ref: 'User' }, resolved: { type: Boolean, default: false }, action: String,
}, { timestamps: true }));
