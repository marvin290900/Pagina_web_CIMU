import { z } from 'zod';
import { SECTIONS, can, canReadContent, canEditContent } from './roles.js';
import { HttpError } from './http.js';
export const sectionSchema = z.enum(SECTIONS);
export const collectionSchema = z.enum([...SECTIONS, 'autores']);
const image = z.object({ url: z.string().max(2000), descripcion: z.string().max(1000).default('') });
export const newsSchema = z.object({
  _id: z.string().optional(), _rev: z.string().optional(),
  titulo: z.string().trim().min(1).max(500), tipo: sectionSchema,
  contenido: z.string().min(1).max(200000), categoria: z.string().max(200).default(''),
  fecha_publicacion: z.string().max(50), autor: z.object({ id: z.string().min(1).max(128), nombre: z.string().max(200) }),
  etiquetas: z.array(z.string().max(100)).max(30).default([]),
  imagenes: z.object({ portada: image, galeria: z.array(image).max(30).default([]), link_yt: z.string().max(2000).optional() }),
  link_yt: z.string().max(2000).optional(), estado: z.string().optional(), visitas: z.number().optional(),
});
const publicLink = z.string().max(2000).refine(v => !v || /^https?:\/\//i.test(v), 'Usa un enlace http o https');
export const authorSchema = z.object({ nombre: z.string().trim().min(1).max(200), correo: z.string().email().max(254), biografia: z.string().max(10000).optional(), foto: z.string().max(2000).optional(), estado: z.enum(['activo', 'inactivo']), redes_sociales: z.record(publicLink).optional() });
export function isPublished(doc) { return doc?.editorialStatus === 'publicado'; }
export function publicNews(doc) {
  const keys = ['_id','titulo','tipo','contenido','categoria','fecha_publicacion','autor','etiquetas','imagenes','link_yt','visitas'];
  return { ...Object.fromEntries(keys.filter(k => doc[k] !== undefined).map(k => [k, doc[k]])), estado: 'activo' };
}
export function publicAuthor(doc) {
  const author = Object.fromEntries(['_id','nombre','biografia','foto','estado'].filter(k => doc[k] !== undefined).map(k => [k, doc[k]]));
  author.redes_sociales = Object.fromEntries(Object.entries(doc.redes_sociales || {}).filter(([,value]) => typeof value === 'string' && /^https?:\/\//i.test(value)));
  return author;
}

export function assertNewsRead(user, doc, section) {
  if (!canReadContent(user, 'gaceta', doc, section)) throw new HttpError(403, 'No puedes consultar este contenido interno');
}
export function assertNewsEdit(user, doc, section) {
  if (!canEditContent(user, 'gaceta', doc, section)) throw new HttpError(403, 'No puedes editar esta publicación');
  if (!['borrador'].includes(doc.editorialStatus)) throw new HttpError(409, 'Devuelve la publicación a borrador antes de editarla');
}
export function nextContentState(user, doc, module, section, target) {
  const scope = { section };
  const current = doc.editorialStatus;
  let allowed = false;
  if (current === 'borrador' && target === 'en_revision') allowed = canEditContent(user, module, doc, section);
  if (current === 'en_revision' && ['borrador', 'aprobado'].includes(target)) allowed = can(user, `${module}.review`, scope);
  if (current === 'aprobado' && target === 'publicado') allowed = can(user, `${module}.publish`, scope);
  if (['aprobado', 'archivado', 'publicado'].includes(current) && target === 'borrador') allowed = can(user, `${module}.unpublish`, scope);
  if (current !== 'archivado' && target === 'archivado') allowed = can(user, `${module}.archive`, scope);
  if (!allowed) throw new HttpError(403, 'Transición editorial no permitida');
  return target;
}

export function nextNewsState(user,doc,section,target) { return nextContentState(user,doc,"gaceta",section,target); }
