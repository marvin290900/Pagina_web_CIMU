import { saveNews } from '../../../lib/security/newsStore.js';
import { idSchema } from '../../../lib/security/validation.js';
import { json, errorResponse } from '../../../lib/security/http.js';
export async function PUT({ request, locals }) {
  try { const url = new URL(request.url); const doc = await saveNews(url.searchParams.get('coleccion'), await request.json(), locals.user, idSchema.parse(url.searchParams.get('id'))); return json({ ok: true, id: doc._id, rev: doc._rev }); }
  catch (error) { return errorResponse(error); }
}
