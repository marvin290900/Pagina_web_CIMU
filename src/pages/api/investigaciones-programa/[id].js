import { listCatalog } from '../../../lib/security/catalog.js';
import { json,errorResponse } from '../../../lib/security/http.js';
export async function GET({params}) {
  try { return json({ok:true,data:(await listCatalog('investigaciones')).filter(d => d.programa === params.id)}); }
  catch (error) { return errorResponse(error); }
}
