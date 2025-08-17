import { getImagenPorId, eliminarImagen } from '../../../lib/imagenesCarrusel.js';
import fs from 'fs/promises';
import path from 'path';

const BASE_PATH = '/var/www/cimu/public';

async function eliminarArchivoImagen(fotoUrl) {
  try {
    if (!fotoUrl) {
      console.log('No hay foto para eliminar');
      return;
    }

    const urlSinQuery = fotoUrl.split('?')[0].replace(/^\/+/, '');
    const imagePath = path.join(BASE_PATH, urlSinQuery);
    //console.log('Intentando eliminar imagen en:', imagePath);

    try {
      await fs.access(imagePath);
    } catch {
      console.log('Archivo no existe, no se elimina');
      return;
    }

    await fs.unlink(imagePath);
    //console.log('Imagen eliminada:', imagePath);
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
  }
}


export async function DELETE({ request }) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return new Response(JSON.stringify({ ok: false, error: 'Falta el parámetro: id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const imagen = await getImagenPorId(id);

    if (!imagen) {
      return new Response(JSON.stringify({ ok: false, error: 'Imagen no encontrada' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Eliminar la imagen antes de eliminar el documento
    await eliminarArchivoImagen(imagen.foto);

    const resultado = await eliminarImagen(id, imagen._rev);

    if (resultado.ok) {
      return new Response(JSON.stringify({ ok: true, data: resultado.data }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      return new Response(JSON.stringify({ ok: false, error: resultado.error?.message || 'Error al eliminar' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error en el endpoint DELETE:', error);
    return new Response(JSON.stringify({ ok: false, error: 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
