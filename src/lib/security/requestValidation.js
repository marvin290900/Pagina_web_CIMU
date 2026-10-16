import { HttpError } from './http.js';
const DOCUMENT_ID = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,127}$/;
export function validateDocumentIds(value, depth = 0) {
  if (depth > 30) throw new HttpError(400, 'Estructura de datos demasiado profunda');
  if (!value || typeof value !== 'object') return;
  for (const [key, item] of Object.entries(value)) {
    if (['id', '_id'].includes(key) && item !== '' && item !== null && (typeof item !== 'string' || !DOCUMENT_ID.test(item))) throw new HttpError(400, 'Identificador de documento inválido');
    if (key === '_rev' && item != null && (typeof item !== 'string' || !/^\d+-[a-zA-Z0-9]+$/.test(item))) throw new HttpError(400, 'Revisión de documento inválida');
    if (['__proto__', 'constructor', 'prototype'].includes(key)) throw new HttpError(400, 'Campo no permitido');
    if (typeof item === 'object') validateDocumentIds(item, depth + 1);
  }
}
export async function validateApiInput(request) {
  const url = new URL(request.url);
  for (const key of ['id','rev']) {
    const value = url.searchParams.get(key);
    if (value && !(key === 'id' ? DOCUMENT_ID : /^\d+-[a-zA-Z0-9]+$/).test(value)) throw new HttpError(400, 'Identificador o revisión inválidos');
  }
  if (!['GET','HEAD','OPTIONS'].includes(request.method) && request.headers.get('content-type')?.includes('application/json')) {
    const text = await request.clone().text();
    if (Buffer.byteLength(text) > 1024 * 1024) throw new HttpError(400, 'Solicitud demasiado grande');
    validateDocumentIds(JSON.parse(text));
  }
}
