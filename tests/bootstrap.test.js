import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcrypt';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { bootstrap, enabled, waitForCouch, SetupError, setupErrorMessage } from '../scripts/bootstrap.js';
import { DATABASES } from '../src/lib/security/databases.js';
import { can } from '../src/lib/security/roles.js';
import { demoDocuments, demoPdf, writeDemoFiles } from '../scripts/demo-data.js';
import { bookSchema } from '../src/lib/security/catalog.js';
import { newsSchema } from '../src/lib/security/editorial.js';
import { initializationCouch } from './helpers/initialization-couch.js';
const env = { CIMU_ADMIN_EMAIL: 'ADMIN@example.test ', CIMU_ADMIN_NAME: 'Administración de prueba', CIMU_ADMIN_PASSWORD: 'Prueba inicial privada 2026', CIMU_SEED_DEMO: 'false' };
const noFiles = async () => {};

test('empty installation creates databases, configuration and an active administrator with editorial access', async () => {
  const db = initializationCouch();
  const result = await bootstrap({ db, env, files: noFiles });
  assert.equal(result.status, 'initialized');
  assert.deepEqual([...db.databases].sort(), [...DATABASES].sort());
  assert.equal(db.indexes.size, 3);
  const policy = db.records.get('users/security-policy');
  const account = Object.values(policy.accounts)[0];
  assert.equal(account.email, 'admin@example.test');
  assert.equal(account.status, 'active');
  assert(can(account, 'users.create'));
  assert(can(account, 'gaceta.publish', { section: 'opinion' }));
  assert(can(account, 'libros.create'));
  assert(can(account, 'investigadores.manage'));
  const credential = db.records.get(`users/${account.id}`);
  assert(await bcrypt.compare(env.CIMU_ADMIN_PASSWORD, credential.passwordHash));
  assert.equal(credential.passwordHash.split('$')[2], '12');
  assert(!JSON.stringify([...db.records]).includes(env.CIMU_ADMIN_PASSWORD));
  assert.equal(db.records.get('app_meta/installation').status, 'completed');
  assert.deepEqual(db.records.get('cimu-gaceta/publicacion_del_dia').publicaciones, []);
});

test('restart preserves credentials, roles and modified data even with different or missing bootstrap settings', async () => {
  const db = initializationCouch();
  await bootstrap({ db, env: { ...env, CIMU_SEED_DEMO: 'true' }, files: noFiles });
  const original = JSON.stringify([...db.records]);
  assert.equal((await bootstrap({ db, env: {}, files: () => assert.fail('must not seed') })).status, 'existing');
  assert.equal(JSON.stringify([...db.records]), original);
  await bootstrap({ db, env: { ...env, CIMU_ADMIN_EMAIL: 'other@example.test', CIMU_ADMIN_PASSWORD: 'Otra clave de prueba 2026' }, files: noFiles });
  assert.equal(JSON.stringify([...db.records]), original);
});

test('legacy data without policy is refused and invalid settings never create an administrator', async () => {
  for (const seed of [{ 'users/legacy': { _id: 'legacy', email: 'old@example.test', isAdmin: true } }, { 'cimu-libros/legacy': { _id: 'legacy', titulo: 'Contenido existente' } }]) {
    const db = initializationCouch(seed);
    await assert.rejects(bootstrap({ db, env, files: noFiles }), /access:migrate/);
    assert(!db.records.has('users/security-policy'));
    await assert.rejects(bootstrap({ db, env: {}, files: noFiles }), /access:migrate/);
    for (const [key, value] of Object.entries(seed)) assert.deepEqual(db.records.get(key), value);
  }
  for (const invalid of [{ ...env, CIMU_ADMIN_PASSWORD: '' }, { ...env, CIMU_ADMIN_EMAIL: 'bad' }, { ...env, CIMU_SEED_DEMO: 'yes' }]) {
    const db = initializationCouch();
    await assert.rejects(bootstrap({ db, env: invalid, files: noFiles }), SetupError);
    assert.equal(db.records.size, 0);
  }
});

test('an interrupted initialization resumes without overwriting existing credentials or demo records', async () => {
  const db = initializationCouch(); const options = { db, env: { ...env, CIMU_SEED_DEMO: 'true' }, files: noFiles };
  const put = db.put; let interrupted = false;
  db.put = async (route, body) => { if (route === '/cimu-gaceta-opinion/demo-noticia-opinion' && !interrupted) { interrupted = true; throw new Error('simulated outage'); } return put(route, body); };
  await assert.rejects(bootstrap(options), /simulated outage/);
  assert(!db.records.has('users/security-policy'));
  const marker = db.records.get('app_meta/installation');
  const credential = structuredClone(db.records.get(`users/${marker.administratorId}`));
  const news = db.records.get('cimu-gaceta-actualidad/demo-noticia-actualidad'); news.titulo = 'Edición que debe conservarse';
  await assert.rejects(bootstrap({ ...options, env: { ...options.env, CIMU_ADMIN_PASSWORD: 'Una contraseña diferente 2026' } }), /no coincide/);
  await bootstrap(options);
  assert.deepEqual(db.records.get(`users/${marker.administratorId}`), credential);
  assert.equal(db.records.get('cimu-gaceta-actualidad/demo-noticia-actualidad').titulo, 'Edición que debe conservarse');
  assert.equal(db.records.get('app_meta/installation').status, 'completed');
});

test('simultaneous initialization uses one policy, one credential and one bootstrap event', async () => {
  const db = initializationCouch();
  await Promise.all([bootstrap({ db, env, files: noFiles }), bootstrap({ db, env, files: noFiles })]);
  const users = [...db.records.keys()].filter(key => key.startsWith('users/'));
  assert.equal(users.length, 2);
  assert.equal(Object.keys(db.records.get('users/security-policy').accounts).length, 1);
  assert.equal([...db.records.values()].filter(doc => doc.action === 'system.bootstrap').length, 1);
});

test('demo documents match input models and demo files are never replaced', async () => {
  const docs = demoDocuments('admin', '2026-10-28T12:00:00.000Z');
  for (const [database, doc] of docs) {
    if (database === 'cimu-libros') bookSchema.parse(doc);
    if (database.startsWith('cimu-gaceta-') && database !== 'cimu-gaceta-autores') newsSchema.parse(doc);
  }
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'cimu-bootstrap-'));
  try {
    await writeDemoFiles(directory);
    assert.match((await fs.readFile(path.join(directory, 'uploads/demo/cimu-demo.pdf'))).toString(), /^%PDF-1.4/);
    await fs.writeFile(path.join(directory, 'uploads/demo/cimu-demo-cover.svg'), 'conservar');
    await writeDemoFiles(directory);
    assert.equal(await fs.readFile(path.join(directory, 'uploads/demo/cimu-demo-cover.svg'), 'utf8'), 'conservar');
    assert.match(demoPdf().toString(), /startxref/);
  } finally { await fs.rm(directory, { recursive: true, force: true }); }
});

test('readiness retries temporary outages but fails authentication immediately without exposing secrets', async () => {
  let calls = 0;
  await waitForCouch({ get: async () => { if (++calls < 3) throw new Error('temporary'); } }, { attempts: 3, pause: async () => {} });
  assert.equal(calls, 3);
  calls = 0;
  await assert.rejects(waitForCouch({ get: async () => { calls++; throw { response: { status: 401 }, config: { password: 'secret' } }; } }, { pause: async () => {} }), /credenciales/);
  assert.equal(calls, 1);
  assert(!setupErrorMessage({ config: { password: 'secret' } }).includes('secret'));
  assert.equal(enabled(undefined), false); assert.equal(enabled('true'), true);
});

test('a failure after publishing the policy can finish without reseeding or another password', async () => {
  const db = initializationCouch(); const put = db.put; let failAudit = true;
  db.put = async (route, doc) => { if (route.startsWith('/audit_events/bootstrap-') && failAudit) { failAudit = false; throw new Error('audit unavailable'); } return put(route, doc); };
  await assert.rejects(bootstrap({ db, env, files: noFiles }), /audit unavailable/);
  const policy = structuredClone(db.records.get('users/security-policy'));
  assert(policy);
  assert.equal(db.records.get('app_meta/installation').status, 'pending');
  await bootstrap({ db, env: {}, files: () => assert.fail('must not seed') });
  assert.deepEqual(db.records.get('users/security-policy'), policy);
  assert.equal(db.records.get('app_meta/installation').status, 'completed');
  const events = [...db.records.values()].filter(doc => doc.action === 'system.bootstrap');
  assert.equal(events.length, 1); assert.equal(events[0].actorId, null);
});
