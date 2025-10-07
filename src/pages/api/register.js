// src/pages/api/register.js
import { createUser } from '../../lib/auth.js';
import { createSession, createSessionCookie } from '../../lib/session.js';

export const POST = async ({ request, cookies }) => {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return new Response(JSON.stringify({ 
        error: 'Email y contraseña son requeridos' 
      }), { status: 400 });
    }
    
    if (password.length < 6) {
      return new Response(JSON.stringify({ 
        error: 'La contraseña debe tener al menos 6 caracteres' 
      }), { status: 400 });
    }
    
    // Crear usuario
    const user = await createUser(email, password);
    
    // Crear sesión
    const { token, expiresAt } = await createSession(user._id);
    
    // Crear cookie
    const sessionCookie = createSessionCookie(token, expiresAt);
    cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    
    return new Response(JSON.stringify({ 
      success: true,
      user: { id: user._id, email: user.email }
    }), { status: 201 });
    
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error.message || 'Error al crear usuario' 
    }), { status: 400 });
  }
};