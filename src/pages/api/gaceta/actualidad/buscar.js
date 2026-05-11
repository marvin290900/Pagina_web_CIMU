import { couch } from "../../../../lib/couchDB";

export async function GET({ request }) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const coleccion = url.searchParams.get("coleccion");
    console.log(id);
    if (!id) {
      return new Response(JSON.stringify({ error: "ID no proporcionado" }), {
        status: 400,
      });
    }

    if (coleccion == "autores") {
      console.log("AUTOR");
      const res = await couch.get(`cimu-gaceta-${coleccion}/${id}`);

      return new Response(JSON.stringify(res.data), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } else {
      console.log("publicacion");
      //Recibir el documento
      const { data: doc } = await couch.get(`cimu-gaceta-${coleccion}/${id}`);

      //aumentar en 1 las visitas
      const actualizarVisitas = {
        ...doc,
        visitas: (doc.visitas || 0) + 1,
        ultima_consulta: new Date().toISOString(),
      };

      //Guardar el documento actualizado
      await couch.put(`cimu-gaceta-${coleccion}/${id}`, actualizarVisitas);

      // return new Response(JSON.stringify(res.data), {
      //   status: 200,
      //   headers: {
      //     "Content-Type": "application/json",
      //     "Access-Control-Allow-Origin": "*",
      //   },
      // });

      // 4. Devolver el documento con la nueva propiedad
      return new Response(JSON.stringify(actualizarVisitas), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
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
