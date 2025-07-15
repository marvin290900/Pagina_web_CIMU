import { actualizarInvestigador } from '../../../lib/investigadores.js';

export async function PUT({ params, request }) {
  const id = params.id;
  const datos = await request.json();

  if (!id || !datos) {
    return new Response(JSON.stringify({ ok: false, error: 'Faltan datos' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const resultado = await actualizarInvestigador(id, datos);

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
