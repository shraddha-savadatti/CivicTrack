// Usage: npm run seed            -> demo reports only (idempotent, tagged isDemo)
//        npm run seed -- --accounts -> also demo citizen/staff (development only; needs DEMO_PASSWORD)
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from './config.js';
import { Report, User } from './models/index.js';
await mongoose.connect(env.MONGODB_URI);
if (process.argv.includes('--accounts')) {
  if (env.NODE_ENV === 'production') { console.error('Refusing to create demo accounts in production'); process.exit(1); }
  if (!env.DEMO_PASSWORD || env.DEMO_PASSWORD.length < 10) { console.error('Set DEMO_PASSWORD (10+ chars) in .env'); process.exit(1); }
  const passwordHash = await bcrypt.hash(env.DEMO_PASSWORD, 12);
  for (const [name, email, role, department] of [['Demo Citizen', 'citizen@demo.civictrack.test', 'citizen'], ['Demo Staff', 'staff@demo.civictrack.test', 'staff', 'Public Works'], ['Demo Admin', 'admin@demo.civictrack.test', 'admin']])
    await User.updateOne({ email }, { $setOnInsert: { name, email, role, department, passwordHash } }, { upsert: true });
  console.log('Demo accounts ready: citizen@/staff@/admin@demo.civictrack.test (password = DEMO_PASSWORD)');
}
const C = ['Roads and potholes','Streetlights','Garbage and sanitation','Water supply','Drainage','Parks and public facilities','Traffic signals','Public safety','Other civic issues'];
const S = ['Submitted','Under Review','In Progress','Resolved'], P = ['Low','Medium','High','Urgent'];
const titles = ['Large pothole near market','Streetlight not working','Overflowing garbage bin','Low water pressure','Blocked storm drain','Broken bench in park','Signal stuck on red','Unsafe open manhole','Fallen tree branch'];
for (let i = 0; i < 27; i++) {
  const status = S[i % 4], at = new Date(Date.now() - (i + 1) * 864e5 * 1.5);
  const history = [{ status: 'Submitted', note: 'Report submitted (demo)', actorRole: 'citizen', at }];
  if (i % 4 > 0) history.push({ status: S[i % 4], note: `Status: ${S[i % 4]} (demo)`, actorRole: 'staff', at: new Date(+at + 36e5) });
  await Report.updateOne({ ticketId: `CT-DEMO-${String(i + 1).padStart(3, '0')}` }, { $setOnInsert: {
    ticketId: `CT-DEMO-${String(i + 1).padStart(3, '0')}`, title: `${titles[i % 9]} [DEMO]`, description: 'Demonstration record. Not a real municipal report.',
    category: C[i % 9], location: `Sample Road ${i + 1}`, ward: `Ward ${(i % 6) + 1}`, priority: P[i % 4], status, anonymous: true, isDemo: true,
    resolution: status === 'Resolved' ? 'Demo resolution note' : undefined, history, createdAt: at, updatedAt: at } }, { upsert: true, timestamps: false });
}
console.log('Demo reports ensured (27). Re-running is safe.'); await mongoose.disconnect();
