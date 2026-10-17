import { SECTIONS, can, canEditContent } from './security/roles.js';

export const NEWS_SECTIONS = {
  actualidad: 'Actualidad', vida_universitaria: 'Vida universitaria',
  opinion: 'Opinión', memoria: 'Memoria', audiovisuales: 'Audiovisuales',
};
export const PUBLICATION_STATES = [
  { value: 'borrador', label: 'Borrador', short: 'Borrador' },
  { value: 'en_revision', label: 'En revisión', short: 'Revisión' },
  { value: 'aprobado', label: 'Aprobada', short: 'Aprobación' },
  { value: 'publicado', label: 'Publicada', short: 'Publicación' },
];
export function stateLabel(state) {
  return state === 'archivado' ? 'Archivada' : PUBLICATION_STATES.find(s => s.value === state)?.label || 'Sin clasificar';
}
export function dateLabel(value, withTime = false) {
  const date = new Date(value || '');
  if (!Number.isFinite(date.getTime())) return '—';
  return new Intl.DateTimeFormat('es-SV', { dateStyle: 'medium', ...(withTime ? { timeStyle: 'short' } : {}), timeZone: 'America/El_Salvador' }).format(date);
}
export function newsSectionsFor(user) {
  return SECTIONS.filter(section => can(user, 'gaceta.read_internal', { section }) || can(user, 'gaceta.create', { section }));
}
export function newsActions(user, doc, section) {
  const actions = [];
  const scope = { section };
  const state = doc.editorialStatus;
  if (state === 'borrador' && canEditContent(user, 'gaceta', doc, section)) actions.push({ target: 'en_revision', label: 'Enviar a revisión' });
  if (state === 'en_revision' && can(user, 'gaceta.review', scope)) actions.push({ target: 'aprobado', label: 'Aprobar publicación' }, { target: 'borrador', label: 'Solicitar correcciones', secondary: true });
  if (state === 'aprobado' && can(user, 'gaceta.publish', scope)) actions.push({ target: 'publicado', label: 'Publicar' });
  if (state === 'archivado' && doc.archivedFrom === 'publicado' && can(user, 'gaceta.publish', scope)) actions.push({ target: 'publicado', label: 'Volver a publicar' });
  if (['publicado', 'aprobado', 'archivado'].includes(state) && can(user, 'gaceta.unpublish', scope)) actions.push({ target: 'borrador', label: 'Retirar a borrador', secondary: true });
  if (state && state !== 'archivado' && can(user, 'gaceta.archive', scope)) actions.push({ target: 'archivado', label: 'Archivar publicación', secondary: true });
  return actions;
}
export function newsRecordUrl(doc, section = doc.sectionKey || doc.tipo) {
  return `/admin/gaceta/publicacion/${encodeURIComponent(doc._id)}?categoria=${encodeURIComponent(section)}`;
}
export async function adminRequest(url, options = {}) {
  const response = await fetch(url, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers } });
  let data;
  try { data = await response.json(); } catch { throw new Error('No se pudo leer la respuesta. Intenta nuevamente.'); }
  if (!response.ok) {
    const fields = Object.values(data.fields?.fieldErrors || {}).flat().join('. ');
    throw new Error(fields || (typeof data.error === 'string' ? data.error : 'No se pudo completar la operación.'));
  }
  return data;
}
export function videoEmbedUrl(value) {
  if (!value) return '';
  try {
    const url = new URL(value);
    if (!['https:', 'http:'].includes(url.protocol)) return '';
    if (!['youtube.com','www.youtube.com','m.youtube.com','youtube-nocookie.com','www.youtube-nocookie.com','youtu.be'].includes(url.hostname)) return '';
    const id = url.hostname === 'youtu.be' ? url.pathname.slice(1) : url.searchParams.get('v') || url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/)?.[1];
    return /^[A-Za-z0-9_-]{11}$/.test(id || '') ? `https://www.youtube-nocookie.com/embed/${id}` : '';
  } catch { return ''; }
}
