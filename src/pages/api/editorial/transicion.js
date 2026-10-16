import { z } from 'zod';
import { catalogModule, transitionCatalog } from '../../../lib/security/catalog.js';
import { idSchema } from '../../../lib/security/validation.js';
import { json,errorResponse } from '../../../lib/security/http.js';
export async function POST({ request,locals }) {
  try {
    const input = z.object({ module:catalogModule,id:idSchema,rev:z.string().min(1),target:z.enum(['borrador','en_revision','aprobado','publicado','archivado']),note:z.string().max(2000).default('') }).strict().parse(await request.json());
    return json({ publication:await transitionCatalog(input.module,input.id,input.rev,input.target,input.note,locals.user) });
  } catch (error) { return errorResponse(error); }
}
