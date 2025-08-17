import { couch } from './couchDB.js';

const DB_NAME = 'cimu';   


export async function getTodasLasImagenes() {
  try {
    const response = await couch.post(`/${DB_NAME}/_find`, {
      selector: { type: 'carrousel' },
    });
    return response.data.docs;
  } catch (error) {
    console.error('Error al obtener todos las imágenes:', error);
    return [];
  }
}

export async function actualizarImagen(id, datosActualizados) {
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
    console.error('Error al actualizar la imagen:', error);
    return { ok: false, error };
  }
}

export async function eliminarImagen(id, rev) {
  try {
    const response = await couch.delete(`/${DB_NAME}/${id}`, {
      params: { rev }
    });
    return { ok: true, data: response.data };
  } catch (error) {
    console.error('Error al eliminar la imagen:', error);
    return { ok: false, error };
  }
}

export async function getImagenPorId(id) {
  try {
    const response = await couch.get(`/${DB_NAME}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener la imagen:', error);
    return null;
  }
}