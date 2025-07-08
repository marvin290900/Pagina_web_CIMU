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
