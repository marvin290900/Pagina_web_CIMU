import { can } from './roles.js';
import { adminRule } from './routes.js';

// Navigation and middleware use the same access checks, so visible links open
// a page the account can actually use. Resource permissions remain in services.
export function hasAccessRule(user, rule) {
  if (!user || user.status !== 'active' || !rule) return false;
  if (rule === 'authenticated') return true;
  if (['gaceta.access', 'libros.access', 'investigaciones.access'].includes(rule)) {
    const module = rule.split('.')[0];
    return can(user, `${module}.read_internal`) || can(user, `${module}.create`);
  }
  return can(user, rule);
}

export function canAccessAdminPage(user, path) {
  return hasAccessRule(user, adminRule(path));
}

const LINKS = [
  { href: '/admin', label: 'Panel', description: 'Accesos y permisos de tu cuenta.' },
  { href: '/admin/usuarios', label: 'Cuentas y permisos', description: 'Gestionar personas, roles y módulos asignados.' },
  { href: '/admin/carrousel_imagenes', label: 'Carrusel de inicio', description: 'Agregar, editar y retirar las imágenes de la página principal.' },
  { href: '/admin/libros', label: 'Gestión de libros', description: 'Crear libros, revisar y publicar el catálogo editorial.' },
  { href: '/admin/gaceta', label: 'Gaceta', description: 'Gestionar noticias, autores y publicaciones destacadas.' },
  { href: '/admin/investigacion', label: 'Investigaciones', description: 'Preparar, revisar y publicar investigaciones.' },
  { href: '/admin/investigadores', label: 'Investigadores', description: 'Actualizar los perfiles de investigadores.' },
  { href: '/admin/auditoria', label: 'Actividad', description: 'Consultar las operaciones registradas.' },
  { href: '/admin/cuenta', label: 'Mi cuenta', description: 'Consultar tu identidad y cambiar tu contraseña.' },
];

export function getAdminLinks(user) {
  return LINKS.filter(link => canAccessAdminPage(user, link.href));
}
