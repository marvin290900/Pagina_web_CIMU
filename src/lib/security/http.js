export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
export function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
}
export function errorResponse(error) {
  if (error.name === 'ZodError') return json({ error: 'Datos inválidos', fields: error.flatten() }, 400);
  if (error instanceof SyntaxError) return json({ error: 'JSON inválido' }, 400);
  const status = error.status || error.response?.status;
  if ([400, 401, 403, 404, 409, 429, 503].includes(status)) return json({ error: error.status ? error.message : ({404:'No encontrado',409:'El registro cambió. Recarga y vuelve a intentarlo.'}[status] || 'No se pudo completar la operación') }, status);
  console.error('Operación fallida:', error.name, status || 'internal');
  return json({ error: 'No se pudo completar la operación' }, 500);
}
export function assertSameOrigin(request) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) return;
  const origin = request.headers.get('origin');
  if (!origin || origin !== new URL(request.url).origin || request.headers.get('sec-fetch-site') === 'cross-site') throw new HttpError(403, 'Origen de solicitud no permitido');
}
export function safeRedirect(value) {
  if (typeof value !== 'string' || !/^\/admin(?:\/|$|\?)/.test(value) || value.includes('\\') || /[\r\n]/.test(value)) return '/admin';
  return value;
}
export function recentSession(session) {
  if (!session || Date.now() - new Date(session.createdAt).getTime() > 10 * 60 * 1000) throw new HttpError(401, 'Vuelve a iniciar sesión para realizar esta acción sensible');
}
