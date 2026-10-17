import { defineMiddleware } from 'astro:middleware';
import { validateSession, createSessionCookie, createBlankSessionCookie } from './lib/session.js';
import { hasAccessRule } from './lib/security/navigation.js';
import { audit } from './lib/security/audit.js';
import { validateApiInput } from './lib/security/requestValidation.js';
import { apiRule, adminRule } from './lib/security/routes.js';
import { json, errorResponse, assertSameOrigin } from './lib/security/http.js';
export const onRequest = defineMiddleware(async (context, next) => {
  try {
    const { request, url, cookies, locals } = context;
    const decodedPath = decodeURIComponent(url.pathname);
    if (decodedPath.includes('\\') || decodedPath.includes('\0')) return json({ error: 'Ruta inválida' }, 400);
    const path = decodedPath.replace(/\/$/, '') || '/';
    const token = cookies.get('session')?.value;
    const identity = await validateSession(token);
    Object.assign(locals, identity);
    if (identity.session) {
      const cookie = createSessionCookie(token, identity.session.expiresAt); cookies.set(cookie.name, cookie.value, cookie.attributes);
    } else if (token) {
      const cookie = createBlankSessionCookie(); cookies.set(cookie.name, cookie.value, cookie.attributes);
    }
    if (path.startsWith('/api/')) {
      const rule = apiRule(request.method, path);
      if (!rule) return json({ error: 'Ruta o método no permitido' }, 403);
      assertSameOrigin(request);
      await validateApiInput(request);
      if (rule !== 'public' && !hasAccessRule(identity.user, rule)) {
        if (identity.user) await audit(identity.user.id,'access.denied',path,{ method:request.method }).catch(() => console.error('No se pudo registrar acceso denegado'));
        return json({ error: identity.user ? 'No tienes permiso para esta acción' : 'Inicia sesión para continuar' }, identity.user ? 403 : 401);
      }
    }
    if (path === '/admin' || path.startsWith('/admin/')) {
      if (!identity.user) return context.redirect('/login?redirect=' + encodeURIComponent(path));
      const pageRule = adminRule(path);
      if (!pageRule || !hasAccessRule(identity.user, pageRule)) return new Response('No tienes permiso para acceder a esta página.', { status: 403 });
    }
    const response = await next();
    if (path.startsWith('/admin') || path.startsWith('/api/') || path === '/login' || path === '/activar-cuenta') response.headers.set('Cache-Control', 'no-store');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'same-origin');
    return response;
  } catch (error) { return errorResponse(error); }
});
