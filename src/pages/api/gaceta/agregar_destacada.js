import { z } from 'zod';
import { couch } from '../../../lib/couchDB.js';
import { can } from '../../../lib/security/roles.js';
import { sectionSchema, isPublished } from '../../../lib/security/editorial.js';
import { getNews } from '../../../lib/security/newsStore.js';
import { audit } from '../../../lib/security/audit.js';
import { json, errorResponse, HttpError } from '../../../lib/security/http.js';
export async function PUT({ request, locals }) {
  try {
    const url = new URL(request.url);
    const id = z.enum(['publicacion_del_dia','publicacion_destacadas']).parse(url.searchParams.get('id'));
    const action = z.enum(['agregar','eliminar']).parse(url.searchParams.get('accion'));
    const input = z.object({ id: z.string().min(1), coleccion: sectionSchema.optional() }).parse(await request.json());
    const { data: current } = await couch.get(`/cimu-gaceta/${id}`);
    const section = input.coleccion || current.publicaciones?.find(p => p.id === input.id)?.coleccion;
    if (!section || !can(locals.user, 'gaceta.feature', { section })) throw new HttpError(403, 'Sección no autorizada');
    const list = current.publicaciones || [];
    if (action === 'agregar') {
      const doc = await getNews(section, input.id);
      if (!isPublished(doc)) throw new HttpError(409, 'Solo se pueden destacar publicaciones publicadas');
      if (!list.some(p => p.id === input.id && p.coleccion === section)) list.push({ id: input.id, coleccion: section });
    }
    const updated = action === 'agregar' ? list : list.filter(p => !(p.id === input.id && p.coleccion === section));
    await couch.put(`/cimu-gaceta/${id}`, { ...current, publicaciones: updated });
    await audit(locals.user.id, 'gaceta.feature', input.id, { section, action });
    return json({ ok: true });
  } catch (error) { return errorResponse(error); }
}
