import fs from 'fs/promises';
import path from 'path';

const BASE_PATH = '/var/www/cimu/public';

export async function POST({ request }) {
  try {
    const { path: url } = await request.json();
    if (!url) {
      return new Response(JSON.stringify({ ok: false, error: 'Falta el parámetro: path' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Limpiar posibles parámetros query como ?v=123
    const urlSinQuery = url.split('?')[0].replace(/^\/+/, '');

    // Ruta absoluta dentro de /public
    const fullPath = path.join(BASE_PATH, urlSinQuery);

    try {
      await fs.access(fullPath);
      await fs.unlink(fullPath);
      console.log('Archivo eliminado:', fullPath);
    } catch {
      console.warn('Archivo no encontrado o ya eliminado:', fullPath);
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error al eliminar archivo:', err);
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
