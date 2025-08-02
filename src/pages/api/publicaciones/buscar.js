import { couch } from "../../../lib/couchDB";

export async function GET({ request }) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return new Response(JSON.stringify({ error: "ID no proporcionado" }), {
        status: 400,
      });
    }

    const res = await couch.get(`cimu-investigaciones/${id}`);

    return new Response(JSON.stringify(res.data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error("Error al obtener publicación por ID:", error.message);
    return new Response(JSON.stringify({ error: 'Error al obtener publicación' }), {
      status: 500,
    });
  }
}
