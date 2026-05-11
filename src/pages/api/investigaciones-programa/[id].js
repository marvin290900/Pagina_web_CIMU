// src/pages/api/investigaciones/programa/[id].js
import { couch } from "../../../lib/couchDB.js";

export async function GET({ params }) {
  const { id } = params;
  if (!id) {
    return new Response(JSON.stringify({ ok: false, error: "Falta el parámetro id" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = {
      selector: { programa: id },
    };



    const respuesta = await couch.post("investigaciones/_find", body);

    console.log("Respuesta de CouchDB:", respuesta.data);

    return new Response(JSON.stringify({ ok: true, data: respuesta.data.docs }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error al obtener investigaciones por programa:", error);
    return new Response(JSON.stringify({ ok: false, error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
