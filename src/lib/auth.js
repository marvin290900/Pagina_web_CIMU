import bcrypt from 'bcrypt';
import { couch } from './couchDB.js';
import { readPolicy } from './security/store.js';
import { publicUser } from './security/roles.js';
const DUMMY_HASH = await bcrypt.hash('unused-constant-timing-password', 12);
export async function authenticateUser(email, password) {
  const policy = await readPolicy();
  const account = Object.values(policy.accounts).find(user => user.email === email);
  let credential;
  if (account) credential = (await couch.get(`/users/${encodeURIComponent(account.id)}`)).data;
  const valid = await bcrypt.compare(password, credential?.passwordHash || DUMMY_HASH);
  if (!valid || account?.status !== 'active') return null;
  return { ...publicUser(account), credentialVersion: credential.credentialVersion };
}
export { initDatabases } from './security/databases.js';
