import { couch } from '../couchDB.js';
export const DATABASES = ['users', 'sessions', 'audit_events', 'auth_attempts', 'private_assets', 'app_meta', 'cimu-libros', 'investigaciones', 'investigadores', 'cimu-gaceta-autores', 'cimu-gaceta', 'carrousel_imagenes', 'articulos', ...['actualidad','vida_universitaria','opinion','memoria','audiovisuales'].map(section => `cimu-gaceta-${section}`)];
export async function initDatabases(db = couch) {
  for (const name of DATABASES) {
    try { await db.put(`/${name}`); }
    catch (error) { if (error.response?.status !== 412) throw error; }
  }
  for (const [database, fields] of [['sessions', ['userId']], ['audit_events', ['createdAt']], ['auth_attempts', ['expiresAt']]]) {
    await db.post(`/${database}/_index`, { index: { fields }, name: fields.join('-') + '-index' });
  }
}
