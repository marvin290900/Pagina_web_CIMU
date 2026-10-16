import 'dotenv/config';
import { pathToFileURL } from 'node:url';
import { randomUUID } from 'node:crypto';
import { couch } from '../src/lib/couchDB.js';
import { initDatabases } from '../src/lib/auth.js';
import { allDocs, POLICY_ID } from '../src/lib/security/store.js';
import { MODULES, SECTIONS } from '../src/lib/security/roles.js';
import { emailSchema } from '../src/lib/security/validation.js';

export function preparePolicy(users) {
  const accounts = {}, emails = new Set();
  for (const user of users.filter(u => u._id !== POLICY_ID && !u._id.startsWith('_'))) {
    const email = emailSchema.parse(user.email);
    if (emails.has(email)) throw new Error('Hay correos duplicados normalizados. Resuélvelos antes de migrar.');
    emails.add(email);
    const admin = user.isAdmin === true && typeof user.passwordHash === 'string';
    accounts[user._id] = { id: user._id, email, name: user.name || email.split('@')[0], status: admin ? 'active' : 'disabled', authVersion: 1,
      assignments: admin ? [{ role: 'administrador', modules: [], sections: [] }, { role: 'director', modules: MODULES, sections: ['*'] }] : [], createdAt: user.createdAt || new Date().toISOString() };
  }
  if (!Object.values(accounts).some(u => u.status === 'active')) throw new Error('No se encontró un administrador legado con contraseña. Revisa los datos antes de migrar.');
  return { _id: POLICY_ID, schemaVersion: 1, accounts, events: [], createdAt: new Date().toISOString() };
}

export async function migrate({ apply = false, confirmActive = false, db = couch } = {}) {
  // Maintenance window required: no concurrent old/new application writes.
  const users = await allDocs('users', db);
  const existingPolicy = users.find(u => u._id === POLICY_ID);
  const policy = existingPolicy || preparePolicy(users);
  const news = [];
  for (const section of SECTIONS) {
    try {
      for (const doc of await allDocs(`cimu-gaceta-${section}`, db)) if (!doc.editorialStatus) news.push({ section, doc });
    } catch (error) { if (error.response?.status !== 404) throw error; }
  }
  const catalog = [];
  for (const database of ['cimu-libros','investigaciones']) {
    try { for (const doc of await allDocs(database,db)) if (doc.titulo && !doc.editorialStatus) catalog.push({ database,doc }); }
    catch(error) { if (error.response?.status !== 404) throw error; }
  }
  const summary = { pendingCatalog:catalog.length, apply, policyExists: !!existingPolicy, accounts: Object.keys(policy.accounts).length, activeAdministrators: Object.values(policy.accounts).filter(a => a.status === 'active' && a.assignments.some(r => r.role === 'administrador')).length, pendingNews: news.length, activeLegacyNews: news.filter(({ doc }) => doc.estado === 'activo').length, inactiveLegacyNews: news.filter(({ doc }) => doc.estado !== 'activo').length };
  if (!apply) return summary;
  if (news.length && !confirmActive) throw new Error('Revisa el respaldo y los estados. Para mapear activo a publicado usa --legacy-active-is-published.');
  if (db === couch) await initDatabases();
  for (const user of users.filter(u => policy.accounts[u._id])) {
    if (!user.credentialVersion) await db.put(`/users/${encodeURIComponent(user._id)}`, { ...user, credentialVersion: randomUUID() });
  }
  for (const { section, doc } of news) {
    await db.put(`/cimu-gaceta-${section}/${encodeURIComponent(doc._id)}`, { ...doc, editorialStatus: doc.estado === 'activo' ? 'publicado' : 'archivado', createdBy: null, assignedTo: [], accessMigratedAt: new Date().toISOString() });
  }
  for (const {database,doc} of catalog) await db.put(`/${database}/${encodeURIComponent(doc._id)}`,{...doc,editorialStatus:'publicado',createdBy:null,assignedTo:[],accessMigratedAt:new Date().toISOString()});
  // Publish the policy last. Sessions in the old token format are never accepted.
  if (!existingPolicy) await db.put(`/users/${POLICY_ID}`, policy);
  return summary;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { console.log(JSON.stringify(await migrate({ apply: process.argv.includes('--apply'), confirmActive: process.argv.includes('--legacy-active-is-published') }), null, 2)); }
  catch (error) { console.error(error.response ? `Migración detenida: CouchDB respondió ${error.response.status}.` : error.message); process.exitCode = 1; }
}
