// src/pages/api/libros/ordenados.js

import { couch } from "../../../lib/couchDB"; // Asegúrate que esta ruta sea correcta

/**
 * API para obtener libros ordenados por fecha de publicación descendente.
 * Acepta un parámetro opcional ?anio=YYYY para filtrar por año.
 */
export async function GET({ request }) {
  try {
    const url = new URL(request.url);
    const anio = url.searchParams.get("anio");

    console.log("=== API LIBROS ORDENADOS ===");

    // --- Selector Base ---
    // ¡Buena práctica! Siempre filtra por el tipo de documento que buscas.
    // Ajusta "libro" al campo/valor que uses (ej. "type": "book").
    let selector = {};

    if (anio) {
      console.log("Filtrando por año:", anio);
      const fechaInicio = `${anio}-01-01T00:00:00Z`;
      const fechaFin = `${anio}-12-31T23:59:59Z`;

      // Añadimos el filtro de fecha al selector
      selector.fecha_publicacion = {
        $gte: fechaInicio,
        $lte: fechaFin,
      };
    } else {
      console.log("Obteniendo todos los libros ordenados");
      // Si no hay año, nos aseguramos que el campo exista para poder ordenarlo
      selector.fecha_publicacion = {
        $gt: null,
      };
    }

    // --- Query Final ---
    const query = {
      selector: selector,
      sort: [{ fecha_publicacion: "desc" }],
      limit: 1000, // Es bueno limitar, 1000 es un límite alto y seguro.
      // ¡Usa un índice que sirva para AMBOS casos!
      use_index: "idx-fecha-publicacion-desc",
    };

    console.log("Ejecutando query:", JSON.stringify(query));
    const res = await couch.post("cimu-libros/_find", query);

    // --- Manejo de Respuesta (MÁS SEGURO) ---
    // No todas las librerías devuelven { data: { docs: [] } }.
    // 'nano' a menudo devuelve { docs: [] } directamente.
    const docs = res.docs || (res.data ? res.data.docs : []);

    if (!docs) {
      console.error("Respuesta inesperada de CouchDB:", res);
      throw new Error("El formato de respuesta de CouchDB no contiene 'docs'.");
    }

    console.log("Libros obtenidos:", docs.length);

    // Devuelve solo el array de documentos
    return new Response(JSON.stringify(docs), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    // Manejo de errores
    console.error("Error en la API de libros ordenados:", error.message);
    return new Response(
      JSON.stringify({ error: "Error al consultar la base de datos" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}
