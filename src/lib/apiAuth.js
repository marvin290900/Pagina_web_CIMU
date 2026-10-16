import { validateSession } from './session.js';
import { can } from './security/roles.js';
import { json } from './security/http.js';
export async function requireAuth(request, cookies) {
  const { user } = await validateSession(cookies.get('session')?.value);
  return user ? { authorized: true, user } : { authorized: false, response: json({ error: 'Inicia sesión para continuar' }, 401) };
}
export async function requirePermission(request, cookies, permission, scope = {}) {
  const auth = await requireAuth(request, cookies);
  if (!auth.authorized) return auth;
  return can(auth.user, permission, scope) ? auth : { authorized: false, response: json({ error: 'No tienes permiso para esta acción' }, 403) };
}
export function requireAdmin(request, cookies) { return requirePermission(request, cookies, 'users.update'); }
