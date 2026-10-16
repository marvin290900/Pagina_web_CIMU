import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { couch } from '../couchDB.js';
import { allDocs } from './store.js';
import { can, canReadContent, canEditContent } from './roles.js';
import { HttpError } from './http.js';
import { audit } from './audit.js';
import { nextContentState, isPublished } from './editorial.js';
import { bindCatalogAssets } from './uploads.js';
import { idSchema } from './validation.js';
export const catalogModule = z.enum(['libros','investigaciones']);
export const catalogDB = module => ({ libros:'cimu-libros', investigaciones:'investigaciones' })[catalogModule.parse(module)];
const reference = z.object({ id:idSchema, nombre:z.string().min(1).max(200) });
const text = z.string().max(10000);
const assetUrl = z.string().max(2000).refine(v => !v || /^https?:\/\//i.test(v) || /^\/(uploads|api\/archivos)\//.test(v), 'URL de archivo inválida');
export const bookSchema = z.object({ titulo:z.string().trim().min(1).max(500), tipo:z.string().max(100).default(''), fecha_publicacion:z.string().max(50), editorial:z.string().max(200).default(''), coleccion:z.string().max(200).default(''), paginas:z.coerce.number().int().nonnegative().nullable().optional(), isbn:z.string().max(100).default(''), uri:assetUrl.default(''), resumen:text.default(''), portada:assetUrl.default(''), pdf_url:assetUrl.default(''), pdf_thumbnail:assetUrl.default(''), palabras_clave:z.array(z.string().max(100)).max(100).default([]), autores:z.array(reference).min(1).max(50) });
export const researchInput = z.object({ titulo:z.string().trim().min(1).max(500), resumen:text, descripcion:text, programa:z.string().min(1).max(200), investigadores:z.array(reference).min(1).max(50), 'Fecha de publicacion':z.string().regex(/^\d{4}-\d{2}-\d{2}$/), URI:assetUrl.default(''), 'palabras clave':z.string().max(3000).default(''), imagenURL:assetUrl.default(''), pdfURL:assetUrl.default(''), metadata:z.object({ UploadDate:z.string(),LastChange:z.string() }).optional() });
export function parseResearch(raw) {
  const value = researchInput.parse(raw);
  return { titulo:value.titulo,resumen:value.resumen,descripcion:value.descripcion,programa:value.programa,investigadores:value.investigadores,fecha_publicacion:value['Fecha de publicacion'],uri:value.URI,palabras_clave:value['palabras clave'].split(',').map(v => v.trim()).filter(Boolean),imagenURL:value.imagenURL,pdfURL:value.pdfURL };
}
export function publicCatalog(doc,module) {
  const keys = module === 'libros' ? ['_id','titulo','tipo','fecha_publicacion','editorial','coleccion','paginas','isbn','uri','resumen','portada','pdf_url','pdf_thumbnail','palabras_clave','autores','vistas','descargas'] : ['_id','titulo','resumen','descripcion','programa','investigadores','fecha_publicacion','uri','palabras_clave','imagenURL','pdfURL','metadata'];
  return Object.fromEntries(keys.filter(k => doc[k] !== undefined).map(k => [k,doc[k]]));
}
export async function getCatalog(module,id) { return (await couch.get(`/${catalogDB(module)}/${encodeURIComponent(id)}`)).data; }
export async function listCatalog(module,user,internal = false) {
  let stored;
  try { stored = await allDocs(catalogDB(module)); } catch(error) { if (error.response?.status === 404) stored = []; else throw error; }
  const docs = stored.filter(d => typeof d.titulo === 'string');
  if (internal && !can(user,`${module}.read_internal`) && !can(user,`${module}.create`)) throw new HttpError(403,'Módulo no autorizado');
  return docs.filter(d => internal ? canReadContent(user,module,d) : isPublished(d)).map(d => internal ? d : publicCatalog(d,module));
}
export async function saveCatalog(module,raw,user,id) {
  catalogModule.parse(module);
  const data = module === 'libros' ? bookSchema.parse(raw) : parseResearch(raw);
  const current = id ? await getCatalog(module,id) : null;
  if (current) {
    if (!canEditContent(user,module,current)) throw new HttpError(403,'No puedes editar este contenido');
    if (current.editorialStatus !== 'borrador') throw new HttpError(409,'Devuelve el contenido a borrador antes de editar');
    if (raw._rev !== current._rev) throw new HttpError(409,'El contenido cambió. Recarga la lista');
  } else if (!can(user,`${module}.create`)) throw new HttpError(403,'No puedes crear en este módulo');
  const authors = module === 'libros' ? data.autores : data.investigadores;
  for (const author of authors) { const { data:profile } = await couch.get(`/investigadores/${encodeURIComponent(author.id)}`); author.nombre = profile.nombre || author.nombre; }
  const now = new Date().toISOString();
  const doc = { ...(current || {}), ...data, _id:id || randomUUID(), editorialStatus:'borrador', createdBy:current?.createdBy || user.id, createdAt:current?.createdAt || now, updatedBy:user.id, updatedAt:now, assignedTo:current?.assignedTo || [], metadata:{ uploadDate:current?.metadata?.uploadDate || now,lastChange:now } };
  await bindCatalogAssets(doc,module,user);
  const { data:result } = await couch.put(`/${catalogDB(module)}/${doc._id}`,doc);
  await audit(user.id,`${module}.${current ? 'update' : 'create'}`,doc._id);
  return { ...doc,_rev:result.rev };
}
export async function transitionCatalog(module,id,rev,target,note,user) {
  const current = await getCatalog(module,id);
  if (current._rev !== rev) throw new HttpError(409,'El contenido cambió. Recarga la lista');
  const next = nextContentState(user,current,module,undefined,target);
  const now = new Date().toISOString();
  const doc = { ...current,editorialStatus:next,updatedBy:user.id,updatedAt:now,editorialHistory:[...(current.editorialHistory || []),{ from:current.editorialStatus,to:next,actorId:user.id,note,at:now }] };
  const { data } = await couch.put(`/${catalogDB(module)}/${id}`,doc);
  await audit(user.id,`${module}.${next}`,id,{ note });
  return { ...doc,_rev:data.rev };
}

export async function researcherPublications(profiles) {
  const [books,research] = await Promise.all([listCatalog('libros'),listCatalog('investigaciones')]);
  return profiles.map(profile => ({ ...profile,
    libros:books.filter(book => book.autores?.some(a => a.id === profile._id)).map(book => ({id:book._id,titulo:book.titulo})),
    proyectos_investigacion:research.filter(doc => doc.investigadores?.some(a => a.id === profile._id)).map(doc => ({id:doc._id,nombre:doc.titulo})),
  }));
}
