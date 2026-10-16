import { listCatalog } from './security/catalog.js';
export async function getTodasLasInvestigaciones() { try { return await listCatalog('investigaciones'); } catch { return []; } }
