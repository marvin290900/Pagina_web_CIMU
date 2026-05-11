// src/lib/auth.js
// Funciones de autenticación
import { couch } from './couchDB.js';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

// Crear usuario
export async function createUser(email, password, isAdmin = false) {
  const existing = await findUserByEmail(email);
  if (existing) {
    throw new Error('El email ya está registrado');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const userId = uuidv4();

  const user = {
    _id: userId,
    email,
    passwordHash,
    isAdmin,
    createdAt: new Date().toISOString()
  };

  await couch.put(`/users/${userId}`, user);
  return user;
}

// Buscar usuario por email
export async function findUserByEmail(email) {
  try {
    const response = await couch.post('/users/_find', {
      selector: { email },
      limit: 1
    });

    return response.data.docs[0] || null;
  } catch (error) {
    console.error('Error buscando usuario:', error);
    return null;
  }
}

// Autenticar usuario
export async function authenticateUser(email, password) {

  const user = await findUserByEmail(email);
  if (!user) return null;

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) return null;

  return user;
}

// Inicializar bases de datos
export async function initDatabases() {
  try {
    try {
      await couch.put('/users');
      console.log('DB "users" creada');
    } catch (e) {
      if (e.response?.status !== 412) throw e;
    }

    try {
      await couch.put('/sessions');
      console.log('DB "sessions" creada');
    } catch (e) {
      if (e.response?.status !== 412) throw e;
    }

    await couch.post('/users/_index', {
      index: { fields: ['email'] },
      name: 'email-index'
    });

    await couch.post('/sessions/_index', {
      index: { fields: ['token'] },
      name: 'token-index'
    });

    console.log('✅ Bases de datos inicializadas');
  } catch (error) {
    console.error('Error:', error);
  }
}