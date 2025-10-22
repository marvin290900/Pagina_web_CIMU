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
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Obtener documento por ID
    if (id) {
      const response = await couch.get(`/cimu-gaceta-${coleccion}/${id}`);
      return new Response(JSON.stringify(response.data), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Construir selector
    let selector = {
      estado: "activo",
    };

    // Agregar filtro de año si existe
    if (anio) {
      const fechaInicio = `${anio}-01-01T00:00:00Z`;
      const fechaFin = `${anio}-12-31T23:59:59Z`;

      selector.fecha_publicacion = {
        $gte: fechaInicio,
        $lte: fechaFin,
      };
    }

    // Query SOLO con ordenamiento por fecha descendente
    const query = {
      selector: selector,
      sort: [
        { fecha_publicacion: "desc" }, // Solo una dirección
      ],
      limit: 1000,
    };

    const response = await couch.post(`/cimu-gaceta-${coleccion}/_find`, query);

    return new Response(
      JSON.stringify({
        total_rows: response.data.docs.length,
        rows: response.data.docs.map((doc) => ({ doc })),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error al obtener publicación:", error.message);
    return new Response(
      JSON.stringify({
        error: "Error al obtener publicación",
        mensaje: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
