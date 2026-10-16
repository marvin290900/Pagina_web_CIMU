import path from 'node:path';
import fs from 'node:fs';
import { HttpError } from './http.js';
export function safePublicPath(value, folders) {
  if (typeof value !== 'string') throw new HttpError(400, 'Ruta de archivo inválida');
  // Only local upload URLs. URL parsing normalizes dot segments before the folder check.
  const url = new URL(value, 'http://local.invalid');
  if (url.origin !== 'http://local.invalid') throw new HttpError(400, 'Solo se permiten archivos locales');
  const pathname = decodeURIComponent(url.pathname);
  const base = path.resolve('public/uploads');
  const full = path.resolve('public', '.' + pathname);
  if (!folders.some(folder => full.startsWith(path.join(base, folder) + path.sep))) throw new HttpError(403, 'Archivo fuera del módulo permitido');
  if (fs.existsSync(full)) {
    const real = fs.realpathSync(full);
    if (!real.startsWith(base + path.sep) || !folders.some(folder => real.startsWith(path.join(base, folder) + path.sep))) throw new HttpError(403, 'Ruta de archivo no permitida');
  }
  return full;
}
