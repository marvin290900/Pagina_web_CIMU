import { couch } from '../../../lib/couchDB.js';
import { getTodosLosInvestigadores } from '../../../lib/investigadores.js';
import { json,errorResponse,HttpError } from '../../../lib/security/http.js';
export async function GET({request}) {
  try {
    const url = new URL(request.url);
    if (url.searchParams.get('coleccion') === 'investigadores') return json({rows:(await getTodosLosInvestigadores()).map(doc => ({doc}))});
    if (url.searchParams.get('id') === 'colecciones') { let data;try {data=(await couch.get('/cimu-libros/colecciones')).data;} catch(error){if(error.response?.status !== 404) throw error;data={};} return json({colecciones:data.colecciones || []}); }
    throw new HttpError(400,'Consulta inválida');
  } catch(error) { return errorResponse(error); }
}
