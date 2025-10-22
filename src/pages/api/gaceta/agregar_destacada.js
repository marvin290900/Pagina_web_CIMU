// src/pages/api/gaceta/actualizar_publicaciones.js
import { couch } from "../../../lib/couchDB";

export async function PUT({ request }) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const accion = url.searchParams.get("accion"); // 'agregar' o 'eliminar'

    if (!id) {
      return new Response(JSON.stringify({ error: "ID no proporcionado" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!accion || !["agregar", "eliminar"].includes(accion)) {
      return new Response(
        JSON.stringify({
          error: "Acción inválida. Usar 'agregar' o 'eliminar'",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Obtener los datos del body
    const datos = await request.json();
    console.log("Datos recibidos:", datos);

    if (!datos || Object.keys(datos).length === 0) {
      return new Response(
        JSON.stringify({ error: "No se proporcionaron datos" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Obtener el documento actual
    const documentoActual = await couch.get(`/cimu-gaceta/${id}`);

    if (documentoActual.status !== 200) {
      return new Response(
        JSON.stringify({ error: "Documento no encontrado" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Inicializar array si no existe
    if (!documentoActual.data.publicaciones) {
      documentoActual.data.publicaciones = [];
    }

    let documentoActualizado = { ...documentoActual.data };

    // AGREGAR publicación
    if (accion === "agregar") {
      // Validar campos requeridos
      if (!datos.id || !datos.coleccion) {
        return new Response(
          JSON.stringify({
            error: "Se requiere 'id' y 'coleccion' en los datos",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Verificar si ya existe
      const existe = documentoActualizado.publicaciones.some(
        (pub) => pub.id === datos.id && pub.coleccion === datos.coleccion
      );

      if (existe) {
        return new Response(
          JSON.stringify({
            ok: false,
            mensaje: "La publicación ya existe en la lista",
          }),
          {
            status: 409,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Agregar nueva publicación
      documentoActualizado.publicaciones.push({
        id: datos.id,
        coleccion: datos.coleccion,
      });

      console.log("Publicación agregada");
    }

    // ELIMINAR publicación
    else if (accion === "eliminar") {
      if (!datos.id) {
        return new Response(
          JSON.stringify({ error: "Se requiere 'id' para eliminar" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      const indexOriginal = documentoActualizado.publicaciones.length;

      documentoActualizado.publicaciones =
        documentoActualizado.publicaciones.filter((pub) => pub.id !== datos.id);

      const indexNuevo = documentoActualizado.publicaciones.length;

      if (indexOriginal === indexNuevo) {
        return new Response(
          JSON.stringify({
            ok: false,
            mensaje: "Publicación no encontrada en la lista",
          }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      console.log("Publicación eliminada");
    }

    // Actualizar en CouchDB
    const response = await couch.put(
      `/cimu-gaceta/${id}`,
      documentoActualizado
    );

    if (response.status !== 200 && response.status !== 201) {
      return new Response(
        JSON.stringify({
          error: "Error al actualizar el documento",
          detalles: response.data,
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log("Documento actualizado exitosamente");
    console.log(
      "Total publicaciones:",
      documentoActualizado.publicaciones.length
    );

    return new Response(
      JSON.stringify({
        ok: true,
        mensaje: `Publicación ${
          accion === "agregar" ? "agregada" : "eliminada"
        } exitosamente`,
        total_publicaciones: documentoActualizado.publicaciones.length,
        data: {
          id: response.data.id,
          rev: response.data.rev,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error al actualizar publicaciones:", error.message);
    return new Response(
      JSON.stringify({
        ok: false,
        error: "Error al actualizar publicaciones",
        mensaje: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
