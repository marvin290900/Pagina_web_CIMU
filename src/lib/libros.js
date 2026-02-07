import { couch } from "./couchDB.js";

const DB_NAME = "cimu-libros";

export async function getTodosLosLibros() {
  try {
    const response = await couch.get(`/${DB_NAME}/_all_docs`, {
      params: {
        include_docs: true,
        conflicts: false
      }
    });
    return response.data.rows.map(row => row.doc);
    
  } catch (error) {
    console.error("Error al obtener todos los documentos:", error);
    return [];
  }
}
