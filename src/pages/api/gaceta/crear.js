// src/pages/api/gaceta/crear.js
import { couch } from "../../../lib/couchDB";

export async function POST({ request }) {
  try {
    const url = new URL(request.url);
    const coleccion = url.searchParams.get("coleccion");

    if (!coleccion) {
      return new Response(
        JSON.stringify({ error: "Colección no proporcionada" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Obtener datos del body
    const datos = await request.json();

    if (!datos || Object.keys(datos).length === 0) {
      return new Response(
        JSON.stringify({ error: "No se proporcionaron datos" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Crear documento en CouchDB
    const response = await couch.post(`/cimu-gaceta-${coleccion}`, datos);

    if (response.status !== 201 && response.status !== 200) {
      return new Response(
        JSON.stringify({
          error: "Error al crear el documento",
          detalles: response.data,
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        mensaje: "Documento creado exitosamente",
        id: response.data.id,
        rev: response.data.rev,
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error al crear documento:", error.message);
    return new Response(
      JSON.stringify({
        error: "Error al crear documento",
        mensaje: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
