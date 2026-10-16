import { randomBytes } from 'node:crypto';
import { couch } from './couchDB.js';
import { digest } from './security/accounts.js';
import { readPolicy } from './security/store.js';
import { publicUser } from './security/roles.js';
const DAY = 24 * 3600_000;
const EMPTY = { session: null, user: null };
export async function createSession(user, db = couch) {
  const token = randomBytes(32).toString('base64url');
  const now = Date.now();
  const session = { _id: digest(token), userId: user.id, authVersion: user.authVersion, credentialVersion: user.credentialVersion, createdAt: new Date(now).toISOString(), expiresAt: new Date(now + DAY).toISOString(), absoluteExpiresAt: new Date(now + 7 * DAY).toISOString() };
  await db.put(`/sessions/${session._id}`, session);
  return { token, expiresAt: new Date(session.expiresAt) };
}
export async function validateSession(token, db = couch, now = Date.now()) {
  if (typeof token !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(token)) return EMPTY;
  try {
    const { data: session } = await db.get(`/sessions/${digest(token)}`);
    if (!Number.isFinite(Date.parse(session.expiresAt)) || !Number.isFinite(Date.parse(session.absoluteExpiresAt)) || now >= Date.parse(session.expiresAt) || now >= Date.parse(session.absoluteExpiresAt)) return EMPTY;
    const policy = await readPolicy(db);
    const account = policy.accounts[session.userId];
    if (!account || account.status !== 'active' || account.authVersion !== session.authVersion) return EMPTY;
    const { data: credential } = await db.get(`/users/${encodeURIComponent(account.id)}`);
    if (!credential.passwordHash || credential.credentialVersion !== session.credentialVersion) return EMPTY;
    // Renew near expiry, never extending past the absolute limit. Caller refreshes the cookie.
    if (Date.parse(session.expiresAt) - now < DAY / 2) {
      session.expiresAt = new Date(Math.min(now + DAY, Date.parse(session.absoluteExpiresAt))).toISOString();
      try { await db.put(`/sessions/${session._id}`, session); }
      catch (error) { if (error.response?.status !== 409) throw error; }
    }
    return { session: { id: session._id, userId: account.id, createdAt: session.createdAt, expiresAt: session.expiresAt }, user: publicUser(account) };
  } catch (error) {
    if (error.response?.status === 404) return EMPTY;
    throw error; // Do not turn database outages into successful anonymous requests.
  }
}
export async function invalidateSession(token) {
  if (!token) return;
  try {
    const path = `/sessions/${digest(token)}`;
    const { data } = await couch.get(path);
    await couch.delete(path, { params: { rev: data._rev } });
  } catch (error) { if (error.response?.status !== 404) throw error; }
}
const cookieAttributes = () => ({ path: '/', httpOnly: true, secure: import.meta.env?.PROD === true || process.env.NODE_ENV === 'production', sameSite: 'lax' });
export function createSessionCookie(token, expiresAt) { return { name: 'session', value: token, attributes: { ...cookieAttributes(), expires: new Date(expiresAt) } }; }
export function createBlankSessionCookie() { return { name: 'session', value: '', attributes: { ...cookieAttributes(), maxAge: 0 } }; }
