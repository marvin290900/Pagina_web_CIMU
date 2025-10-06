import { couch } from "../../../lib/couchDB";

export async function GET({ request }) {
  try {
    // Extraer el ID del documento desde los parámetros de la URL
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    // Validar que se haya proporcionado un ID
    if (!id) {
      return new Response(JSON.stringify({ error: "ID no proporcionado" }), {
        status: 400,
      });
    }

    // Obtener el documento principal de la colección cimu-gaceta
    const response = await couch.get(`/cimu-gaceta/${id}`);

    // Verificar que la petición fue exitosa
    if (response.status !== 200) {
      return new Response(
        JSON.stringify({ error: "Error al obtener publicación destacadas" }),
        { status: response.status }
      );
    }

    // Extraer el array de publicaciones del documento
    const publicacionesIds = response.data.publicaciones || [];

    // Si no hay publicaciones, devolver array vacío
    if (publicacionesIds.length === 0) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Crear un array de promesas para obtener cada publicación
    const promesas = publicacionesIds.map(async (publicacionId) => {
      try {
        // Construir la URL de la base de datos según la colección y el ID
        const publicacionDb = await couch.get(
          `/cimu-gaceta-${publicacionId.coleccion}/${publicacionId.id}`
        );

        // Si la petición es exitosa, retornar los datos
        if (publicacionDb.status === 200) {
          return publicacionDb.data;
        } else {
          console.error(
            `Error al obtener publicación ${publicacionId.id}:`,
            publicacionDb.statusText
          );
          return null;
        }
      } catch (error) {
        console.error(`Error en petición para ${publicacionId.id}:`, error);
        return null;
      }
    });

    // Esperar a que todas las peticiones se completen
    const resultados = await Promise.all(promesas);

    // Filtrar los resultados nulos (publicaciones que no se pudieron obtener)
    const publicaciones = resultados.filter((p) => p !== null);

    // Devolver el array de publicaciones
    return new Response(JSON.stringify(publicaciones), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error al obtener publicación por ID:", error.message);
    return new Response(
      JSON.stringify({
        error: "Error al obtener publicación destacadas",
        message: error.message,
      }),
      { status: 500 }
    );
  }
}
