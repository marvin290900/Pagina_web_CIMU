import { randomUUID } from 'node:crypto';
import { couch } from '../couchDB.js';
export async function audit(actorId, action, resourceId, details = {}) {
  // Callers supply non-secret, explicitly selected fields only.
  const id = randomUUID();
  await couch.put(`/audit_events/${id}`, { _id: id, actorId, action, resourceId, details, createdAt: new Date().toISOString() });
}
