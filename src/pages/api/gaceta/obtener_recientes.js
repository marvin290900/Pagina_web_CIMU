import { couch } from "../../../lib/couchDB";

export async function GET({ request }) {
  try {
    const url = new URL(request.url);
    const coleccion = url.searchParams.get("categoria");

    // console.log("Categoría solicitada:", coleccion); // Debug

    if (!coleccion) {
      return new Response(
        JSON.stringify({ error: "COLECCION no proporcionada" }),
        {
          status: 400,
        }
      );
    }

    // Calcular fecha de hace 7 días
    const fechaActual = new Date();
    const hace7Dias = new Date(fechaActual);
    hace7Dias.setDate(hace7Dias.getDate() - 7);

    // Formatear fechas en ISO format
    const fechaInicio = hace7Dias.toISOString();

    // Query para documentos de los últimos 7 días usando Mango Query
    const query = {
      selector: {
        fecha_publicacion: {
          $gte: fechaInicio,
        },
      },
      sort: [{ fecha_publicacion: "desc" }],
      limit: 30, // Ajusta según necesites
    };
    console.log("Query Mango:", JSON.stringify(query)); // Debug
    let response = await couch.post(`/cimu-gaceta-${coleccion}/_find`, query);

    // console.log("Respuesta de la API:", response.data); // Debug

    // Si no hay resultados en los últimos 7 días, obtener los más recientes
    if (!response.data.docs || response.data.docs.length === 0) {
      console.log(
        "No hay documentos en los últimos 7 días, obteniendo los más recientes"
      );

      // Query para obtener los documentos más recientes (sin filtro de fecha)
      const queryRecientes = {
        selector: {
          fecha_publicacion: {
            $exists: true,
          },
        },
        sort: [{ fecha_publicacion: "desc" }],
        limit: 10, // Obtener los 10 más recientes
      };

      response = await couch.post(
        `/cimu-gaceta-${coleccion}/_find`,
        queryRecientes
      );
    }

    // Formatear respuesta similar a _all_docs
    return new Response(
      JSON.stringify({
        total_rows: response.data.docs.length,
        rows: response.data.docs.map((doc) => ({ doc })),
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error al obtener publicaciones recientes:", error.message);
    return new Response(
      JSON.stringify({ error: "Error al obtener publicaciones recientes" }),
      {
        status: 500,
      }
    );
  }
}
