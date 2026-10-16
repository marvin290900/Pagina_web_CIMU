import { listCatalog } from '../../../lib/security/catalog.js';
import { json,errorResponse } from '../../../lib/security/http.js';
export async function GET({ request,locals }) {
  try {
    const url = new URL(request.url), year = url.searchParams.get('anio');
    let docs = await listCatalog('libros',locals.user,url.searchParams.get('admin') === '1');
    if (/^\d{4}$/.test(year || '')) docs = docs.filter(d => d.fecha_publicacion?.startsWith(year));
    docs.sort((a,b) => (b.fecha_publicacion || '').localeCompare(a.fecha_publicacion || ''));
    return json(docs);
  } catch (error) { return errorResponse(error); }
}
