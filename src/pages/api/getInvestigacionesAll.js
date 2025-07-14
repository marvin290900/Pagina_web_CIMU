import { couch } from "../../lib/couchDB";
export async function GET() {
  try {
    const res = await couch.get('cimu-investigaciones/_all_docs?include_docs=true');
    return new Response(JSON.stringify(res.data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // opcional si usarás esto desde otro frontend
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error al obtener datos' }), {
      status: 500,
    });
  }
}
