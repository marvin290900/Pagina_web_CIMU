import { saveUpload } from '../../lib/security/uploads.js';
import { json, errorResponse } from '../../lib/security/http.js';
export async function POST({ request, locals }) {
  try { return json(await saveUpload(await request.formData(), locals.user, 'pdf')); }
  catch (error) { return errorResponse(error); }
}
