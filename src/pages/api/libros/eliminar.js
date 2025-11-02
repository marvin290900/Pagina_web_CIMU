// src/pages/api/libros/eliminar.js
import { couch } from "../../../lib/couchDB";
import fs from "fs";
import path from "path";

const BASE_PATH = "/var/www/cimu/public";

// Función helper para eliminar archivo
const eliminarArchivo = (url) => {
  if (!url) return false;

  try {
    // Extraer path relativo de la URL
    const urlObj = new URL(url, "http://localhost");
    const relativePath = urlObj.pathname;
    const fullPath = path.join(BASE_PATH, relativePath);

    console.log("      Intentando eliminar archivo:", fullPath);

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log("      ✓ Archivo eliminado:", relativePath);
      return true;
    } else {
      console.log("      ⚠ Archivo no existe:", fullPath);
      return false;
    }
  } catch (error) {
    console.error("      ✗ Error al eliminar archivo:", url, error.message);
    return false;
  }
};

export async function DELETE({ request }) {
  console.log("=== API ELIMINAR LIBRO ===");

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    console.log("1. ID del libro:", id);

    if (!id) {
      return new Response(JSON.stringify({ error: "ID no proporcionado" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Obtener el libro para saber qué autores actualizar y qué archivos eliminar
    const libroActual = await couch.get(`/cimu-libros/${id}`);

    if (libroActual.status !== 200) {
      return new Response(JSON.stringify({ error: "Libro no encontrado" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const libro = libroActual.data;
    const autores = libro.autores || [];
    const rev = libro._rev;

    console.log("2. Libro encontrado:", libro.titulo);
    console.log(
      "3. Autores del libro:",
      autores.map((a) => a.nombre)
    );
    console.log("4. Archivos a eliminar:");
    console.log("   - Portada:", libro.portada);
    console.log("   - PDF:", libro.pdf_url);
    console.log("   - Thumbnail:", libro.pdf_thumbnail);

    // ELIMINAR ARCHIVOS DEL SERVIDOR
    console.log("5. Eliminando archivos del servidor...");
    const archivosEliminados = [];

    if (libro.portada) {
      if (eliminarArchivo(libro.portada)) {
        archivosEliminados.push({ tipo: "portada", url: libro.portada });
      }
    }

    if (libro.pdf_url) {
      if (eliminarArchivo(libro.pdf_url)) {
        archivosEliminados.push({ tipo: "pdf", url: libro.pdf_url });
      }
    }

    if (libro.pdf_thumbnail) {
      if (eliminarArchivo(libro.pdf_thumbnail)) {
        archivosEliminados.push({
          tipo: "thumbnail",
          url: libro.pdf_thumbnail,
        });
      }
    }

    console.log(`   Total archivos eliminados: ${archivosEliminados.length}`);

    // Eliminar el libro de cada investigador
    console.log("6. Eliminando libro de los investigadores...");
    const resultadosInvestigadores = [];

    for (const autor of autores) {
      try {
        const investigador = await couch.get(`/investigadores/${autor.id}`);

        if (investigador.status === 200) {
          const inv = investigador.data;

          if (inv.libros && inv.libros.length > 0) {
            // Filtrar el libro a eliminar
            const librosOriginales = inv.libros.length;
            inv.libros = inv.libros.filter((libro) => libro.id !== id);
            const librosNuevos = inv.libros.length;

            if (librosOriginales !== librosNuevos) {
              await couch.put(`/investigadores/${autor.id}`, inv);
              console.log(`   ✓ Eliminado de ${autor.nombre}`);
              resultadosInvestigadores.push({
                autor: autor.nombre,
                eliminado: true,
              });
            } else {
              console.log(`   ⚠ No se encontró en ${autor.nombre}`);
              resultadosInvestigadores.push({
                autor: autor.nombre,
                eliminado: false,
                motivo: "No encontrado",
              });
            }
          }
        }
      } catch (error) {
        console.error(`   ✗ Error con ${autor.nombre}:`, error.message);
        resultadosInvestigadores.push({
          autor: autor.nombre,
          eliminado: false,
          error: error.message,
        });
      }
    }

    // Eliminar el libro de la base de datos
    console.log("7. Eliminando libro de investigadores...");
    const responseEliminar = await couch.delete(
      `/investigadores/${id}?rev=${rev}`
    );

    if (responseEliminar.status !== 200 && responseEliminar.status !== 201) {
      return new Response(
        JSON.stringify({
          error: "Error al eliminar el libro",
          detalles: responseEliminar.data,
        }),
        {
          status: responseEliminar.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log("8. Libro eliminado exitosamente");
    console.log("=== FIN API ELIMINAR LIBRO ===");

    return new Response(
      JSON.stringify({
        ok: true,
        mensaje: "Libro eliminado exitosamente",
        libro: {
          id: responseEliminar.data.id,
          rev: responseEliminar.data.rev,
        },
        archivos_eliminados: archivosEliminados.length,
        detalles_archivos: archivosEliminados,
        investigadores_actualizados: resultadosInvestigadores.filter(
          (r) => r.eliminado
        ).length,
        detalles_investigadores: resultadosInvestigadores,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ Error al eliminar libro:", error);
    console.error("Stack:", error.stack);
    return new Response(
      JSON.stringify({
        ok: false,
        error: "Error al eliminar libro",
        mensaje: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
