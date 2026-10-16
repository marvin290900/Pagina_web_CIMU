import { saveCatalog,listCatalog } from '../../../lib/security/catalog.js';
import { idSchema } from '../../../lib/security/validation.js';
import { json,errorResponse } from '../../../lib/security/http.js';
export async function POST({request,locals}) {
  try { const doc = await saveCatalog('investigaciones',await request.json(),locals.user);return json({ok:true,data:{id:doc._id,rev:doc._rev}},201); }
  catch (error) { return errorResponse(error); }
}
export async function PUT({request,locals}) {
  try { const raw = await request.json();const doc = await saveCatalog('investigaciones',raw,locals.user,idSchema.parse(raw.id));return json({ok:true,data:{id:doc._id,rev:doc._rev}}); }
  catch (error) { return errorResponse(error); }
}
export async function GET({request,locals}) {
  try { const docs = await listCatalog('investigaciones',locals.user,new URL(request.url).searchParams.get('admin') === '1');return json({ok:true,data:{rows:docs.map(doc => ({doc}))}}); }
  catch (error) { return errorResponse(error); }
}
export function DELETE() { return json({error:'Usa archivar para conservar el historial. La eliminación definitiva está deshabilitada.'},409); }
