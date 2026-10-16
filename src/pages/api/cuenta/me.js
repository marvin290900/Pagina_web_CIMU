import { json } from '../../../lib/security/http.js';
export function GET({ locals }) { return json({ user: locals.user }); }
