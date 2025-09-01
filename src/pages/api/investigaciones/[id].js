import { couch } from "../../../lib/couchDB.js";

export async function GET({ params }) {
  try {
    const { id } = params;

    if (!id) {
      return new Response(
        JSON.stringify({ ok: false, error: "Falta el id en la ruta" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const respuesta = await couch.get(`investigaciones/${id}`);

    if (!respuesta.data) {
      return new Response(
        JSON.stringify({ ok: false, error: "Investigación no encontrada" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ ok: true, data: respuesta.data }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error GET por ID:", error);
    return new Response(
      JSON.stringify({ ok: false, error: String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}