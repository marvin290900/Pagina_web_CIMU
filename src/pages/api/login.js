// src/pages/api/login.js
import { authenticateUser } from '../../lib/auth.js';
import { createSession, createSessionCookie } from '../../lib/session.js';

export const POST = async ({ request, cookies }) => {
  try {
    const { email, password } = await request.json();
    
    const user = await authenticateUser(email, password);
    
    if (!user) {
      return new Response(JSON.stringify({ 
        error: 'Credenciales inválidas' 
      }), { status: 401 });
    }
    
    // Crear sesión
    const { token, expiresAt } = await createSession(user._id);
    
    // Crear cookie
    const sessionCookie = createSessionCookie(token, expiresAt);
    cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    
    return new Response(JSON.stringify({ 
      success: true,
      user: { id: user._id, email: user.email, isAdmin: user.isAdmin }
    }), { status: 200 });
    
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Error en el servidor' 
    }), { status: 500 });
  }
};