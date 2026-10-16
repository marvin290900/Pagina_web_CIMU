import { couch } from '../couchDB.js';
import { digest } from './accounts.js';
import { HttpError } from './http.js';
// Persistent fixed windows shared by every Node process. Counts successful attempts too.
export async function limitAttempts(key, max, db = couch, now = Date.now()) {
  const bucket = Math.floor(now / (15 * 60_000));
  const id = digest(`${key}:${bucket}`);
  for (let attempt = 0; attempt < 8; attempt++) {
    let doc = { _id: id, count: 0, expiresAt: new Date((bucket + 1) * 15 * 60_000).toISOString() };
    try { doc = (await db.get(`/auth_attempts/${id}`)).data; }
    catch (error) { if (error.response?.status !== 404) throw error; }
    if (doc.count >= max) throw new HttpError(429, 'Demasiados intentos. Intenta nuevamente en 15 minutos');
    try { await db.put(`/auth_attempts/${id}`, { ...doc, count: doc.count + 1 }); return; }
    catch (error) { if (error.response?.status !== 409) throw error; }
  }
  throw new HttpError(429, 'Demasiados intentos simultáneos');
}
