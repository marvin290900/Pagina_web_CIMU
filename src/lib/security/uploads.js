import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const executeFile = promisify(execFile);
import { couch } from '../couchDB.js';
import { can, canReadContent } from './roles.js';
import { sectionSchema, isPublished } from './editorial.js';
import { HttpError } from './http.js';
export const PRIVATE_DIR = path.resolve(process.env.PRIVATE_UPLOAD_DIR || path.join(process.cwd(), 'storage/private'));
export function imageType(buffer) {
  if (buffer.subarray(0, 3).equals(Buffer.from([255,216,255]))) return ['.jpg','image/jpeg'];
  if (buffer.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return ['.png','image/png'];
  if (['GIF87a','GIF89a'].includes(buffer.subarray(0,6).toString())) return ['.gif','image/gif'];
  if (buffer.subarray(0,4).toString() === 'RIFF' && buffer.subarray(8,12).toString() === 'WEBP') return ['.webp','image/webp'];
  throw new HttpError(400, 'Formato de imagen no permitido. Usa JPG, PNG, GIF o WebP');
}
export function newsAssetIds(doc) {
  const urls = [doc.imagenes?.portada?.url, ...(doc.imagenes?.galeria || []).map(i => i.url), ...[...(doc.contenido || '').matchAll(/(?:https?:\/\/[^\s)"<>]+)?\/api\/archivos\/([a-f0-9-]{36})/g)].map(m => `/api/archivos/${m[1]}`)];
  return [...new Set(urls.filter(Boolean).map(url => url.match(/^\/api\/archivos\/([a-f0-9-]{36})$/)?.[1]).filter(Boolean))];
}
export async function bindNewsAssets(doc, section, user) {
  for (const id of newsAssetIds(doc)) {
    const { data: asset } = await couch.get(`/private_assets/${id}`);
    if (asset.section !== section || (asset.resourceId ? asset.resourceId !== doc._id : asset.ownerId !== user.id)) throw new HttpError(403, 'Archivo no autorizado para esta publicación');
    if (!asset.resourceId) await couch.put(`/private_assets/${id}`, { ...asset, resourceId: doc._id });
  }
}
export async function saveUpload(formData, user, kind) {
  const file = formData.get(kind === 'image' ? 'foto' : kind === 'cv' ? 'cv' : 'pdf');
  if (!file || typeof file.arrayBuffer !== 'function') throw new HttpError(400, 'Selecciona un archivo');
  const max = kind === 'image' ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
  if (file.size > max || file.size === 0) throw new HttpError(400, 'Tamaño de archivo no permitido');
  const buffer = Buffer.from(await file.arrayBuffer());
  const [extension, mime] = kind === 'image' ? imageType(buffer) : buffer.subarray(0,5).toString() === '%PDF-' ? ['.pdf', 'application/pdf'] : (() => { throw new HttpError(400, 'El archivo no es un PDF'); })();
  const id = randomUUID();
  const requestedModule = formData.get('module') || ({ libros:'libros', 'libros/portadas':'libros', investigaciones:'investigaciones' })[formData.get('carpeta')];
  if (['gaceta','libros','investigaciones'].includes(requestedModule)) {
    const section = requestedModule === 'gaceta' ? sectionSchema.parse(formData.get('section')) : null;
    if (!can(user, `${requestedModule}.create`, { section }) && !can(user, `${requestedModule}.review`, { section })) throw new HttpError(403, 'Sección no autorizada');
    await fs.mkdir(PRIVATE_DIR, { recursive: true });
    await fs.writeFile(path.join(PRIVATE_DIR, id + extension), buffer, { flag: 'wx', mode: 0o600 });
    await couch.put(`/private_assets/${id}`, { _id: id, extension, mime, module: requestedModule, section, ownerId: user.id, createdAt: new Date().toISOString() });
    return { ok: true, url: `/api/archivos/${id}`, pdfUrl: `/api/archivos/${id}`, thumbnailUrl: null };
  }
  // Existing public catalog uploads remain publisher-only. A folder is not a permission.
  const folders = { autores: 'autores', investigadores_fotos: 'investigadores', cv_pdfs: 'investigadores', investigaciones: 'investigaciones', carrousel: 'inicio', 'libros/portadas': 'libros', libros: 'libros' };
  const folder = formData.get('carpeta');
  const module = folders[folder];
  if (!module || !can(user, `${module}.manage`)) throw new HttpError(403, 'Destino de archivo no autorizado');
  const dir = path.join(process.cwd(), 'public/uploads', folder);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, id + extension), buffer, { flag: 'wx' });
  const url = `/uploads/${folder}/${id}${extension}`;
  let thumbnailUrl = null;
  if (mime === 'application/pdf') {
    try {
      await executeFile('pdftoppm', ['-f','1','-singlefile','-png','-scale-to','800', path.join(dir, id + extension), path.join(dir, id + '-thumb')], { timeout: 20000, maxBuffer: 1024 * 1024 });
      thumbnailUrl = `/uploads/${folder}/${id}-thumb.png`;
    } catch { /* A preview is optional; the uploaded PDF remains usable. */ }
  }
  return { ok: true, url, thumbnail: thumbnailUrl, thumbnailUrl, pdfUrl: url };
}
export async function readPrivateAsset(id, user) {
  const { data: asset } = await couch.get(`/private_assets/${id}`);
  let allowed = false;
  const module = asset.module || 'gaceta';
  if (!['gaceta','libros','investigaciones'].includes(module)) throw new HttpError(404,'Archivo no encontrado');
  if (asset.resourceId) {
    const database = module === 'gaceta' ? `cimu-gaceta-${sectionSchema.parse(asset.section)}` : module === 'libros' ? 'cimu-libros' : 'investigaciones';
    const { data: doc } = await couch.get(`/${database}/${encodeURIComponent(asset.resourceId)}`);
    const ids = module === 'gaceta' ? newsAssetIds(doc) : catalogAssetIds(doc);
    allowed = ids.includes(id) && (isPublished(doc) || canReadContent(user, module, doc, asset.section));
  } else allowed = user?.id === asset.ownerId && user.status === 'active' && can(user, `${module}.create`, { section:asset.section });
  if (!allowed) throw new HttpError(404, 'Archivo no encontrado');
  if (!['.png','.jpg','.gif','.webp','.pdf'].includes(asset.extension)) throw new HttpError(404, 'Archivo no encontrado');
  return { buffer: await fs.readFile(path.join(PRIVATE_DIR, id + asset.extension)), mime: asset.mime };
}

export function catalogAssetIds(doc) {
  return [...new Set([...JSON.stringify([doc.portada,doc.pdf_url,doc.pdf_thumbnail,doc.uri,doc.imagenURL,doc.pdfURL]).matchAll(/\/api\/archivos\/([a-f0-9-]{36})/g)].map(m => m[1]))];
}
export async function bindCatalogAssets(doc,module,user) {
  for (const id of catalogAssetIds(doc)) {
    const { data:asset } = await couch.get(`/private_assets/${id}`);
    if (asset.module !== module || (asset.resourceId ? asset.resourceId !== doc._id : asset.ownerId !== user.id)) throw new HttpError(403,'Archivo no autorizado para este contenido');
    if (!asset.resourceId) await couch.put(`/private_assets/${id}`,{ ...asset,resourceId:doc._id });
  }
}
