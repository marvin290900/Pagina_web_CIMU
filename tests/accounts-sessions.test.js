import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';
import { couch } from '../src/lib/couchDB.js';
import { changePolicy } from '../src/lib/security/store.js';
import { createAccount, activateAccount, updateAccount, resetAccess } from '../src/lib/security/accounts.js';
import { authenticateUser } from '../src/lib/auth.js';
import { createSession, validateSession } from '../src/lib/session.js';
import { limitAttempts } from '../src/lib/security/rateLimit.js';
import { preparePolicy, migrate } from '../scripts/migrate-access.js';
import { memoryCouch } from './helpers/memory-couch.js';
const admin = { id:'admin', email:'admin@example.com', name:'Admin', status:'active', authVersion:1, assignments:[{ role:'administrador', modules:[], sections:[] }] };
function fixture(extra = {}) { return memoryCouch({ 'users/security-policy': { _id:'security-policy', _rev:'1-test', accounts:{ admin: structuredClone(admin), ...extra } } }); }
function install(db) { const originals = {}; for (const method of ['get','put','post','delete']) { originals[method] = couch[method]; couch[method] = db[method]; } return () => Object.assign(couch, originals); }
test('only administrator cannot be disabled and concurrent demotions preserve one admin', async () => {
  const db = fixture();
  await assert.rejects(changePolicy(p => { p.accounts.admin.status = 'disabled'; }, db), /administrador activo/);
  const second = { ...admin, id:'second' };
  const concurrent = fixture({ second });
  const results = await Promise.allSettled(['admin','second'].map(id => changePolicy(p => { p.accounts[id].status = 'disabled'; }, concurrent)));
  assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
  assert.equal(Object.values(concurrent.records.get('users/security-policy').accounts).filter(a => a.status === 'active').length, 1);
});
test('create, activate, login, roles, revocation and one-use setup are integrated', async () => {
  const db = fixture(), restore = install(db);
  try {
    const input = { name:'Colaboradora', email:'writer@example.com', assignments:[{ role:'colaborador', modules:['gaceta'], sections:['opinion'] }] };
    const created = await createAccount(input, admin);
    assert.equal(created.user.status, 'invited');
    assert(!('passwordHash' in created.user));
    assert.equal(created.setupToken.length, 43);
    await assert.rejects(createAccount(input, admin), /correo ya/);
    await activateAccount(created.user.id, created.setupToken, 'Una contraseña privada 2026');
    await assert.rejects(activateAccount(created.user.id, created.setupToken, 'Otra contraseña privada 2026'), /inválido/);
    const user = await authenticateUser(input.email, 'Una contraseña privada 2026');
    assert.equal(user.assignments[0].role, 'colaborador');
    assert.equal(await authenticateUser(input.email, 'incorrecta'), null);
    const { token } = await createSession(user, db);
    assert(!JSON.stringify([...db.records.values()]).includes(token));
    assert.equal((await validateSession(token, db)).user.id, user.id);
    await updateAccount(user.id, { name:user.name, status:'disabled', assignments:user.assignments, version:user.authVersion }, admin);
    assert.equal((await validateSession(token, db)).user, null);
    assert.equal(await authenticateUser(input.email, 'Una contraseña privada 2026'), null);
  } finally { restore(); }
});
test('session expires, rejects legacy tokens and respects absolute expiration', async () => {
  const db = fixture();
  const credentialVersion = randomUUID();
  await db.put('/users/admin', { _id:'admin', passwordHash:await bcrypt.hash('Secret phrase for admin', 4), credentialVersion });
  const { token } = await createSession({ ...admin, credentialVersion }, db);
  const before = await validateSession(token, db);
  assert(before.user);
  assert.equal((await validateSession('legacy-uuid', db)).user, null);
  assert.equal((await validateSession(token, db, Date.now() + 8 * 24 * 3600_000)).user, null);
  const renewed = await validateSession(token, db, Date.now() + 13 * 3600_000);
  assert(Date.parse(renewed.session.expiresAt) > Date.parse(before.session.expiresAt));
});
test('credential reset invalidates sessions even if policy update already succeeded', async () => {
  const db = fixture(), restore = install(db);
  try {
    const credentialVersion = randomUUID();
    await db.put('/users/admin', { _id:'admin', passwordHash:await bcrypt.hash('Admin private password',4), credentialVersion });
    const { token } = await createSession({ ...admin, credentialVersion },db);
    assert((await validateSession(token,db)).user);
    const setup = await resetAccess('admin',admin);
    assert.equal((await validateSession(token,db)).user,null);
    assert.equal(setup.length,43);
  } finally { restore(); }
});
test('persistent attempt limiter denies excess and shares concurrent counts', async () => {
  const db = memoryCouch();
  await Promise.all([1,2,3].map(() => limitAttempts('account', 3, db, 1000)));
  await assert.rejects(limitAttempts('account',3,db,1000), /Demasiados/);
  await assert.doesNotReject(limitAttempts('account',3,db,16*60_000));
});
test('migration is dry by default, repeatable, and refuses normalized duplicates', async () => {
  const legacy = { _id:'admin', _rev:'1-test', email:'Admin@Example.COM', passwordHash:'legacyhash', isAdmin:true };
  const db = memoryCouch({ 'users/admin':legacy, 'cimu-gaceta-opinion/n': { _id:'n', _rev:'1-test', estado:'activo' } });
  const dry = await migrate({ db }); assert.equal(dry.pendingNews,1); assert(!db.records.has('users/security-policy'));
  await assert.rejects(migrate({ db, apply:true }), /legacy-active/);
  await migrate({ db, apply:true, confirmActive:true });
  assert.equal(db.records.get('cimu-gaceta-opinion/n').editorialStatus,'publicado');
  assert.equal((await migrate({ db, apply:true, confirmActive:true })).pendingNews,0);
  assert.equal(db.records.get('users/security-policy').accounts.admin.assignments.length,2);
  assert.throws(() => preparePolicy([legacy,{ ...legacy,_id:'other',email:'admin@example.com' }]), /duplicados/);
});
