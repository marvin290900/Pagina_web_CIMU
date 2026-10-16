import { z } from 'zod';
import { catalogModule,catalogDB,getCatalog } from '../../../lib/security/catalog.js';
import { couch } from '../../../lib/couchDB.js';
import { readPolicy } from '../../../lib/security/store.js';
import { can,canEditContent } from '../../../lib/security/roles.js';
import { idSchema } from '../../../lib/security/validation.js';
import { json,errorResponse,HttpError } from '../../../lib/security/http.js';
import { audit } from '../../../lib/security/audit.js';
export async function PATCH({ request,locals }) {
  try {
    const input = z.object({ module:catalogModule,id:idSchema,rev:z.string(),assignedTo:z.array(idSchema).max(10) }).strict().parse(await request.json());
    if (!can(locals.user,`${input.module}.assign`)) throw new HttpError(403,'Acceso denegado');
    const policy = await readPolicy();
    for (const id of input.assignedTo) if (!canEditContent(policy.accounts[id],input.module,{assignedTo:[id]})) throw new HttpError(400,'Responsable sin acceso de edición');
    const doc = await getCatalog(input.module,input.id);
    if (doc._rev !== input.rev) throw new HttpError(409,'El contenido cambió');
    await couch.put(`/${catalogDB(input.module)}/${input.id}`,{ ...doc,assignedTo:[...new Set(input.assignedTo)] });
    await audit(locals.user.id,`${input.module}.assign`,input.id,{ assignedTo:input.assignedTo });
    return json({ success:true });
  } catch (error) { return errorResponse(error); }
}
