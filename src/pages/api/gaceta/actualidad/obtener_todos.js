import { couch } from "../../../../lib/couchDB";
export async function GET() {
  try {
    const response = await couch.get(
      "/cimu-gaceta-actualidad/_all_docs?include_docs=true"
    );

    // CouchDB devuelve algo como { total_rows, offset, rows }
    return new Response(JSON.stringify(response.data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error API:", error.message);
    return new Response(JSON.stringify({ error: "Error al obtener datos" }), {
      status: 500,
    });
  }
}
