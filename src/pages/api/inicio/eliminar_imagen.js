import fs from 'node:fs/promises';
import { safePublicPath } from '../../../lib/security/files.js';
import { json, errorResponse } from '../../../lib/security/http.js';
export async function POST({ request }) {
  try {
    const input = await request.json();
    const filename = safePublicPath(input.path, ['carrousel']);
    try { await fs.unlink(filename); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    return json({ ok: true });
  } catch (error) { return errorResponse(error); }
}
