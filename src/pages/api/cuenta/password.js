import { z } from 'zod';
import { passwordSchema } from '../../../lib/security/validation.js';
import { changePassword } from '../../../lib/security/accounts.js';
import { limitAttempts } from '../../../lib/security/rateLimit.js';
import { createBlankSessionCookie } from '../../../lib/session.js';
import { json, errorResponse } from '../../../lib/security/http.js';
export async function POST({ request, locals, cookies }) {
  try {
    await limitAttempts(`password:${locals.user.id}`, 10);
    const input = z.object({ currentPassword: z.string().min(1).max(256), password: passwordSchema }).strict().parse(await request.json());
    await changePassword(locals.user, input.currentPassword, input.password);
    const cookie = createBlankSessionCookie(); cookies.set(cookie.name, cookie.value, cookie.attributes);
    return json({ success: true });
  } catch (error) { return errorResponse(error); }
}
