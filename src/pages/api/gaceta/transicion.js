import { z } from 'zod';
import { sectionSchema } from '../../../lib/security/editorial.js';
import { idSchema } from '../../../lib/security/validation.js';
import { transitionNews } from '../../../lib/security/newsStore.js';
import { json, errorResponse } from '../../../lib/security/http.js';
export async function POST({ request, locals }) {
  try {
    const input = z.object({ section: sectionSchema, id: idSchema, rev: z.string().min(1), target: z.enum(['borrador','en_revision','aprobado','publicado','archivado']), note: z.string().max(2000).default('') }).strict().parse(await request.json());
    return json({ publication: await transitionNews(input.section, input.id, input.rev, input.target, input.note, locals.user) });
  } catch (error) { return errorResponse(error); }
}
