import { getCatalog,publicCatalog } from '../../../lib/security/catalog.js';
import { isPublished } from '../../../lib/security/editorial.js';
import { json,errorResponse,HttpError } from '../../../lib/security/http.js';
export async function GET({params}) {
  try { const doc = await getCatalog('investigaciones',params.id);if (!isPublished(doc)) throw new HttpError(404,'Investigación no encontrada');return json({ok:true,data:publicCatalog(doc,'investigaciones')}); }
  catch (error) { return errorResponse(error); }
}
