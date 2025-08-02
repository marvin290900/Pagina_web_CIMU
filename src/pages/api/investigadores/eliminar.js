import { getInvestigadorPorId, eliminarInvestigador } from '../../../lib/investigadores.js';
import fs from 'fs/promises';
import path from 'path';

async function eliminarArchivoImagen(fotoUrl) {
  try {
    if (!fotoUrl) {
      console.log('No hay foto para eliminar');
      return;
    }

    const urlSinQuery = fotoUrl.split('?')[0];
    const imagePath = path.join(process.cwd(), 'public', urlSinQuery);
    console.log('Intentando eliminar imagen en:', imagePath);

    try {
      await fs.access(imagePath);
    } catch {
      console.log('Archivo no existe, no se elimina');
      return;
    }

    await fs.unlink(imagePath);
    console.log('Imagen eliminada:', imagePath);
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
  }
}

async function eliminarArchivoCV(cvUrl) {
  try {
    if (!cvUrl) {
      console.log('No hay CV para eliminar');
      return;
    }

    const urlSinQuery = cvUrl.split('?')[0];
    const cvPath = path.join(process.cwd(), 'public', urlSinQuery);
    console.log('Intentando eliminar CV en:', cvPath);

    try {
      await fs.access(cvPath);
    } catch {
      console.log('Archivo CV no existe, no se elimina');
      return;
    }

    await fs.unlink(cvPath);
    console.log('CV eliminado:', cvPath);
  } catch (error) {
    console.error('Error al eliminar CV:', error);
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

    const investigador = await getInvestigadorPorId(id);

    if (!investigador) {
      return new Response(JSON.stringify({ ok: false, error: 'Investigador no encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Eliminar la imagen y el CV antes de eliminar el documento
    await eliminarArchivoImagen(investigador.foto);
    await eliminarArchivoCV(investigador.cv);

    const resultado = await eliminarInvestigador(id, investigador._rev);

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
