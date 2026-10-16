import { z } from 'zod';
import { authenticateUser } from '../../lib/auth.js';
import { createSession, createSessionCookie } from '../../lib/session.js';
import { emailSchema } from '../../lib/security/validation.js';
import { limitAttempts } from '../../lib/security/rateLimit.js';
import { audit } from '../../lib/security/audit.js';
import { digest } from '../../lib/security/accounts.js';
import { json, errorResponse } from '../../lib/security/http.js';
export const POST = async ({ request, cookies, clientAddress }) => {
  try {
    const { email, password } = z.object({ email: emailSchema, password: z.string().min(1).max(256) }).strict().parse(await request.json());
    await limitAttempts(`ip:${clientAddress}`, 50);
    await limitAttempts(`email:${email}`, 10);
    const user = await authenticateUser(email, password);
    if (!user) {
      await audit(null,'auth.login_failed',null,{ emailHash:digest(email) });
      return json({ error: 'Credenciales inválidas o cuenta no disponible' }, 401);
    }
    await audit(user.id,'auth.login',user.id);
    const { token, expiresAt } = await createSession(user);
    const cookie = createSessionCookie(token, expiresAt);
    cookies.set(cookie.name, cookie.value, cookie.attributes);
    const { credentialVersion, ...safeUser } = user;
    return json({ success: true, user: safeUser });
  } catch (error) { return errorResponse(error); }
};
