import { getInvestigadorPorId, eliminarInvestigador } from '../../../lib/investigadores.js';

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

