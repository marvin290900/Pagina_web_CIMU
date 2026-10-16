import { couch } from '../couchDB.js';
import { HttpError } from './http.js';
export const POLICY_ID = 'security-policy';
// One CAS document serializes account changes, email uniqueness and the last-admin invariant.
// Suitable for an editorial team; credentials remain in separate user documents.
export async function readPolicy(db = couch) {
  try { return (await db.get(`/users/${POLICY_ID}`)).data; }
  catch (error) { if (error.response?.status === 404) throw new HttpError(503, 'Ejecuta primero la migración de cuentas'); throw error; }
}
export function isAdminAccount(account) {
  return account.status === 'active' && account.assignments.some(a => a.role === 'administrador');
}
export async function changePolicy(mutate, db = couch) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const policy = await readPolicy(db);
    const result = mutate(policy);
    if (!Object.values(policy.accounts).some(isAdminAccount)) throw new HttpError(409, 'Debe conservarse al menos un administrador activo');
    policy.updatedAt = new Date().toISOString();
    try { await db.put(`/users/${POLICY_ID}`, policy); return result; }
    catch (error) { if (error.response?.status !== 409) throw error; }
  }
  throw new HttpError(409, 'Cambios simultáneos. Recarga y vuelve a intentarlo');
}
export async function allDocs(database, db = couch) {
  const docs = []; let startkey;
  for (;;) {
    const { data } = await db.get(`/${database}/_all_docs`, { params: { include_docs: true, limit: 500, ...(startkey ? { startkey: JSON.stringify(startkey), skip: 1 } : {}) } });
    docs.push(...data.rows.map(row => row.doc).filter(doc => doc && !doc._id.startsWith('_design/')));
    if (data.rows.length < 500) return docs;
    startkey = data.rows.at(-1).id;
  }
}
