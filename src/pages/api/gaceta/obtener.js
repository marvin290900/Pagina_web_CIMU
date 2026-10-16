import { listNews, getNews, authorPublications } from '../../../lib/security/newsStore.js';
import { collectionSchema, isPublished, publicNews, publicAuthor, assertNewsRead } from '../../../lib/security/editorial.js';
import { can } from '../../../lib/security/roles.js';
import { json, errorResponse, HttpError } from '../../../lib/security/http.js';
export async function GET({ request, locals }) {
  try {
    const url = new URL(request.url);
    const section = collectionSchema.parse(url.searchParams.get('categoria'));
    const id = url.searchParams.get('id');
    const internal = url.searchParams.get('admin') === '1';
    if (id) {
      const doc = await getNews(section, id);
      if (internal) {
        if (section === 'autores') { if (!can(locals.user, 'autores.manage')) throw new HttpError(403, 'Acceso denegado'); }
        else assertNewsRead(locals.user, doc, section);
        return json(doc);
      }
      if (section === 'autores' ? doc.estado !== 'activo' : !isPublished(doc)) throw new HttpError(404, 'Publicación no encontrada');
      return json(section === 'autores' ? { ...publicAuthor(doc), publicaciones: await authorPublications(doc._id) } : publicNews(doc));
    }
    let docs = await listNews(section, locals.user, internal);
    const year = url.searchParams.get('anio');
    if (/^\d{4}$/.test(year || '')) docs = docs.filter(d => d.fecha_publicacion?.startsWith(year));
    docs.sort((a,b) => (b.fecha_publicacion || '').localeCompare(a.fecha_publicacion || ''));
    return json({ total_rows: docs.length, rows: docs.map(doc => ({ doc })) });
  } catch (error) { return errorResponse(error); }
}
