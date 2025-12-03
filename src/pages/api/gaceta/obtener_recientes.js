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
    const fechaInicio = hace7Dias.toISOString();

    let response;
    let docs = [];

    // Estrategia 1: Obtener documentos activos y ordenar/filtrar en memoria
    // Esto evita problemas con índices en CouchDB
    try {
      const queryRecientes = {
        selector: {
          estado: "activo", // Solo publicaciones activas
        },
        limit: 50, // Obtener más documentos para filtrar después
      };

      console.log("Query Mango (recientes):", JSON.stringify(queryRecientes));
      response = await couch.post(
        `/cimu-gaceta-${coleccion}/_find`,
        queryRecientes
      );

      docs = response.data?.docs || response.docs || [];

      // Filtrar y ordenar en memoria
      if (docs.length > 0) {
        // Filtrar documentos con fecha_publicacion válida
        docs = docs.filter((doc) => doc.fecha_publicacion);

        // Ordenar por fecha descendente
        docs.sort((a, b) => {
          const fechaA = new Date(a.fecha_publicacion);
          const fechaB = new Date(b.fecha_publicacion);
          return fechaB - fechaA; // Orden descendente
        });

        // Filtrar los de los últimos 7 días
        const docsRecientes = docs.filter((doc) => {
          const fechaDoc = new Date(doc.fecha_publicacion);
          return fechaDoc >= hace7Dias;
        });

        // Si hay documentos de los últimos 7 días, usarlos
        if (docsRecientes.length > 0) {
          docs = docsRecientes.slice(0, 30);
          console.log(
            `Encontrados ${docs.length} documentos de los últimos 7 días`
          );
        } else {
          // Si no hay de los últimos 7 días, usar los más recientes disponibles
          docs = docs.slice(0, 10);
          console.log(
            "No hay documentos de los últimos 7 días, usando los más recientes disponibles"
          );
        }
      }
    } catch (error) {
      console.error("Error en query inicial:", error.message);
      
      // Estrategia 2: Si falla, intentar con query más simple (solo estado)
      try {
        const querySimple = {
          selector: {
            estado: "activo",
          },
          limit: 50,
        };

        response = await couch.post(
          `/cimu-gaceta-${coleccion}/_find`,
          querySimple
        );

        docs = response.data?.docs || response.docs || [];

        // Filtrar y ordenar en memoria
        docs = docs
          .filter((doc) => doc.fecha_publicacion)
          .sort((a, b) => {
            const fechaA = new Date(a.fecha_publicacion);
            const fechaB = new Date(b.fecha_publicacion);
            return fechaB - fechaA; // Orden descendente
          })
          .filter((doc) => {
            const fechaDoc = new Date(doc.fecha_publicacion);
            return fechaDoc >= hace7Dias;
          })
          .slice(0, 30);

        // Si no hay de los últimos 7 días, tomar los más recientes
        if (docs.length === 0) {
          docs = (response.data?.docs || response.docs || [])
            .filter((doc) => doc.fecha_publicacion)
            .sort((a, b) => {
              const fechaA = new Date(a.fecha_publicacion);
              const fechaB = new Date(b.fecha_publicacion);
              return fechaB - fechaA;
            })
            .slice(0, 10);
        }
      } catch (error2) {
        console.error("Error en query alternativa:", error2.message);
        throw error2;
      }
    }

    // Formatear respuesta similar a _all_docs
    return new Response(
      JSON.stringify({
        total_rows: docs.length,
        rows: docs.map((doc) => ({ doc })),
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
