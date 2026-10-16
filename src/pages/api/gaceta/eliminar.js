import { z } from 'zod';
import { deleteNews } from '../../../lib/security/newsStore.js';
import { idSchema } from '../../../lib/security/validation.js';
import { sectionSchema } from '../../../lib/security/editorial.js';
import { json, errorResponse } from '../../../lib/security/http.js';
export async function DELETE({ request, locals }) {
  try {
    const url = new URL(request.url);
    const section = sectionSchema.parse(url.searchParams.get('coleccion'));
    const id = idSchema.parse(url.searchParams.get('id'));
    const { rev } = z.object({ rev: z.string().min(1) }).strict().parse(await request.json());
    await deleteNews(section, id, rev, locals.user);
    return json({ ok: true });
  } catch (error) { return errorResponse(error); }
}
