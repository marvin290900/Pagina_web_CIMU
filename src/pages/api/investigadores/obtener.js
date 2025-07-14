import { getTodosLosInvestigadores } from '../../../lib/investigadores.js';

export async function GET() {
  try {
    const investigadores = await getTodosLosInvestigadores();
    return new Response(JSON.stringify({ ok: true, docs: investigadores }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error en la API:', error);
    return new Response(JSON.stringify({ ok: false, error: 'No se pudieron obtener los investigadores' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}
