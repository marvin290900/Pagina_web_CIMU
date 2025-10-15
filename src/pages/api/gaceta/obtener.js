import { couch } from "../../../lib/couchDB";

export async function GET({ request }) {
  try {
    const url = new URL(request.url);
    const coleccion = url.searchParams.get("categoria");
    const id = url.searchParams.get("id");
    const anio = url.searchParams.get("anio");

    if (!coleccion) {
      return new Response(
        JSON.stringify({ error: "COLECCION no proporcionada" }),
        {
          status: 400,
        }
      );
    }

    // Obtener documento por ID
    if (id) {
      const response = await couch.get(`/cimu-gaceta-${coleccion}/${id}`);

      return new Response(JSON.stringify(response.data), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
    // Filtrar por año usando Mango Query
    else if (anio) {
      // Crear rango de fechas para el año
      const fechaInicio = `${anio}-01-01T00:00:00Z`;
      const fechaFin = `${anio}-12-31T23:59:59Z`;

      // Query usando Mango
      const query = {
        selector: {
          fecha_publicacion: {
            $gte: fechaInicio,
            $lte: fechaFin,
          },
        },
        limit: 1000, // Ajusta según necesites
      };

      const response = await couch.post(
        `/cimu-gaceta-${coleccion}/_find`,
        query
      );

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
    }
    // Obtener todos los documentos
    else {
      const response = await couch.get(
        `/cimu-gaceta-${coleccion}/_all_docs?include_docs=true`
      );

      return new Response(JSON.stringify(response.data), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  } catch (error) {
    console.error("Error al obtener publicación:", error.message);
    return new Response(
      JSON.stringify({ error: "Error al obtener publicación" }),
      {
        status: 500,
      }
    );
  }
}
