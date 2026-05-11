// src/pages/api/libros/actualizar.js
import { couch } from "../../../lib/couchDB";
import fs from "fs";
import path from "path";

const BASE_PATH = path.join(process.cwd(), "public");

// Función helper para eliminar archivo
const eliminarArchivo = (url) => {
  if (!url) return false;

  try {
    const urlObj = new URL(url, "http://localhost");
    const relativePath = urlObj.pathname;
    const fullPath = path.join(BASE_PATH, relativePath);

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log("      ✓ Archivo eliminado:", relativePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error("      ✗ Error al eliminar archivo:", error.message);
    return false;
  }
};

export async function PUT({ request }) {
  console.log("=== API ACTUALIZAR LIBRO ===");

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return new Response(JSON.stringify({ error: "ID no proporcionado" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (id === "colecciones") {
      //consultar el documento de colecciones
      const coleccionesDoc = await couch.get(`/cimu-libros/${id}`);

      if (coleccionesDoc.status !== 200) {
        return new Response(
          JSON.stringify({ error: "Documento no encontrado" }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      const coleccionesData = await request.json();

      //actualizar el documento de colecciones
      const coleccionesActualizado = {
        ...coleccionesDoc.data,
        ...coleccionesData,
        _id: coleccionesDoc.data._id,
        _rev: coleccionesDoc.data._rev,
      };

      console.log("2. Actualizando documento de colecciones...");
      const responseColecciones = await couch.put(
        `/cimu-libros/${id}`,
        coleccionesActualizado
      );

      if (
        responseColecciones.status !== 200 &&
        responseColecciones.status !== 201
      ) {
        return new Response(
          JSON.stringify({
            error: "Error al actualizar el documento de colecciones",
          }),
          {
            status: responseColecciones.status,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      console.log("3. Documento de colecciones actualizado");

      return new Response(
        JSON.stringify({
          ok: true,
          mensaje: "Documento de colecciones actualizado exitosamente",
          documento: {
            id: responseColecciones.data.id,
            rev: responseColecciones.data.rev,
          },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const libroData = await request.json();
    console.log("1. ID:", id);

    // Obtener el libro actual
    const libroActual = await couch.get(`/cimu-libros/${id}`);

    if (libroActual.status !== 200) {
      return new Response(JSON.stringify({ error: "Libro no encontrado" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const datosAnteriores = libroActual.data;

    // DETECTAR CAMBIOS DE ARCHIVOS Y ELIMINAR LOS VIEJOS
    console.log("2. Verificando cambios de archivos...");
    const archivosEliminados = [];

    // Si cambió la portada, eliminar la anterior
    if (
      datosAnteriores.portada &&
      libroData.portada &&
      datosAnteriores.portada !== libroData.portada
    ) {
      console.log("   - Portada cambió, eliminando anterior...");
      if (eliminarArchivo(datosAnteriores.portada)) {
        archivosEliminados.push({
          tipo: "portada",
          url: datosAnteriores.portada,
        });
      }
    }

    // Si cambió el PDF, eliminar el anterior y su thumbnail
    if (
      datosAnteriores.pdf_url &&
      libroData.pdf_url &&
      datosAnteriores.pdf_url !== libroData.pdf_url
    ) {
      console.log("   - PDF cambió, eliminando anterior...");
      if (eliminarArchivo(datosAnteriores.pdf_url)) {
        archivosEliminados.push({ tipo: "pdf", url: datosAnteriores.pdf_url });
      }
      if (datosAnteriores.pdf_thumbnail) {
        if (eliminarArchivo(datosAnteriores.pdf_thumbnail)) {
          archivosEliminados.push({
            tipo: "thumbnail",
            url: datosAnteriores.pdf_thumbnail,
          });
        }
      }
    }

    console.log(
      `   Total archivos antiguos eliminados: ${archivosEliminados.length}`
    );

    // Obtener autores anteriores y nuevos
    const autoresAnteriores = datosAnteriores.autores || [];
    const autoresNuevos = libroData.autores || [];

    console.log(
      "3. Autores anteriores:",
      autoresAnteriores.map((a) => a.nombre)
    );
    console.log(
      "4. Autores nuevos:",
      autoresNuevos.map((a) => a.nombre)
    );

    // Actualizar libro
    libroData.fecha_actualizacion = new Date().toISOString();
    const libroActualizado = {
      ...datosAnteriores,
      ...libroData,
      _id: datosAnteriores._id,
      _rev: datosAnteriores._rev,
    };

    console.log("5. Actualizando libro...");
    const responseLibro = await couch.put(
      `/cimu-libros/${id}`,
      libroActualizado
    );

    if (responseLibro.status !== 200 && responseLibro.status !== 201) {
      return new Response(
        JSON.stringify({ error: "Error al actualizar el libro" }),
        {
          status: responseLibro.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log("6. Libro actualizado");

    // Preparar referencia actualizada del libro
    const libroReferencia = {
      id: id,
      titulo: libroData.titulo,
      portada: libroData.portada || "",
    };

    // Determinar cambios en autores
    const autoresAgregar = autoresNuevos.filter(
      (nuevo) => !autoresAnteriores.some((anterior) => anterior.id === nuevo.id)
    );

    const autoresEliminar = autoresAnteriores.filter(
      (anterior) => !autoresNuevos.some((nuevo) => nuevo.id === anterior.id)
    );

    const autoresActualizar = autoresNuevos.filter((nuevo) =>
      autoresAnteriores.some((anterior) => anterior.id === nuevo.id)
    );

    console.log(
      "7. Autores a agregar:",
      autoresAgregar.map((a) => a.nombre)
    );
    console.log(
      "8. Autores a eliminar:",
      autoresEliminar.map((a) => a.nombre)
    );
    console.log(
      "9. Autores a actualizar:",
      autoresActualizar.map((a) => a.nombre)
    );

    const resultados = [];

    // AGREGAR libro a nuevos autores
    for (const autor of autoresAgregar) {
      try {
        const investigador = await couch.get(`/investigadores/${autor.id}`);

        if (investigador.status === 200) {
          const inv = investigador.data;
          if (!inv.libros) inv.libros = [];

          inv.libros.push(libroReferencia);

          await couch.put(`/investigadores/${autor.id}`, inv);
          console.log(`   ✓ Agregado a ${autor.nombre}`);
          resultados.push({ accion: "agregar", autor: autor.nombre, ok: true });
        }
      } catch (error) {
        console.error(`   ✗ Error agregando a ${autor.nombre}:`, error.message);
        resultados.push({
          accion: "agregar",
          autor: autor.nombre,
          ok: false,
          error: error.message,
        });
      }
    }

    // ELIMINAR libro de autores removidos
    for (const autor of autoresEliminar) {
      try {
        const investigador = await couch.get(`/investigadores/${autor.id}`);

        if (investigador.status === 200) {
          const inv = investigador.data;
          if (inv.libros) {
            inv.libros = inv.libros.filter((libro) => libro.id !== id);

            await couch.put(`/investigadores/${autor.id}`, inv);
            console.log(`   ✓ Eliminado de ${autor.nombre}`);
            resultados.push({
              accion: "eliminar",
              autor: autor.nombre,
              ok: true,
            });
          }
        }
      } catch (error) {
        console.error(
          `   ✗ Error eliminando de ${autor.nombre}:`,
          error.message
        );
        resultados.push({
          accion: "eliminar",
          autor: autor.nombre,
          ok: false,
          error: error.message,
        });
      }
    }

    // ACTUALIZAR información del libro en autores existentes
    for (const autor of autoresActualizar) {
      try {
        const investigador = await couch.get(`/investigadores/${autor.id}`);

        if (investigador.status === 200) {
          const inv = investigador.data;
          if (inv.libros) {
            const index = inv.libros.findIndex((libro) => libro.id === id);
            if (index !== -1) {
              inv.libros[index] = libroReferencia;

              await couch.put(`/investigadores/${autor.id}`, inv);
              console.log(`   ✓ Actualizado en ${autor.nombre}`);
              resultados.push({
                accion: "actualizar",
                autor: autor.nombre,
                ok: true,
              });
            }
          }
        }
      } catch (error) {
        console.error(
          `   ✗ Error actualizando en ${autor.nombre}:`,
          error.message
        );
        resultados.push({
          accion: "actualizar",
          autor: autor.nombre,
          ok: false,
          error: error.message,
        });
      }
    }

    console.log("10. Proceso completado");
    console.log("=== FIN API ACTUALIZAR LIBRO ===");

    return new Response(
      JSON.stringify({
        ok: true,
        mensaje: "Libro actualizado exitosamente",
        libro: {
          id: responseLibro.data.id,
          rev: responseLibro.data.rev,
        },
        archivos_eliminados: archivosEliminados.length,
        detalles_archivos: archivosEliminados,
        operaciones_autores: resultados,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ Error al actualizar libro:", error);
    console.error("Stack:", error.stack);
    return new Response(
      JSON.stringify({
        ok: false,
        error: "Error al actualizar libro",
        mensaje: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
