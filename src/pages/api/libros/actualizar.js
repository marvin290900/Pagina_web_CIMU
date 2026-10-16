import { z } from 'zod';
import { couch } from '../../../lib/couchDB.js';
import { saveCatalog } from '../../../lib/security/catalog.js';
import { can } from '../../../lib/security/roles.js';
import { idSchema } from '../../../lib/security/validation.js';
import { json,errorResponse,HttpError } from '../../../lib/security/http.js';
import { audit } from '../../../lib/security/audit.js';
export async function PUT({ request,locals }) {
  try {
    const id = idSchema.parse(new URL(request.url).searchParams.get('id'));
    const raw = await request.json();
    if (id === 'colecciones') {
      if (!can(locals.user,'libros.manage')) throw new HttpError(403,'No puedes administrar colecciones');
      const input = z.object({ colecciones:z.array(z.string().max(200)).max(500) }).parse(raw);
      const path = '/cimu-libros/colecciones';
      let current;
      try { current = (await couch.get(path)).data; } catch(error) { if(error.response?.status !== 404) throw error; current = {_id:'colecciones'}; }
      await couch.put(path,{...current,...input});await audit(locals.user.id,'libros.collections',id);
      return json({ok:true});
    }
    const doc = await saveCatalog('libros',raw,locals.user,id);return json({ok:true,id:doc._id,rev:doc._rev});
  } catch (error) { return errorResponse(error); }
}
