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

    if (coleccion && coleccion === "autores") {
      const response = await couch.get(
        `/cimu-gaceta-${coleccion}/_all_docs?include_docs=true`
      );
      console.log("Response data:", response.data);
      return new Response(JSON.stringify(response.data), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Construir selector
    let selector = {
      estado: { $in: ["activo", "inactivo"] },
      fecha_publicacion: { $gt: null } 
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

    // Query SIN sort en la DB para evitar problemas de índices
    const query = {
      selector: selector,
      limit: 1000,
    };

    const response = await couch.post(`/cimu-gaceta-${coleccion}/_find`, query);
    
    // ORDENAR EN MEMORIA (JavaScript) para evitar errores de CouchDB
    const docs = response.data.docs.sort((a, b) => {
      const fechaA = new Date(a.fecha_publicacion || 0);
      const fechaB = new Date(b.fecha_publicacion || 0);
      return fechaB - fechaA; // Orden descendente (más recientes primero)
    });

    return new Response(
      JSON.stringify({
        total_rows: docs.length,
        rows: docs.map((doc) => ({ doc })),
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
