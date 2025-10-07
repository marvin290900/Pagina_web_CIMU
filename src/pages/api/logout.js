// src/pages/api/logout.js
import { invalidateSession, createBlankSessionCookie } from '../../lib/session.js';

export const POST = async ({ cookies, locals }) => {
  const token = cookies.get('session')?.value;
  
  if (token) {
    await invalidateSession(token);
  }
  
  const sessionCookie = createBlankSessionCookie();
  cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
  
  return new Response(JSON.stringify({ success: true }), { 
    status: 200 
  });
};