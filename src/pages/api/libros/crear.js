// src/pages/api/libros/crear.js
import { couch } from "../../../lib/couchDB";

export async function POST({ request }) {
  try {
    const libroData = await request.json();
    console.log("1. Datos del libro recibidos:", libroData);

    // Validar campos requeridos
    if (
      !libroData.titulo ||
      !libroData.autores ||
      libroData.autores.length === 0
    ) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Título y autores son requeridos",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Limpiar _id si viene vacío
    if (libroData._id === "" || libroData._id === null) {
      delete libroData._id;
    }

    // Agregar campos adicionales
    libroData.fecha_creacion = new Date().toISOString();
    libroData.fecha_actualizacion = new Date().toISOString();

    console.log("2. Creando libro en cimu-libros...");

    // Crear el libro en la colección cimu-libros
    const responseLibro = await couch.post("/cimu-libros", libroData);

    if (responseLibro.status !== 201 && responseLibro.status !== 200) {
      console.error("Error al crear libro:", responseLibro.data);
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Error al crear el libro",
          detalles: responseLibro.data,
        }),
        {
          status: responseLibro.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const libroId = responseLibro.data.id;
    console.log("3. Libro creado con ID:", libroId);

    // Preparar objeto del libro para agregar a los investigadores
    const libroReferencia = {
      id: libroId,
      titulo: libroData.titulo,
      portada: libroData.portada || "",
    };

    // Actualizar cada investigador/autor
    console.log("4. Actualizando investigadores...");
    const resultadosActualizacion = [];

    for (const autor of libroData.autores) {
      try {
        console.log(`   - Procesando autor: ${autor.nombre} (${autor.id})`);

        // Obtener el investigador actual
        const responseInvestigador = await couch.get(
          `/investigadores/${autor.id}`
        );

        if (responseInvestigador.status !== 200) {
          console.error(`     ✗ Investigador ${autor.id} no encontrado`);
          resultadosActualizacion.push({
            id: autor.id,
            nombre: autor.nombre,
            actualizado: false,
            error: "No encontrado",
          });
          continue;
        }

        const investigador = responseInvestigador.data;

        // Inicializar array de libros si no existe
        if (!investigador.libros) {
          investigador.libros = [];
        }

        // Verificar si el libro ya está agregado (prevenir duplicados)
        const yaExiste = investigador.libros.some(
          (libro) => libro.id === libroId
        );

        if (!yaExiste) {
          // Agregar el libro al array
          investigador.libros.push(libroReferencia);

          // Actualizar el investigador
          const responseActualizar = await couch.put(
            `/investigadores/${autor.id}`,
            investigador
          );

          if (
            responseActualizar.status === 200 ||
            responseActualizar.status === 201
          ) {
            console.log(`     ✓ Investigador ${autor.nombre} actualizado`);
            resultadosActualizacion.push({
              id: autor.id,
              nombre: autor.nombre,
              actualizado: true,
            });
          } else {
            console.error(`     ✗ Error al actualizar ${autor.nombre}`);
            resultadosActualizacion.push({
              id: autor.id,
              nombre: autor.nombre,
              actualizado: false,
              error: "Error en actualización",
            });
          }
        } else {
          console.log(`     ⚠ Libro ya existe en ${autor.nombre}`);
          resultadosActualizacion.push({
            id: autor.id,
            nombre: autor.nombre,
            actualizado: false,
            error: "Ya existe",
          });
        }
      } catch (error) {
        console.error(
          `     ✗ Error con investigador ${autor.nombre}:`,
          error.message
        );
        resultadosActualizacion.push({
          id: autor.id,
          nombre: autor.nombre,
          actualizado: false,
          error: error.message,
        });
      }
    }

    console.log("5. Proceso completado");
    console.log("=== FIN API CREAR LIBRO ===");

    return new Response(
      JSON.stringify({
        ok: true,
        mensaje: "Libro creado exitosamente",
        libro: {
          id: libroId,
          rev: responseLibro.data.rev,
        },
        investigadores_actualizados: resultadosActualizacion.filter(
          (r) => r.actualizado
        ).length,
        total_investigadores: libroData.autores.length,
        detalles: resultadosActualizacion,
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ Error al crear libro:", error);
    console.error("Stack:", error.stack);
    return new Response(
      JSON.stringify({
        ok: false,
        error: "Error al crear libro",
        mensaje: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
