import fs from "fs";
import path from "path";
import { couch } from "../../../lib/couchDB";

export async function PUT({ request }) {
  try {
    const url = new URL(request.url);
    const coleccion = url.searchParams.get("coleccion");
    const id = url.searchParams.get("id");

    // Validar parámetros requeridos
    if (!coleccion) {
      return new Response(
        JSON.stringify({ error: "Colección no proporcionada" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!id) {
      return new Response(JSON.stringify({ error: "ID no proporcionado" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Obtener los datos del body
    const datos = await request.json();

    if (!datos || Object.keys(datos).length === 0) {
      return new Response(
        JSON.stringify({ error: "No se proporcionaron datos para actualizar" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Primero obtener el documento actual para obtener el _rev
    const documentoActual = await couch.get(`/cimu-gaceta-${coleccion}/${id}`);

    if (documentoActual.status !== 200) {
      return new Response(
        JSON.stringify({ error: "Documento no encontrado" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // --- Función auxiliar para eliminar archivos locales ---
    const eliminarArchivo = async (rutaRelativa) => {
      try {
        if (!rutaRelativa || rutaRelativa.startsWith("http")) return;
        const rutaAbsoluta = path.resolve(
          process.cwd(),
          "public",
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

    // Detectar imágenes eliminadas
    const imgViejas = documentoActual.data.imagenes || {};
    const imgNuevas = datos.imagenes || {};
    const urlsAEliminar = [];

    // Portada
    if (imgViejas.portada?.url && imgViejas.portada.url !== imgNuevas.portada?.url) {
      urlsAEliminar.push(imgViejas.portada.url);
    }
    // Galeria
    const galeriasNuevas = (imgNuevas.galeria || []).map(g => g.url);
    if (Array.isArray(imgViejas.galeria)) {
      for (const img of imgViejas.galeria) {
        if (img?.url && !galeriasNuevas.includes(img.url)) {
          urlsAEliminar.push(img.url);
        }
      }
    }

    // Eliminar los archivos huérfanos
    await Promise.all(urlsAEliminar.map(eliminarArchivo));

    // Combinar datos actuales con los nuevos (manteniendo _id y _rev)
    const documentoActualizado = {
      ...documentoActual.data,
      ...datos,
      _id: documentoActual.data._id,
      _rev: documentoActual.data._rev,
    };

    // Actualizar el documento en CouchDB
    const response = await couch.put(
      `/cimu-gaceta-${coleccion}/${id}`,
      documentoActualizado
    );

    if (response.status !== 200 && response.status !== 201) {
      return new Response(
        JSON.stringify({ error: "Error al actualizar el documento" }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Devolver el documento actualizado
    return new Response(
      JSON.stringify({
        mensaje: "Documento actualizado exitosamente",
        data: response.data,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error al actualizar documento:", error.message);
    return new Response(
      JSON.stringify({
        error: "Error al actualizar documento",
        mensaje: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
