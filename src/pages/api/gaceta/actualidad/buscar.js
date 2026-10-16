// Public detail queries share the same publication filter as public lists.
import { GET as getPublication } from '../obtener.js';
export async function GET(context) {
  const url = new URL(context.request.url);
  url.searchParams.set('categoria', url.searchParams.get('coleccion') || '');
  url.searchParams.delete('admin');
  return getPublication({ ...context, request: new Request(url) });
}
