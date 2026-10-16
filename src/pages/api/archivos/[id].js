import { z } from 'zod';
import { readPrivateAsset } from '../../../lib/security/uploads.js';
import { errorResponse } from '../../../lib/security/http.js';
export async function GET({ params, locals }) {
  try {
    const { buffer, mime } = await readPrivateAsset(z.string().uuid().parse(params.id), locals.user);
    return new Response(buffer, { headers: { 'Content-Type': mime, 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-store', 'Content-Security-Policy': "default-src 'none'; sandbox", 'Content-Disposition': mime === 'application/pdf' ? 'attachment' : 'inline' } });
  } catch (error) { return errorResponse(error); }
}
