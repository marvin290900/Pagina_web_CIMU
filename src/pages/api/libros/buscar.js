import { getCatalog,publicCatalog } from '../../../lib/security/catalog.js';
import { isPublished } from '../../../lib/security/editorial.js';
import { json,errorResponse,HttpError } from '../../../lib/security/http.js';
export async function GET({ request }) {
  try { const doc = await getCatalog('libros',new URL(request.url).searchParams.get('id'));if (!isPublished(doc)) throw new HttpError(404,'Libro no encontrado');return json(publicCatalog(doc,'libros')); }
  catch (error) { return errorResponse(error); }
}
