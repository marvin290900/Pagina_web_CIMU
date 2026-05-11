import { actualizarImagen } from '../../../lib/imagenesCarrusel.js';

export async function PUT({ request }) {
  const body = await request.json();
  const id = body.id;
  const datos = { ...body };
  delete datos.id; // eliminamos id del objeto a actualizar

  if (!id || Object.keys(datos).length === 0) {
    return new Response(JSON.stringify({ ok: false, error: 'Faltan datos' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const resultado = await actualizarImagen(id, datos);

  if (resultado.ok) {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } else {
    return new Response(JSON.stringify({ ok: false, error: resultado.error.message || 'Error desconocido' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}