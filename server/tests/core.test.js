// Unit tests for pure logic. They do NOT need MongoDB. Integration tests are listed in README as not included.
import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import { makeTicketId, similarity, detectImage, publicReport } from '../src/lib/util.js';
test('ticket id format', () => assert.match(makeTicketId(), /^CT-\d{4}-\d{6}$/));
test('password hashing is salted and verifiable', async () => {
  const h = await bcrypt.hash('secret-pass-1', 10); assert.notEqual(h, 'secret-pass-1');
  assert.ok(await bcrypt.compare('secret-pass-1', h)); assert.ok(!await bcrypt.compare('wrong', h));
});
test('duplicate similarity', () => { assert.ok(similarity('big pothole on main road', 'pothole on the main road big') > 0.5); assert.ok(similarity('streetlight broken', 'garbage overflow') < 0.1); });
test('image validation uses magic bytes', () => {
  assert.equal(detectImage(Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(20)])).ext, 'jpg');
  assert.equal(detectImage(Buffer.from('<?php echo 1; ?> not an image')), null);
  assert.equal(detectImage(Buffer.from('GIF89a-----------')), null);
});
test('public report hides internal notes, reporter and actor ids', () => {
  const p = publicReport({ ticketId: 'CT-1', status: 'Submitted', reporter: 'u1', history: [
    { status: 'Submitted', note: 'public', actor: 'u9', actorRole: 'staff', internal: false }, { status: 'Submitted', note: 'SECRET', actor: 'u9', actorRole: 'staff', internal: true }] });
  const s = JSON.stringify(p); assert.ok(!s.includes('SECRET')); assert.ok(!s.includes('u1')); assert.ok(!s.includes('u9')); assert.equal(p.history.length, 1);
});
