import { ROLE_LABELS } from './security/roles.js';
export const MODULE_LABELS = { gaceta: 'Gaceta', libros: 'Libros', investigaciones: 'Investigaciones', investigadores: 'Investigadores', autores: 'Autores públicos', inicio: 'Inicio y carrusel' };
export const ACCOUNT_STATES = { active: 'Activa', invited: 'Invitación pendiente', disabled: 'Desactivada' };
export const PROGRAM_LABELS = { 'estudios-sociologicos':'Estudios sociológicos', 'juridicos-politicos':'Estudios jurídicos y políticos', 'tierra-medio-ambiente':'Tierra y medio ambiente', 'genero-inclusion':'Género e inclusión', 'opinion-publica':'Opinión pública' };
export const ROLE_DESCRIPTIONS = {
  administrador: 'Administra cuentas, roles, sesiones y auditoría. La publicación requiere una asignación editorial adicional.',
  director: 'Dirige el proceso editorial: asigna, revisa, publica, retira y archiva dentro de sus módulos y secciones.',
  editor: 'Crea borradores, edita contenido propio o asignado, revisa y aprueba. La publicación corresponde a dirección.',
  colaborador: 'Crea y edita borradores propios, y los envía al equipo para revisión.',
  consulta: 'Consulta contenido interno en los módulos y secciones asignados, sin modificarlo.',
};
export function accountRoles(user) { return [...new Set((user.assignments || []).map(a => ROLE_LABELS[a.role]))].join(', '); }
export function accountModules(user) { return [...new Set((user.assignments || []).filter(a => a.role !== 'administrador').flatMap(a => a.modules || []))]; }
export function initials(name = '') { return name.trim().split(/\s+/).slice(0,2).map(p => p[0] || '').join('').toUpperCase(); }
