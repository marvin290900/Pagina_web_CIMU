// src/middleware.js
import { defineMiddleware } from 'astro:middleware';
import { validateSession } from './lib/session';

const protectedRoutes = ['/dashboard', '/profile', '/admin', '/account'];

// APIs que son explícitamente públicas (Lectura de datos)
const publicAPIs = [
  '/api/login',
  '/api/logout',
  '/api/investigadores/obtener',
  '/api/gaceta/obtener',
  '/api/gaceta/actualidad/obtener_todos',
  '/api/gaceta/actualidad/buscar',
  '/api/inicio/obtener',
  '/api/libros/obtener',
  '/api/libros/obtener-filtrados',
  '/api/libros/buscar',
  '/api/remi/obtener_revista',
  '/api/investigaciones/investigaciones'
];

export const onRequest = defineMiddleware(async (context, next) => {
  const { cookies, url, redirect, locals } = context;
  const { pathname } = url;

  // Obtener token de la cookie
  const token = cookies.get('session')?.value ?? null;

  // Validar sesión
  const { session, user } = await validateSession(token);

  // Guardar en locals para uso en componentes y rutas
  locals.session = session;
  locals.user = user;

  // 1. Verificar protección de rutas de interfaz (Páginas)
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  if (isProtectedRoute && !user) {
    return redirect('/login?redirect=' + pathname);
  }

  // 2. Verificar protección de APIs (Estrategia: Protegido por defecto)
  if (pathname.startsWith('/api/')) {
    const isPublicAPI = publicAPIs.some(api => pathname.startsWith(api));

    // Si no es pública y no hay usuario admin, denegar acceso
    if (!isPublicAPI && (!user || !user.isAdmin)) {
      return new Response(JSON.stringify({
        error: 'Acceso denegado. Se requieren permisos de administrador.'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  return next();
});