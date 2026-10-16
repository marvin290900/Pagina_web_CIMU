import { idSchema, updateAccountSchema } from '../../../lib/security/validation.js';
import { updateAccount } from '../../../lib/security/accounts.js';
import { json, errorResponse, recentSession } from '../../../lib/security/http.js';
export async function PATCH({ request, params, locals }) {
  try {
    recentSession(locals.session);
    return json({ user: await updateAccount(idSchema.parse(params.id), updateAccountSchema.parse(await request.json()), locals.user) });
  } catch (error) { return errorResponse(error); }
}
