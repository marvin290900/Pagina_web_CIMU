import { listNews } from '../../../lib/security/newsStore.js';
import { sectionSchema } from '../../../lib/security/editorial.js';
import { json, errorResponse } from '../../../lib/security/http.js';
export async function GET({ request }) {
  try { const docs = await listNews(sectionSchema.parse(new URL(request.url).searchParams.get('categoria'))); docs.sort((a,b) => b.fecha_publicacion.localeCompare(a.fecha_publicacion)); return json({ rows: docs.slice(0, 6).map(doc => ({ doc })) }); }
  catch (error) { return errorResponse(error); }
}
