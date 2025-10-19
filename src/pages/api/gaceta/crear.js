// // src/pages/api/gaceta/crear.js
// import { couch } from "../../../lib/couchDB";

// export async function POST({ request }) {
//   try {
//     const url = new URL(request.url);
//     const coleccion = url.searchParams.get("coleccion");

//     if (!coleccion) {
//       return new Response(
//         JSON.stringify({ error: "Colección no proporcionada" }),
//         {
//           status: 400,
//           headers: { "Content-Type": "application/json" },
//         }
//       );
//     }

//     // Obtener datos del body
//     const datos = await request.json();

//     if (!datos || Object.keys(datos).length === 0) {
//       return new Response(
//         JSON.stringify({ error: "No se proporcionaron datos" }),
//         {
//           status: 400,
//           headers: { "Content-Type": "application/json" },
//         }
//       );
//     }

//     // Crear documento en CouchDB
//     const response = await couch.post(`/cimu-gaceta-${coleccion}`, datos);

//     if (response.status !== 201 && response.status !== 200) {
//       return new Response(
//         JSON.stringify({
//           error: "Error al crear el documento",
//           detalles: response.data,
//         }),
//         {
//           status: response.status,
//           headers: { "Content-Type": "application/json" },
//         }
//       );
//     }

//     return new Response(
//       JSON.stringify({
//         mensaje: "Documento creado exitosamente",
//         id: response.data.id,
//         rev: response.data.rev,
//       }),
//       {
//         status: 201,
//         headers: { "Content-Type": "application/json" },
//       }
//     );
//   } catch (error) {
//     console.error("Error al crear documento:", error.message);
//     return new Response(
//       JSON.stringify({
//         error: "Error al crear documento",
//         mensaje: error.message,
//       }),
//       {
//         status: 500,
//         headers: { "Content-Type": "application/json" },
//       }
//     );
//   }
// }

// src/pages/api/gaceta/crear.js
import { couch } from "../../../lib/couchDB";

export async function POST({ request }) {
  try {
    const url = new URL(request.url);
    const coleccion = url.searchParams.get("coleccion");

    console.log("=== API CREAR DOCUMENTO ===");
    console.log("1. Colección:", coleccion);

    if (!coleccion) {
      return new Response(
        JSON.stringify({ error: "Colección no proporcionada" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Obtener datos del body
    const datos = await request.json();
    console.log("2. Datos recibidos:", datos);

    if (!datos || Object.keys(datos).length === 0) {
      return new Response(
        JSON.stringify({ error: "No se proporcionaron datos" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Eliminar _id si viene vacío
    if (datos._id === "" || datos._id === null) {
      delete datos._id;
    }

    console.log("3. Creando documento en:", `/cimu-gaceta-${coleccion}`);

    // Crear documento en CouchDB
    const response = await couch.post(`/cimu-gaceta-${coleccion}`, datos);

    console.log("4. Respuesta de CouchDB:", response.status);
    console.log("5. Data:", response.data);

    if (response.status !== 201 && response.status !== 200) {
      console.error("Error en respuesta:", response.data);
      return new Response(
        JSON.stringify({
          error: "Error al crear el documento",
          detalles: response.data,
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log("6. Documento creado exitosamente");
    console.log("=== FIN API CREAR ===");

    return new Response(
      JSON.stringify({
        ok: true,
        mensaje: "Documento creado exitosamente",
        id: response.data.id,
        rev: response.data.rev,
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ Error al crear documento:", error);
    console.error("❌ Stack:", error.stack);
    return new Response(
      JSON.stringify({
        error: "Error al crear documento",
        mensaje: error.message,
        detalles: error.stack,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
