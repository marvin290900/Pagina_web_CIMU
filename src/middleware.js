// src/middleware.js
import { defineMiddleware } from 'astro:middleware';
import { validateSession } from './lib/session';

const protectedRoutes = ['/dashboard', '/profile', '/admin', '/account'];
const adminOnlyAPIs = [
  '/api/subir_imagen',
  '/api/subir_pdf',
  '/api/register',
  '/api/inicio/agregar',
  '/api/inicio/editar',
  '/api/inicio/eliminar_imagen',
  '/api/inicio/eliminar',
  '/api/investigadores/agregar',
  '/api/investigadores/editar',
  '/api/investigadores/eliminar',
  '/api/investigadores/eliminar_archivo',
  '/api/investigadores/subir_cv',
];

export const onRequest = defineMiddleware(async (context, next) => {
  const { cookies, url, redirect, locals } = context;
  
  // Obtener token de la cookie
  const token = cookies.get('session')?.value ?? null;
  
  // Validar sesión
  const { session, user } = await validateSession(token);
  
  
  // Guardar en locals
  locals.session = session;
  locals.user = user;
  
  // Verificar rutas protegidas
  const isProtectedRoute = protectedRoutes.some(route => 
    url.pathname.startsWith(route)
  );
  
  const isAdminOnlyAPI = adminOnlyAPIs.some(api => 
    url.pathname.startsWith(api)
  );

  // Verificar acceso a APIs de admin
  if (isAdminOnlyAPI && (!user || !user.isAdmin)) {
    return new Response(JSON.stringify({ 
      error: 'Acceso denegado. Se requieren permisos de administrador.' 
    }), { 
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  if (isProtectedRoute && !user) {
    return redirect('/login?redirect=' + url.pathname);
  }
  
  // Verificar permisos de admin
  if (url.pathname.startsWith('/admin') && !user?.isAdmin) {
    return redirect('/dashboard');
  }
  
  return next();
});