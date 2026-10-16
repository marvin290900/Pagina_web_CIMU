import { z } from 'zod';
import { idSchema } from '../../../../lib/security/validation.js';
import { revokeSessions, resetAccess } from '../../../../lib/security/accounts.js';
import { json, errorResponse, recentSession } from '../../../../lib/security/http.js';
export async function POST({ request, params, locals }) {
  try {
    recentSession(locals.session);
    const id = idSchema.parse(params.id);
    const { action } = z.object({ action: z.enum(['revoke', 'reset']) }).strict().parse(await request.json());
    if (action === 'reset') return json({ setupToken: await resetAccess(id, locals.user) });
    await revokeSessions(id, locals.user); return json({ success: true });
  } catch (error) { return errorResponse(error); }
}
