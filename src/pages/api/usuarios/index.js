import { readPolicy } from '../../../lib/security/store.js';
import { publicUser } from '../../../lib/security/roles.js';
import { accountSchema } from '../../../lib/security/validation.js';
import { createAccount } from '../../../lib/security/accounts.js';
import { json, errorResponse, recentSession } from '../../../lib/security/http.js';
export async function GET() {
  try { const policy = await readPolicy(); return json({ users: Object.values(policy.accounts).map(publicUser) }); }
  catch (error) { return errorResponse(error); }
}
export async function POST({ request, locals }) {
  try {
    recentSession(locals.session);
    const input = accountSchema.parse(await request.json());
    return json(await createAccount(input, locals.user), 201);
  } catch (error) { return errorResponse(error); }
}
