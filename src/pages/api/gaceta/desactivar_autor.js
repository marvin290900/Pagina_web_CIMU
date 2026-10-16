import { z } from 'zod';
import { couch } from '../../../lib/couchDB.js';
import { can } from '../../../lib/security/roles.js';
import { audit } from '../../../lib/security/audit.js';
import { json, errorResponse, HttpError } from '../../../lib/security/http.js';
export async function PATCH({ request, locals }) {
  try {
    if (!can(locals.user, 'autores.manage')) throw new HttpError(403, 'Acceso denegado');
    const input = z.object({ id: z.string().min(1), rev: z.string().min(1), estado: z.enum(['activo', 'inactivo']) }).strict().parse(await request.json());
    const path = `/cimu-gaceta-autores/${encodeURIComponent(input.id)}`;
    const { data: doc } = await couch.get(path);
    if (doc._rev !== input.rev) throw new HttpError(409, 'El autor cambió. Recarga la lista');
    await couch.put(path, { ...doc, estado: input.estado });
    await audit(locals.user.id, 'authors.status', input.id, { estado: input.estado });
    return json({ success: true }); // Publicaciones keep their own editorial state.
  } catch (error) { return errorResponse(error); }
}
