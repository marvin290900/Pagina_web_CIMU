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

    // Eliminar _id si viene vacío
    if (datos._id === "" || datos._id === null) {
      delete datos._id;
    }

    // Crear documento en CouchDB
    const response = await couch.post(`/cimu-gaceta-${coleccion}`, datos);

    if (response.status !== 201 && response.status !== 200) {
      console.error("Error en respuesta:", response.data);
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

    // Agregar el id y el nombre del autor a la coleccion de autores si es necesario
    if (datos.autor && datos.autor.id && datos.autor.nombre) {
      //Buscar el autor en la coleccion de autores
      const autorResponse = await couch.get(
        `/cimu-gaceta-autores/${datos.autor.id}`
      );
      if (autorResponse.status === 200) {
        //El autor ya existe, agregar el _id de la publicacion a su lista de publicaciones
        let idPublicacion = response.data.id;
        let tipo = datos.tipo;
        let publicaciones = autorResponse.data.publicaciones || [];
        publicaciones.push({ id: idPublicacion, tipo: tipo });
        //Actualizar el autor
        await couch.put(`/cimu-gaceta-autores/${datos.autor.id}`, {
          ...autorResponse.data,
          publicaciones: publicaciones,
        });
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
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
    console.error("❌ Error al crear documento:", error);
    console.error("❌ Stack:", error.stack);
    return new Response(
      JSON.stringify({
        error: "Error al crear documento",
        mensaje: error.message,
        detalles: error.stack,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
