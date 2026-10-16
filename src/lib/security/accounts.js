import bcrypt from 'bcrypt';
import { randomBytes, randomUUID, createHash } from 'node:crypto';
import { couch } from '../couchDB.js';
import { readPolicy, changePolicy } from './store.js';
import { publicUser, can } from './roles.js';
import { HttpError } from './http.js';
import { audit } from './audit.js';
export const digest = value => createHash('sha256').update(value).digest('hex');
const credentialsPath = id => `/users/${encodeURIComponent(id)}`;
export async function createAccount(input, actor) {
  const policy = await readPolicy();
  if (Object.values(policy.accounts).some(u => u.email === input.email)) throw new HttpError(409, 'El correo ya está registrado');
  const id = randomUUID();
  const token = randomBytes(32).toString('base64url');
  await couch.put(credentialsPath(id), { _id: id, email: input.email, credentialVersion: randomUUID(), setupTokenHash: digest(token), setupExpiresAt: new Date(Date.now() + 24 * 3600_000).toISOString() });
  const account = { id, ...input, status: 'invited', authVersion: 1, createdBy: actor.id, createdAt: new Date().toISOString() };
  await changePolicy(policy => {
    if (!can(policy.accounts[actor.id], 'users.create') || !can(policy.accounts[actor.id], 'users.assign_roles')) throw new HttpError(403, 'Acceso denegado');
    if (Object.values(policy.accounts).some(u => u.email === input.email)) throw new HttpError(409, 'El correo ya está registrado');
    policy.accounts[id] = account;
    policy.events = [...(policy.events || []).slice(-99), { actorId: actor.id, action: 'users.create', resourceId: id, at: new Date().toISOString() }];
  });
  await audit(actor.id, 'users.create', id);
  return { user: publicUser(account), setupToken: token };
}
export async function updateAccount(id, input, actor) {
  const account = await changePolicy(policy => {
    if (!can(policy.accounts[actor.id], 'users.update') || !can(policy.accounts[actor.id], 'users.assign_roles') || !can(policy.accounts[actor.id], 'users.disable')) throw new HttpError(403, 'Acceso denegado');
    const current = policy.accounts[id];
    if (!current) throw new HttpError(404, 'Cuenta no encontrada');
    if (current.authVersion !== input.version) throw new HttpError(409, 'La cuenta cambió. Recarga la lista');
    if (current.status === 'invited' && input.status === 'active') throw new HttpError(400, 'La persona debe establecer su contraseña primero');
    if (current.status !== 'invited' && input.status === 'invited') throw new HttpError(400, 'Usa restablecer acceso para generar una invitación');
    const updated = { ...current, name: input.name, status: input.status, assignments: input.assignments, authVersion: current.authVersion + 1, updatedAt: new Date().toISOString() };
    policy.accounts[id] = updated;
    policy.events = [...(policy.events || []).slice(-99), { actorId: actor.id, action: 'users.update', resourceId: id, at: updated.updatedAt }];
    return updated;
  });
  await audit(actor.id, 'users.update', id, { status: account.status, assignments: account.assignments });
  return publicUser(account);
}
export async function revokeSessions(id, actor) {
  await changePolicy(policy => {
    if (!can(policy.accounts[actor.id], 'sessions.revoke')) throw new HttpError(403, 'Acceso denegado');
    const account = policy.accounts[id];
    if (!account) throw new HttpError(404, 'Cuenta no encontrada');
    account.authVersion++;
  });
  await audit(actor.id, 'sessions.revoke', id);
}
export async function resetAccess(id, actor) {
  await revokeSessions(id, actor);
  const { data: credential } = await couch.get(credentialsPath(id));
  const token = randomBytes(32).toString('base64url');
  await couch.put(credentialsPath(id), { ...credential, setupTokenHash: digest(token), setupExpiresAt: new Date(Date.now() + 3600_000).toISOString(), credentialVersion: randomUUID(), passwordHash: null });
  await audit(actor.id, 'users.reset_access', id);
  return token;
}
export async function activateAccount(id, token, password) {
  const policy = await readPolicy();
  const account = policy.accounts[id];
  if (!account || account.status === 'disabled') throw new HttpError(400, 'Enlace inválido o vencido');
  const { data: credential } = await couch.get(credentialsPath(id));
  if (!credential.setupTokenHash || credential.setupTokenHash !== digest(token) || Date.parse(credential.setupExpiresAt) <= Date.now()) throw new HttpError(400, 'Enlace inválido o vencido');
  const updated = { ...credential, passwordHash: await bcrypt.hash(password, 12), credentialVersion: randomUUID() };
  delete updated.setupTokenHash; delete updated.setupExpiresAt;
  await couch.put(credentialsPath(id), updated); // _rev makes a setup token single use.
  await changePolicy(policy => {
    const current = policy.accounts[id];
    if (current.status === 'disabled') throw new HttpError(403, 'Cuenta desactivada');
    current.status = 'active'; current.authVersion++;
  });
  await audit(id, 'password.setup', id);
}
export async function changePassword(user, oldPassword, password) {
  const { data: credential } = await couch.get(credentialsPath(user.id));
  if (!credential.passwordHash || !await bcrypt.compare(oldPassword, credential.passwordHash)) throw new HttpError(400, 'Contraseña actual incorrecta');
  await couch.put(credentialsPath(user.id), { ...credential, passwordHash: await bcrypt.hash(password, 12), credentialVersion: randomUUID() });
  await changePolicy(policy => { policy.accounts[user.id].authVersion++; });
  await audit(user.id, 'password.change', user.id);
}
