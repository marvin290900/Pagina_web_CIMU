// src/lib/apiAuth.js
import { validateSession } from './session';

// Verificar si el usuario está autenticado
export async function requireAuth(request, cookies) {
  const token = cookies.get('session')?.value;
  const { user } = await validateSession(token);
  
  if (!user) {
    return {
      authorized: false,
      response: new Response(JSON.stringify({ 
        error: 'No autorizado' 
      }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    };
  }
  
  return { authorized: true, user };
}

// Verificar si el usuario es admin
export async function requireAdmin(request, cookies) {
  const token = cookies.get('session')?.value;
  const { user } = await validateSession(token);
  
  if (!user) {
    return {
      authorized: false,
      response: new Response(JSON.stringify({ 
        error: 'No autorizado' 
      }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    };
  }
  
  if (!user.isAdmin) {
    return {
      authorized: false,
      response: new Response(JSON.stringify({ 
        error: 'Acceso denegado. Se requieren permisos de administrador.' 
      }), { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      })
    };
  }
  
  return { authorized: true, user };
}

// Verificar permisos personalizados
export async function requirePermission(request, cookies, permission) {
  const token = cookies.get('session')?.value;
  const { user } = await validateSession(token);
  
  if (!user) {
    return {
      authorized: false,
      response: new Response(JSON.stringify({ 
        error: 'No autorizado' 
      }), { status: 401 })
    };
  }
  
  // Aquí puedes verificar permisos específicos
  // Por ejemplo, si guardas permisos en el usuario:
  // if (!user.permissions?.includes(permission)) { ... }
  
  return { authorized: true, user };
}
