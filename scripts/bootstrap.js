import 'dotenv/config';
import bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import { couch } from '../src/lib/couchDB.js';
import { DATABASES, initDatabases } from '../src/lib/security/databases.js';
import { allDocs, POLICY_ID, isAdminAccount } from '../src/lib/security/store.js';
import { MODULES } from '../src/lib/security/roles.js';
import { emailSchema, passwordSchema } from '../src/lib/security/validation.js';
import { demoDocuments, initialConfiguration, writeDemoFiles } from './demo-data.js';
export const INSTALLATION_ID = 'installation';
const markerPath = `/app_meta/${INSTALLATION_ID}`;
export class SetupError extends Error {}
export function enabled(value, fallback = false) {
  if (value === undefined || value === '') return fallback;
  if (!['true', 'false'].includes(value)) throw new SetupError('Las opciones CIMU_BOOTSTRAP y CIMU_SEED_DEMO deben usar true o false.');
  return value === 'true';
}
async function find(db, database, id) {
  try { return (await db.get(`/${database}/${encodeURIComponent(id)}`)).data; }
  catch (error) { if (error.response?.status === 404) return null; throw error; }
}
export async function createOnly(db, database, doc) {
  try { await db.put(`/${database}/${encodeURIComponent(doc._id)}`, doc); return true; }
  catch (error) { if (error.response?.status === 409) return false; throw error; }
}
function settings(env) {
  let email;
  try { email = emailSchema.parse(env.CIMU_ADMIN_EMAIL); } catch { throw new SetupError('Configura CIMU_ADMIN_EMAIL con un correo válido para la primera cuenta.'); }
  try { passwordSchema.parse(env.CIMU_ADMIN_PASSWORD); } catch { throw new SetupError('Configura CIMU_ADMIN_PASSWORD con al menos 12 caracteres y como máximo 72 bytes UTF-8.'); }
  const name = (env.CIMU_ADMIN_NAME || 'Administración CIMU').trim();
  if (name.length < 2 || name.length > 120) throw new SetupError('CIMU_ADMIN_NAME debe tener entre 2 y 120 caracteres.');
  return { email, name, password: env.CIMU_ADMIN_PASSWORD, seedDemo: enabled(env.CIMU_SEED_DEMO) };
}
async function complete(db, installation) {
  const current = await find(db, 'app_meta', INSTALLATION_ID);
  if (current.status === 'completed') return;
  await createOnly(db, 'audit_events', { _id: `bootstrap-${installation.installationId}`, actorId: null, action: 'system.bootstrap', resourceId: installation.installationId, details: { administratorId: installation.administratorId, demoSeeded: installation.seedDemo }, createdAt: new Date().toISOString() });
  try { await db.put(markerPath, { ...current, status: 'completed', completedAt: new Date().toISOString() }); }
  catch (error) { if (error.response?.status !== 409) throw error; }
}
export async function bootstrap({ db = couch, env = process.env, files = writeDemoFiles } = {}) {
  await initDatabases(db);
  let installation = await find(db, 'app_meta', INSTALLATION_ID);
  const policy = await find(db, 'users', POLICY_ID);
  if (policy) {
    // An established installation never receives another administrator or demo seed.
    if (installation?.kind === 'cimu-installation' && policy.installationId === installation.installationId && installation.status === 'pending') await complete(db, installation);
    return { status: 'existing', administratorCreated: false, demoSeeded: false };
  }
  let config;
  if (!installation) {
    for (const database of DATABASES.filter(name => name !== 'app_meta')) {
      if ((await allDocs(database, db)).length) {
        // Another initializer may have reserved the installation after our first read.
        const concurrent = await find(db, 'app_meta', INSTALLATION_ID);
        if (concurrent?.kind === 'cimu-installation') return bootstrap({ db, env, files });
        throw new SetupError('Existen datos sin política de acceso. No se creó ninguna cuenta. Revisa y ejecuta access:migrate para una instalación anterior.');
      }
    }
    config = settings(env);
    const proposal = { _id: INSTALLATION_ID, kind: 'cimu-installation', version: 1, installationId: randomUUID(), administratorId: randomUUID(), administratorEmail: config.email, administratorName: config.name, seedDemo: config.seedDemo, status: 'pending', startedAt: new Date().toISOString() };
    await createOnly(db, 'app_meta', proposal);
    installation = await find(db, 'app_meta', INSTALLATION_ID);
  }
  config ??= settings(env);
  if (installation?.kind !== 'cimu-installation' || installation.version !== 1 || installation.status !== 'pending') throw new SetupError('El registro de instalación no permite una inicialización nueva. Revisa app_meta antes de continuar.');
  if (installation.administratorEmail !== config.email || installation.administratorName !== config.name || installation.seedDemo !== config.seedDemo) throw new SetupError('Hay una inicialización pendiente con otra configuración. Reanuda con el mismo correo, nombre y opción de datos de prueba.');
  const { administratorId: id, startedAt: at, installationId } = installation;
  const credential = { _id: id, email: config.email, passwordHash: await bcrypt.hash(config.password, 12), credentialVersion: randomUUID(), installationId };
  if (!await createOnly(db, 'users', credential)) {
    const stored = await find(db, 'users', id);
    if (stored.installationId !== installationId || !stored.passwordHash || !await bcrypt.compare(config.password, stored.passwordHash)) throw new SetupError('La credencial inicial ya existe y no coincide. No se modificó su contraseña; reanuda con la configuración original.');
  }
  const account = { id, email: config.email, name: config.name, status: 'active', authVersion: 1, assignments: [{ role: 'administrador', modules: [], sections: [] }, { role: 'director', modules: [...MODULES], sections: ['*'] }], createdAt: at, createdBy: null };
  if (config.seedDemo) {
    await files();
    for (const [database, doc] of demoDocuments(id, at)) await createOnly(db, database, doc);
  }
  for (const [database, doc] of initialConfiguration(config.seedDemo)) await createOnly(db, database, doc);
  const newPolicy = { _id: POLICY_ID, schemaVersion: 1, installationId, accounts: { [id]: account }, events: [], createdAt: at };
  if (!await createOnly(db, 'users', newPolicy)) {
    const current = await find(db, 'users', POLICY_ID);
    if (current.installationId !== installationId || !isAdminAccount(current.accounts?.[id] || { status: 'disabled' })) throw new SetupError('La política fue creada por otro proceso. No se modificó; revisa la instalación.');
  }
  await complete(db, installation);
  return { status: 'initialized', administratorCreated: true, demoSeeded: config.seedDemo };
}
export async function waitForCouch(db = couch, { attempts = 30, pause = delay } = {}) {
  for (let n = 0; n < attempts; n++) {
    try { await db.get('/', { timeout: 3000 }); return; }
    catch (error) {
      if ([401, 403].includes(error.response?.status)) throw new SetupError('CouchDB rechazó las credenciales del servidor. Revisa COUCHDB_USER y COUCHDB_PASSWORD.');
      if (n === attempts - 1) throw new SetupError('CouchDB no está disponible. Revisa la conexión y el estado del servicio.');
      await pause(1000);
    }
  }
}
export function setupErrorMessage(error) {
  return error instanceof SetupError ? error.message : `No se completó la inicialización${error.response?.status ? ` (CouchDB HTTP ${error.response.status})` : ''}. Revisa conexión, permisos y almacenamiento; no se imprimen credenciales.`;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { await waitForCouch(); console.log('[CIMU setup]', JSON.stringify(await bootstrap())); }
  catch (error) { console.error('[CIMU setup]', setupErrorMessage(error)); process.exitCode = 1; }
}
