import { saveCatalog } from '../../../lib/security/catalog.js';
import { json,errorResponse } from '../../../lib/security/http.js';
export async function POST({ request,locals }) {
  try { const doc = await saveCatalog('libros',await request.json(),locals.user); return json({ok:true,id:doc._id,rev:doc._rev},201); }
  catch (error) { return errorResponse(error); }
}
