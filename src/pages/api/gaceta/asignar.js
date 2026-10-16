import { z } from 'zod';
import { couch } from '../../../lib/couchDB.js';
import { readPolicy } from '../../../lib/security/store.js';
import { can, canEditContent } from '../../../lib/security/roles.js';
import { sectionSchema } from '../../../lib/security/editorial.js';
import { idSchema } from '../../../lib/security/validation.js';
import { getNews, newsPath } from '../../../lib/security/newsStore.js';
import { audit } from '../../../lib/security/audit.js';
import { json, errorResponse, HttpError } from '../../../lib/security/http.js';
export async function PATCH({ request, locals }) {
  try {
    const input = z.object({ section: sectionSchema, id: idSchema, rev: z.string().min(1), assignedTo: z.array(idSchema).max(10) }).strict().parse(await request.json());
    if (!can(locals.user, 'gaceta.assign', { section: input.section })) throw new HttpError(403, 'Acceso denegado');
    const policy = await readPolicy();
    for (const id of input.assignedTo) if (!canEditContent(policy.accounts[id], 'gaceta', { assignedTo: [id] }, input.section)) throw new HttpError(400, 'Responsable sin acceso de edición a esta sección');
    const doc = await getNews(input.section, input.id);
    if (doc._rev !== input.rev) throw new HttpError(409, 'La publicación cambió. Recarga la lista');
    await couch.put(newsPath(input.section, input.id), { ...doc, assignedTo: [...new Set(input.assignedTo)], updatedBy: locals.user.id });
    await audit(locals.user.id, 'gaceta.assign', input.id, { assignedTo: input.assignedTo });
    return json({ success: true });
  } catch (error) { return errorResponse(error); }
}
