import { listNews } from '../../../../lib/security/newsStore.js';
import { json, errorResponse } from '../../../../lib/security/http.js';
export async function GET() { try { const docs = await listNews('actualidad'); return json({ rows: docs.map(doc => ({ doc })) }); } catch (error) { return errorResponse(error); } }
