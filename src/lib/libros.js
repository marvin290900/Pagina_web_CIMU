import { couch } from "./couchDB.js";

const DB_NAME = "cimu-libros";

export async function getTodosLosLibros() {
  try {
    const response = await couch.post(`/${DB_NAME}/_find`, {
      selector: {
        titulo: { $exists: true, $ne: "" } 
      }
    });

    return response.data.docs;

  } catch (error) {
    console.error("Error al obtener los libros:", error);
    return [];
  }
}