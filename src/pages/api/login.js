// src/pages/api/login.js
import { authenticateUser } from '../../lib/auth';
import { createSession, createSessionCookie } from '../../lib/session';

export const POST = async ({ request, cookies }) => {
  //console.log('========== LOGIN API INICIADO ==========');
  
  try {
    const body = await request.json();
    //console.log('1. Body recibido:', body);
    
    const { email, password } = body;
    //console.log('2. Intentando autenticar:', email);
    
    const user = await authenticateUser(email, password);
    //console.log('3. Usuario autenticado:', user ? 'SÍ' : 'NO');
    
    if (!user) {
      //console.log('4. Credenciales inválidas');
      return new Response(JSON.stringify({ 
        error: 'Credenciales inválidas' 
      }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    //console.log('5. Creando sesión para userId:', user._id);
    const { token, expiresAt } = await createSession(user._id);
    //console.log('6. Token generado:', token);
    //console.log('7. Expira en:', expiresAt);
    
    //console.log('8. Creando cookie...');
    const sessionCookie = createSessionCookie(token, expiresAt);
    //console.log('9. Cookie configuración:', JSON.stringify(sessionCookie, null, 2));
    
    //console.log('10. Guardando cookie en response...');
    cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    //console.log('11. Cookie guardada exitosamente');
    
    //console.log('12. Retornando respuesta exitosa');
    return new Response(JSON.stringify({ 
      success: true,
      user: { id: user._id, email: user.email, isAdmin: user.isAdmin }
    }), { 
      status: 200,
      headers: { 
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    console.error('ERROR EN LOGIN:', error);
    console.error('Stack:', error.stack);
    return new Response(JSON.stringify({ 
      error: 'Error en el servidor',
      details: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};