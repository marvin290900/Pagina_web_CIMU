import { couch } from "../../../lib/couchDB";
export async function GET({ request }) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const coleccion = url.searchParams.get("coleccion");

  // Si el id existe, consultar el documento por ID
  if (!id && !coleccion) {
    return new Response(JSON.stringify({ error: "ID no proporcionado" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (coleccion === "investigadores") {
    try {
      const res = await couch.get(`${coleccion}/_all_docs?include_docs=true`);
      return new Response(JSON.stringify(res.data), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({ error: "Error al obtener libros por colección" }),
        {
          status: 500,
        }
      );
    }
  }

  if (id === "colecciones") {
    // es para el documentos que tiene las colecciones de la editorial
    try {
      const res = await couch.get(`cimu-libros/${id}`);
      return new Response(JSON.stringify(res.data), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({ error: "Error al obtener colecciones" }),
        {
          status: 500,
        }
      );
    }
  }
}
