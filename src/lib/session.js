// src/lib/session.js
// Implementación simple de sesiones (sin Lucia)
import { couch } from './couchDB.js';
import { v4 as uuidv4 } from 'uuid';

const SESSION_COOKIE_NAME = 'session';
const SESSION_EXPIRES_IN_DAYS = 30;

// Generar ID de sesión seguro
function generateSessionToken() {
  return uuidv4();
}

// Crear sesión
export async function createSession(userId) {
  const token = generateSessionToken();
  const sessionId = uuidv4();
  
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRES_IN_DAYS);

  const session = {
    _id: sessionId,
    token,
    userId,
    expiresAt: expiresAt.toISOString(),
    createdAt: new Date().toISOString()
  };

  await couch.put(`/sessions/${sessionId}`, session);
  
  return {
    token,
    expiresAt
  };
}

// Validar sesión
export async function validateSession(token) {
  if (!token) return { session: null, user: null };

  try {
    // Buscar sesión por token
    const response = await couch.post('/sessions/_find', {
      selector: { token },
      limit: 1
    });

    const session = response.data.docs[0];
    if (!session) return { session: null, user: null };

    // Verificar si expiró
    const now = new Date();
    const expiresAt = new Date(session.expiresAt);
    
    if (now >= expiresAt) {
      // Sesión expirada, eliminar
      await deleteSession(session._id, session._rev);
      return { session: null, user: null };
    }

    // Renovar sesión si está próxima a expirar (menos de 15 días)
    const daysLeft = (expiresAt - now) / (1000 * 60 * 60 * 24);
    if (daysLeft < 15) {
      await renewSession(session);
    }

    // Obtener usuario
    const userResponse = await couch.get(`/users/${session.userId}`);
    const user = userResponse.data;

    return {
      session: {
        id: session._id,
        userId: session.userId,
        expiresAt: session.expiresAt
      },
      user: {
        id: user._id,
        email: user.email,
        isAdmin: user.isAdmin
      }
    };

  } catch (error) {
    return { session: null, user: null };
  }
}

// Renovar sesión
async function renewSession(session) {
  try {
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + SESSION_EXPIRES_IN_DAYS);

    await couch.put(`/sessions/${session._id}`, {
      ...session,
      expiresAt: newExpiresAt.toISOString()
    });
  } catch (error) {
    console.error('Error renovando sesión:', error);
  }
}

// Eliminar sesión
async function deleteSession(sessionId, rev) {
  try {
    await couch.delete(`/sessions/${sessionId}?rev=${rev}`);
  } catch (error) {
    console.error('Error eliminando sesión:', error);
  }
}

// Invalidar sesión por token
export async function invalidateSession(token) {
  try {
    const response = await couch.post('/sessions/_find', {
      selector: { token },
      limit: 1
    });

    const session = response.data.docs[0];
    if (!session) return false;

    await deleteSession(session._id, session._rev);
    return true;
  } catch (error) {
    return false;
  }
}

// Crear cookie de sesión
export function createSessionCookie(token, expiresAt) {
  return {
    name: SESSION_COOKIE_NAME,
    value: token,
    attributes: {
      path: '/',
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      expires: expiresAt
    }
  };
}

// Crear cookie vacía (para logout)
export function createBlankSessionCookie() {
  return {
    name: SESSION_COOKIE_NAME,
    value: '',
    attributes: {
      path: '/',
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      maxAge: 0
    }
  };
}