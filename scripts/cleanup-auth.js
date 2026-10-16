import 'dotenv/config';
import { couch } from '../src/lib/couchDB.js';
import { allDocs } from '../src/lib/security/store.js';
// Dry run by default. Never log session tokens, identifiers or account credentials.
const apply = process.argv.includes('--apply');
for (const database of ['sessions', 'auth_attempts']) {
  const docs = await allDocs(database);
  const expired = docs.filter(d => !d.expiresAt || Date.parse(d.expiresAt) <= Date.now() || (database === 'sessions' && !d.credentialVersion));
  if (apply) for (const doc of expired) await couch.delete(`/${database}/${encodeURIComponent(doc._id)}`, { params: { rev: doc._rev } });
  console.log(JSON.stringify({ database, expired: expired.length, applied: apply }));
}
