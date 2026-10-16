import { couch } from '../couchDB.js';
import { randomUUID } from 'node:crypto';
import { can, canReadContent, SECTIONS } from './roles.js';
import { HttpError } from './http.js';
import { sectionSchema, collectionSchema, newsSchema, authorSchema, assertNewsEdit, nextNewsState, isPublished, publicNews, publicAuthor } from './editorial.js';
import { allDocs } from './store.js';
import { audit } from './audit.js';
import { bindNewsAssets } from './uploads.js';
export const newsPath = (section, id) => `/cimu-gaceta-${collectionSchema.parse(section)}/${encodeURIComponent(id)}`;
export async function getNews(section, id) { return (await couch.get(newsPath(section, id))).data; }
export async function listNews(section, user, internal = false) {
  collectionSchema.parse(section);
  const docs = await allDocs(`cimu-gaceta-${section}`);
  if (section === 'autores') {
    if (internal && !can(user, 'autores.manage')) throw new HttpError(403, 'No puedes administrar autores');
    return docs.filter(d => internal || d.estado === 'activo').map(d => internal ? d : publicAuthor(d));
  }
  if (internal && !can(user, 'gaceta.read_internal', { section }) && !can(user, 'gaceta.create', { section })) throw new HttpError(403, 'Sección no autorizada');
  return docs.filter(d => internal ? canReadContent(user, 'gaceta', d, section) : isPublished(d)).map(d => internal ? d : publicNews(d));
}
export async function saveNews(section, raw, user, id) {
  collectionSchema.parse(section);
  if (section === 'autores') {
    if (!can(user, 'autores.manage')) throw new HttpError(403, 'No puedes administrar autores');
    const input = authorSchema.parse(raw);
    const current = id ? await getNews(section, id) : null;
    if (current && raw._rev !== current._rev) throw new HttpError(409, 'El autor cambió. Recarga la lista');
    const doc = { ...(current || {}), ...input, _id: id || randomUUID(), updatedBy: user.id, updatedAt: new Date().toISOString() };
    const { data } = await couch.put(newsPath(section, doc._id), doc);
    await audit(user.id, current ? 'authors.update' : 'authors.create', doc._id);
    return { ...doc, _rev: data.rev };
  }
  const input = newsSchema.parse(raw);
  if (input.tipo !== section) throw new HttpError(400, 'No puedes trasladar una publicación de sección');
  const current = id ? await getNews(section, id) : null;
  if (current) {
    assertNewsEdit(user, current, section);
    if (raw._rev !== current._rev) throw new HttpError(409, 'La publicación cambió. Recarga la lista');
  } else if (!can(user, 'gaceta.create', { section })) throw new HttpError(403, 'No puedes crear en esta sección');
  const author = await getNews('autores', input.autor.id);
  if (author.estado !== 'activo' && current?.autor?.id !== author._id) throw new HttpError(400, 'Selecciona un autor activo');
  // Whitelist fields; workflow, ownership, counters and assignments are server controlled.
  const { _id, _rev, estado, visitas, ...content } = input;
  const doc = { ...(current || {}), ...content, autor: { id: author._id, nombre: author.nombre }, _id: id || randomUUID(), editorialStatus: current?.editorialStatus || 'borrador', estado: current?.editorialStatus === 'publicado' ? 'activo' : 'inactivo', createdBy: current ? current.createdBy : user.id, createdAt: current?.createdAt || new Date().toISOString(), assignedTo: current?.assignedTo || [], updatedBy: user.id, updatedAt: new Date().toISOString(), visitas: current?.visitas || 0 };
  await bindNewsAssets(doc, section, user);
  const { data } = await couch.put(newsPath(section, doc._id), doc);
  await audit(user.id, current ? 'gaceta.update' : 'gaceta.create', doc._id, { section, editorialStatus: doc.editorialStatus });
  return { ...doc, _rev: data.rev };
}
export async function transitionNews(section, id, rev, target, note, user) {
  const doc = await getNews(section, id);
  if (doc._rev !== rev) throw new HttpError(409, 'La publicación cambió. Recarga la lista');
  const restoringPublished = doc.editorialStatus === 'archivado' && doc.archivedFrom === 'publicado' && target === 'publicado' && can(user, 'gaceta.publish', { section });
  const editorialStatus = restoringPublished ? 'publicado' : nextNewsState(user, doc, section, target);
  const history = [...(doc.editorialHistory || []), { from: doc.editorialStatus, to: editorialStatus, actorId: user.id, note, at: new Date().toISOString() }];
  const updated = { ...doc, editorialStatus, estado: editorialStatus === 'publicado' ? 'activo' : 'inactivo', editorialHistory: history, updatedBy: user.id, updatedAt: new Date().toISOString() };
  if (editorialStatus === 'archivado') updated.archivedFrom = doc.editorialStatus;
  if (editorialStatus === 'publicado' && doc.editorialStatus !== 'archivado') updated.fecha_publicacion = new Date().toISOString();
  const { data } = await couch.put(newsPath(section, id), updated);
  await audit(user.id, `gaceta.${editorialStatus}`, id, { section, note });
  return { ...updated, _rev: data.rev };
}

export async function authorPublications(authorId) {
  const refs = [];
  for (const section of SECTIONS) {
    let docs;
    try { docs = await allDocs(`cimu-gaceta-${section}`); }
    catch (error) { if (error.response?.status === 404) continue; throw error; }
    for (const doc of docs) if (isPublished(doc) && doc.autor?.id === authorId) refs.push({ id: doc._id, tipo: section });
  }
  return refs;
}

export async function deleteNews(section, id, rev, user) {
  sectionSchema.parse(section); // Authors have their own management; this deletes news only.
  if (!can(user, 'gaceta.delete', { section })) throw new HttpError(403, 'No puedes eliminar publicaciones de esta sección');
  const doc = await getNews(section, id);
  if (doc._rev !== rev) throw new HttpError(409, 'La publicación cambió. Recarga la lista antes de eliminar');
  await couch.delete(newsPath(section, id), { params: { rev: doc._rev } });
  // References are filtered against existing publications when read. Keep files, which may
  // be shared or needed for recovery; private files cannot be read without their resource.
  await audit(user.id, 'gaceta.delete', id, { section, titulo: doc.titulo, editorialStatus: doc.editorialStatus });
}
