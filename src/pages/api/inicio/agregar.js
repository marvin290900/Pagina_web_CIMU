import { couch } from '../../../lib/couchDB.js';

export async function POST({ request }) {
  try {
    const body = await request.json();
    const respuesta = await couch.post('cimu', body); // <-- nombre de tu base
    return new Response(JSON.stringify({ ok: true, data: respuesta.data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error al agregar imagen:', error.message);
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500,
    });
  }
}
