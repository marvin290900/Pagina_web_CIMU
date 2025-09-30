import { couch } from "../../../lib/couchDB";

export async function GET({ request }) {
  try {
    const url = new URL(request.url);
    const coleccion = url.searchParams.get("categoria");
    const id = url.searchParams.get("id");
    console.log(coleccion);
    if (!coleccion) {
      return new Response(
        JSON.stringify({ error: "COLECCION no proporcionada" }),
        {
          status: 400,
        }
      );
    }

    if (id) {
      const response = await couch.get(`/cimu-gaceta-${coleccion}/${id}`);

      // Devolver el documento con la nueva propiedad

      return new Response(JSON.stringify(response.data), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } else {
      const response = await couch.get(
        `/cimu-gaceta-${coleccion}/_all_docs?include_docs=true`
      );

      // Devolver el documento con la nueva propiedad
      return new Response(JSON.stringify(response.data), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  } catch (error) {
    console.error("Error al obtener publicación por ID:", error.message);
    return new Response(
      JSON.stringify({ error: "Error al obtener publicación" }),
      {
        status: 500,
      }
    );
  }
}
