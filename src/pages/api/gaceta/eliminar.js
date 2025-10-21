// src/pages/api/gaceta/eliminar.js
import { couch } from "../../../lib/couchDB";

export async function DELETE({ request }) {
  try {
    const url = new URL(request.url);
    const coleccion = url.searchParams.get("coleccion");
    const id = url.searchParams.get("id");

    console.log("=== API ELIMINAR DOCUMENTO ===");
    console.log("1. Colección:", coleccion);
    console.log("2. ID:", id);

    // Validar parámetros requeridos
    if (!coleccion) {
      return new Response(
        JSON.stringify({ error: "Colección no proporcionada" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!id) {
      return new Response(JSON.stringify({ error: "ID no proporcionado" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Primero obtener el documento para obtener el _rev
    console.log("3. Obteniendo documento actual...");
    const documentoActual = await couch.get(`/cimu-gaceta-${coleccion}/${id}`);

    if (documentoActual.status !== 200) {
      console.error("Documento no encontrado");
      return new Response(
        JSON.stringify({ error: "Documento no encontrado" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const rev = documentoActual.data._rev;
    console.log("4. Revision obtenida:", rev);

    // Eliminar el documento en CouchDB
    console.log("5. Eliminando documento...");
    const response = await couch.delete(
      `/cimu-gaceta-${coleccion}/${id}?rev=${rev}`
    );

    console.log("6. Respuesta de CouchDB:", response.status);

    if (response.status !== 200 && response.status !== 201) {
      console.error("Error al eliminar:", response.data);
      return new Response(
        JSON.stringify({
          error: "Error al eliminar el documento",
          detalles: response.data,
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log("7. Documento eliminado exitosamente");
    console.log("=== FIN API ELIMINAR ===");

    // Devolver confirmación
    return new Response(
      JSON.stringify({
        ok: true,
        mensaje: "Documento eliminado exitosamente",
        id: response.data.id,
        rev: response.data.rev,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ Error al eliminar documento:", error);
    console.error("❌ Stack:", error.stack);
    return new Response(
      JSON.stringify({
        error: "Error al eliminar documento",
        mensaje: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
