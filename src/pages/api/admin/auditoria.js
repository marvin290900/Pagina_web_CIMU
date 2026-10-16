import { couch } from '../../../lib/couchDB.js';
import { json, errorResponse } from '../../../lib/security/http.js';
export async function GET() {
  try {
    const { data } = await couch.post('/audit_events/_find', { selector: { createdAt: { $gt: '' } }, sort: [{ createdAt: 'desc' }], limit: 100 });
    return json({ events: data.docs });
  } catch (error) { return errorResponse(error); }
}
