import { listCatalog } from './security/catalog.js';
export async function getTodosLosLibros() { try { return await listCatalog('libros'); } catch { return []; } }
