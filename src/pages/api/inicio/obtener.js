import { getTodasLasImagenes } from '../../../lib/imagenesCarrusel.js';

export async function GET() {
  try {
    const imagenes = await getTodasLasImagenes();
    return new Response(JSON.stringify({ ok: true, docs: imagenes }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error en la API:', error);
    return new Response(JSON.stringify({ ok: false, error: 'No se pudieron obtener las imagenes' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}
