import { readPolicy } from '../../../lib/security/store.js';
import { can, canEditContent } from '../../../lib/security/roles.js';
import { sectionSchema } from '../../../lib/security/editorial.js';
import { json, errorResponse, HttpError } from '../../../lib/security/http.js';
export async function GET({ request, locals }) {
  try {
    const section = sectionSchema.parse(new URL(request.url).searchParams.get('section'));
    if (!can(locals.user, 'gaceta.assign', { section })) throw new HttpError(403, 'Acceso denegado');
    const policy = await readPolicy();
    return json({ users: Object.values(policy.accounts).filter(account => canEditContent(account, 'gaceta', { assignedTo: [account.id] }, section)).map(({ id, name }) => ({ id, name })) });
  } catch (error) { return errorResponse(error); }
}
