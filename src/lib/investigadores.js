import { couch } from '../lib/couchDB.js';

const DB_NAME = 'cimu';

// Obtener todos los documentos que sean investigadores usando _find y selector
export async function getInvestigadoresDirectivos() {
  try {
    const response = await couch.post(`/${DB_NAME}/_find`, {
      selector: { type: 'investigador',
        categoria: 'directivo' }
    });
    return response.data.docs;
  } catch (error) {
    console.error('Error al obtener investigadores:', error);
    return [];
  }
}

export async function getInvestigadoresPasantes() {
  try {
    const response = await couch.post(`/${DB_NAME}/_find`, {
      selector: { type: 'investigador',
        categoria: 'pasantes' }
    });
    return response.data.docs;
  } catch (error) {
    console.error('Error al obtener investigadores:', error);
    return [];
  }
}

// Obtener un investigador por id (que sería el _id de CouchDB)
export async function getInvestigadorPorId(id) {
  try {
    const response = await couch.get(`/${DB_NAME}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener investigador:', error);
    return null;
  }
}


export async function agregarInvestigador({ nombre, correo, cargo, categoria, archivo }) {
  try {
    const id = correo.split('@')[0].toLowerCase(); // genera ID desde el correo

    const doc = {
      _id: id,
      type: 'investigador',
      categoria,
      nombre,
      correo,
      cargo,
      foto: archivo ? archivo.name : null
    };

    // 1. Crear documento
    const res = await couch.put(`/${DB_NAME}/${id}`, doc);

    // 2. Adjuntar imagen si viene
    if (archivo) {
      await couch.put(`/${DB_NAME}/${id}/${archivo.name}`, archivo.buffer, {
        headers: {
          'Content-Type': archivo.mimetype
        },
        params: {
          rev: res.data.rev
        }
      });
    }

    return { ok: true, id };
  } catch (error) {
    console.error('Error al agregar investigador:', error);
    if (error.response?.status === 409) {
      return { ok: false, error: 'Ya existe un investigador con ese correo' };
    }
    return { ok: false, error };
  }
}
