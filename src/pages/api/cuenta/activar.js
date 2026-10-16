import { z } from 'zod';
import { idSchema, passwordSchema } from '../../../lib/security/validation.js';
import { activateAccount } from '../../../lib/security/accounts.js';
import { limitAttempts } from '../../../lib/security/rateLimit.js';
import { json, errorResponse } from '../../../lib/security/http.js';
export async function POST({ request, clientAddress }) {
  try {
    await limitAttempts(`setup:${clientAddress}`, 20);
    const input = z.object({ id: idSchema, token: z.string().regex(/^[A-Za-z0-9_-]{43}$/), password: passwordSchema }).strict().parse(await request.json());
    await activateAccount(input.id, input.token, input.password);
    return json({ success: true });
  } catch (error) { return errorResponse(error); }
}
