import { couch } from "../../../lib/couchDB";

export async function GET({ request }) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const estado = url.searchParams.get("estado");

    if (!id) {
      return new Response(JSON.stringify({ error: "ID no proporcionada" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Obtener el autor
    const { data: autor } = await couch.get(`/cimu-gaceta-autores/${id}`);

    // Cambiar el estado
    autor.estado = estado === "activo" ? "inactivo" : "activo";

    // Procesar publicaciones del autor
    if (Array.isArray(autor.publicaciones)) {
      await Promise.all(
        autor.publicaciones.map(async (publicacion) => {
          try {
            const { data: pub } = await couch.get(
              `/cimu-gaceta-${publicacion.tipo}/${publicacion.id}`
            );
            pub.estado = autor.estado; // sincroniza estado con el autor
            await couch.put(
              `/cimu-gaceta-${publicacion.tipo}/${publicacion.id}`,
              pub
            );
          } catch (err) {
            console.warn(`⚠️ No se encontró publicación ${publicacion.id}`);
          }
        })
      );
    }

    // Guardar autor actualizado
    await couch.put(`/cimu-gaceta-autores/${id}`, autor);

    return new Response(
      JSON.stringify({
        message: "Autor y publicaciones actualizados correctamente",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error al actualizar autor:", error.message);
    return new Response(
      JSON.stringify({
        error: "Error al actualizar autor",
        mensaje: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
