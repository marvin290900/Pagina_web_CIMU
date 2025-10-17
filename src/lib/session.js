// src/lib/session.js - VERSIÓN FINAL SIMPLIFICADA
import { couch } from './couchDB.js';
import { v4 as uuidv4 } from 'uuid';

const SESSION_COOKIE_NAME = 'session';
const SESSION_EXPIRES_IN_DAYS = 30;

function generateSessionToken() {
  return uuidv4();
}

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
    createdAt: new Date().toISOString(),
  };

  await couch.put(`/sessions/${sessionId}`, session);
  
  return { token, expiresAt };
}

export async function validateSession(token) {
  if (!token) return { session: null, user: null };

  try {
    const response = await couch.post('/sessions/_find', {
      selector: { token },
      limit: 1
    });

    const session = response.data.docs[0];
    if (!session) return { session: null, user: null };

    const now = new Date();
    const expiresAt = new Date(session.expiresAt);
    
    if (now >= expiresAt) {
      await deleteSession(session._id, session._rev);
      return { session: null, user: null };
    }

    const daysLeft = (expiresAt - now) / (1000 * 60 * 60 * 24);
    if (daysLeft < 15) {
      await renewSession(session);
    }

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

async function deleteSession(sessionId, rev) {
  try {
    await couch.delete(`/sessions/${sessionId}?rev=${rev}`);
  } catch (error) {
    console.error('Error eliminando sesión:', error);
  }
}

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

// Usar directamente import.meta.env.PROD
export function createSessionCookie(token, expiresAt) {
  return {
    name: SESSION_COOKIE_NAME,
    value: token,
    attributes: {
      path: '/',
      httpOnly: true,
      secure: import.meta.env.PROD, // ✅ Así de simple
      sameSite: 'lax',
      expires: expiresAt
    }
  };
}

export function createBlankSessionCookie() {
  return {
    name: SESSION_COOKIE_NAME,
    value: '',
    attributes: {
      path: '/',
      httpOnly: true,
      secure: import.meta.env.PROD, // ✅ Así de simple
      sameSite: 'lax',
      maxAge: 0
    }
  };
}