import { readPolicy } from '../../../lib/security/store.js';
import { catalogModule } from '../../../lib/security/catalog.js';
import { can,canEditContent } from '../../../lib/security/roles.js';
import { json,errorResponse,HttpError } from '../../../lib/security/http.js';
export async function GET({ request,locals }) {
  try {
    const module = catalogModule.parse(new URL(request.url).searchParams.get('module'));
    if (!can(locals.user,`${module}.assign`)) throw new HttpError(403,'Acceso denegado');
    const policy = await readPolicy();
    return json({ users:Object.values(policy.accounts).filter(a => canEditContent(a,module,{assignedTo:[a.id]})).map(({id,name}) => ({id,name})) });
  } catch (error) { return errorResponse(error); }
}
