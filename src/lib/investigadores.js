import { couch } from './couchDB.js';

const DB_NAME = 'cimu';   

export async function getInvestigadoresDirectivos() {
  try {
    const response = await couch.post(`/${DB_NAME}/_find`, {
      selector: { type: 'investigador', categoria: 'Directivo' }
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
      selector: { type: 'investigador', categoria: 'Investigador_Pasante' }
    });
    return response.data.docs;
  } catch (error) {
    console.error('Error al obtener investigadores:', error);
    return [];
  }
}

export async function getInvestigadoresExternos() {
  try {
    const response = await couch.post(`/${DB_NAME}/_find`, {
      selector: { type: 'investigador', categoria: 'Investigador_Externo' }
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

export async function getTodosLosInvestigadores() {
  try {
    const response = await couch.post(`/${DB_NAME}/_find`, {
      selector: { type: 'investigador' },
    });
    return response.data.docs;
  } catch (error) {
    console.error('Error al obtener todos los investigadores:', error);
    return [];
  }
}

export async function actualizarInvestigador(id, datosActualizados) {
  try {
    // Primero obtenemos el documento completo para obtener _rev
    const docActual = await couch.get(`/${DB_NAME}/${id}`);
    const doc = docActual.data;

    // Actualizamos los campos con los datos que vienen en datosActualizados
    const docActualizado = {
      ...doc,
      ...datosActualizados,
    };

    // Guardamos el documento actualizado (PUT)
    const response = await couch.put(`/${DB_NAME}/${id}`, docActualizado);
    return { ok: true, data: response.data };
  } catch (error) {
    console.error('Error al actualizar investigador:', error);
    return { ok: false, error };
  }
}


export async function eliminarInvestigador(id, rev) {
  try {
    const response = await couch.delete(`/${DB_NAME}/${id}`, {
      params: { rev }
    });
    return { ok: true, data: response.data };
  } catch (error) {
    console.error('Error al eliminar el investigador:', error);
    return { ok: false, error };
  }
}