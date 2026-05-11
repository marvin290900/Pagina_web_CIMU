import { couch } from "../../../lib/couchDB";

export async function GET({ request }) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const tipo = url.searchParams.get("tipo"); // 'vistas' o 'descargas'

    if (!id || !tipo) {
      return new Response(
        JSON.stringify({ error: "Faltan parámetros requeridos (id, tipo)" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Obtener el documento actual para obtener el _rev y el valor actual
    const res = await couch.get(`cimu-libros/${id}`);
    if (res.status !== 200) {
      return new Response(JSON.stringify({ error: "Documento no encontrado" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const doc = res.data;

    // Incrementar el contador correspondiente
    if (tipo === "vistas") {
      doc.vistas = (doc.vistas || 0) + 1;
    } else if (tipo === "descargas") {
      doc.descargas = (doc.descargas || 0) + 1;
    } else {
      return new Response(JSON.stringify({ error: "Tipo no válido" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Actualizar el documento en CouchDB
    const updateRes = await couch.put(`cimu-libros/${id}`, doc);

    return new Response(
      JSON.stringify({
        ok: true,
        mensaje: `Contador de ${tipo} actualizado`,
        nuevoValor: doc[tipo],
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Error al actualizar estadísticas del libro:", error.message);
    return new Response(
      JSON.stringify({
        error: "Error interno al actualizar estadísticas",
        detalle: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
