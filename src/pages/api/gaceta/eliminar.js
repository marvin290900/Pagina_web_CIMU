import fs from "fs";
import path from "path";
import { couch } from "../../../lib/couchDB";

export async function DELETE({ request }) {
  try {
    const url = new URL(request.url);
    const coleccion = url.searchParams.get("coleccion");
    const id = url.searchParams.get("id");

    if (!coleccion || !id) {
      return new Response(
        JSON.stringify({
          error: "Faltan parámetros requeridos (coleccion, id)",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Obtener el documento actual
    const documentoActual = await couch.get(`/cimu-gaceta-${coleccion}/${id}`);
    if (documentoActual.status !== 200) {
      return new Response(
        JSON.stringify({ error: "Documento no encontrado" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const rev = documentoActual.data._rev;
    const data = documentoActual.data;

    // --- Función auxiliar para eliminar archivos locales ---
    const eliminarArchivo = async (rutaRelativa) => {
      try {
        if (!rutaRelativa || rutaRelativa.startsWith("http")) return;
        const rutaAbsoluta = path.resolve(
          process.cwd(),
          rutaRelativa.replace(/^\/+/, "")
        );
        await fs.promises.access(rutaAbsoluta, fs.constants.F_OK);
        await fs.promises.unlink(rutaAbsoluta);
      } catch (error) {
        if (error.code !== "ENOENT") {
          console.error("Error eliminando archivo:", rutaRelativa, error);
        }
      }
    };

    // --- Función para eliminar imágenes de un documento ---
    const eliminarImagenesDeDocumento = async (doc) => {
      const imagenes = doc.imagenes || {};
      const urlsAEliminar = [];

      if (imagenes.portada?.url) urlsAEliminar.push(imagenes.portada.url);
      if (Array.isArray(imagenes.galeria)) {
        for (const img of imagenes.galeria) {
          if (img?.url) urlsAEliminar.push(img.url);
        }
      }

      await Promise.all(urlsAEliminar.map(eliminarArchivo));
    };

    // Si se elimina un AUTOR → eliminar también sus publicaciones
    if (coleccion === "autores") {
      const publicaciones = data.publicaciones || [];

      await Promise.all(
        publicaciones.map(async (pub) => {
          try {
            const pubDoc = await couch.get(
              `/cimu-gaceta-${pub.tipo}/${pub.id}`
            );
            if (pubDoc.status === 200) {
              // eliminar imágenes asociadas
              await eliminarImagenesDeDocumento(pubDoc.data);

              // eliminar publicación de CouchDB
              await couch.delete(
                `/cimu-gaceta-${pub.tipo}/${pub.id}?rev=${pubDoc.data._rev}`
              );
            }
          } catch (err) {
            console.warn(
              `⚠️ No se pudo eliminar publicación ${pub.id}:`,
              err.message
            );
          }
        })
      );
    } else {
      // Si se elimina una publicación → quitarla del autor
      if (data.autor && data.autor.id) {
        try {
          const autorDoc = await couch.get(
            `/cimu-gaceta-autores/${data.autor.id}`
          );
          if (autorDoc.status === 200) {
            const publicaciones = autorDoc.data.publicaciones || [];
            // Filtro robusto: elimina la publicación actual y limpia objetos sin ID
            autorDoc.data.publicaciones = publicaciones.filter(
              (pub) => pub.id && pub.id !== id
            );
            await couch.put(
              `/cimu-gaceta-autores/${data.autor.id}`,
              autorDoc.data
            );
          }
        } catch (err) {
          console.warn("⚠️ No se pudo actualizar autor:", err.message);
        }
      }
    }

    // 4️⃣ Eliminar imágenes del documento actual
    await eliminarImagenesDeDocumento(data);

    // 5️⃣ Eliminar el documento principal
    const response = await couch.delete(
      `/cimu-gaceta-${coleccion}/${id}?rev=${rev}`
    );
    if (![200, 201].includes(response.status)) {
      throw new Error("Error al eliminar documento en CouchDB");
    }

    return new Response(
      JSON.stringify({
        ok: true,
        mensaje:
          coleccion === "autores"
            ? "Autor y sus publicaciones eliminados correctamente"
            : "Publicación eliminada exitosamente",
        id: response.data.id,
        rev: response.data.rev,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ Error al eliminar documento:", error);
    return new Response(
      JSON.stringify({
        error: "Error al eliminar documento",
        mensaje: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
