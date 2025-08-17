import { couch } from './couchDB.js';

const DB_NAME = 'cimu';   


export async function getTodosLasImagenes() {
  try {
    const response = await couch.post(`/${DB_NAME}/_find`, {
      selector: { type: 'Carrousel' },
    });
    return response.data.docs;
  } catch (error) {
    console.error('Error al obtener todos las imágenes:', error);
    return [];
  }
}
