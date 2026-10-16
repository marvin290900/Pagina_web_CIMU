import { z } from 'zod';
import { couch } from '../../../lib/couchDB.js';
import { getNews } from '../../../lib/security/newsStore.js';
import { sectionSchema, isPublished, publicNews } from '../../../lib/security/editorial.js';
import { json, errorResponse } from '../../../lib/security/http.js';
export async function GET({ request }) {
  try {
    const id = z.enum(['publicacion_del_dia', 'publicacion_destacadas']).parse(new URL(request.url).searchParams.get('id'));
    const { data } = await couch.get(`/cimu-gaceta/${id}`);
    const publications = [];
    for (const ref of data.publicaciones || []) {
      if (!sectionSchema.safeParse(ref.coleccion).success) continue;
      try { const doc = await getNews(ref.coleccion, ref.id); if (isPublished(doc)) publications.push(publicNews(doc)); }
      catch (error) { if (error.response?.status !== 404) throw error; }
    }
    return json(publications);
  } catch (error) { return errorResponse(error); }
}
