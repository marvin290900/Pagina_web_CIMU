import { saveNews } from '../../../lib/security/newsStore.js';
import { json, errorResponse } from '../../../lib/security/http.js';
export async function POST({ request, locals }) {
  try { const doc = await saveNews(new URL(request.url).searchParams.get('coleccion'), await request.json(), locals.user); return json({ ok: true, id: doc._id, rev: doc._rev }, 201); }
  catch (error) { return errorResponse(error); }
}
