import { randomInt } from 'node:crypto';
export const CATEGORIES = ['Roads and potholes','Streetlights','Garbage and sanitation','Water supply','Drainage','Parks and public facilities','Traffic signals','Public safety','Other civic issues'];
export const STATUSES = ['Submitted','Under Review','In Progress','Resolved'];
export const PRIORITIES = ['Low','Medium','High','Urgent'];
export const makeTicketId = () => `CT-${new Date().getFullYear()}-${randomInt(100000, 999999)}`;
const tok = s => new Set(String(s).toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2));
export function similarity(a, b) { const A = tok(a), B = tok(b); if (!A.size || !B.size) return 0; let n = 0; for (const w of A) if (B.has(w)) n++; return n / (A.size + B.size - n); }
// Magic-byte check: never trust client MIME type.
export function detectImage(buf) {
  if (!buf || buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { ext: 'jpg', mime: 'image/jpeg' };
  if (buf.subarray(0, 8).equals(Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]))) return { ext: 'png', mime: 'image/png' };
  if (buf.subarray(0, 4).toString() === 'RIFF' && buf.subarray(8, 12).toString() === 'WEBP') return { ext: 'webp', mime: 'image/webp' };
  return null;
}
// Public-safe view: no reporter identity, no internal notes, no actor ids.
export function publicReport(r) {
  const o = r.toObject ? r.toObject() : r;
  return {
    ticketId: o.ticketId, title: o.title, description: o.description, category: o.category, location: o.location,
    landmark: o.landmark, ward: o.ward, priority: o.priority, status: o.status, department: o.department,
    image: o.image, resolution: o.status === 'Resolved' ? o.resolution : undefined, isDemo: !!o.isDemo,
    createdAt: o.createdAt, updatedAt: o.updatedAt,
    history: (o.history || []).filter(h => !h.internal).map(h => ({ status: h.status, note: h.note, by: h.actorRole === 'citizen' ? 'Reporter' : 'Municipal staff', at: h.at })),
  };
}
export const staffReport = r => { const o = r.toObject ? r.toObject() : r; return { ...o, reporter: o.anonymous ? undefined : o.reporter, _id: undefined, __v: undefined }; };
