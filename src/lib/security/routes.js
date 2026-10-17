// Exact method + pathname matches. Unknown APIs and admin pages fail closed.
const entries = [
  ['POST', '/api/login', 'public'], ['POST', '/api/logout', 'public'],
  ['POST', '/api/cuenta/activar', 'public'], ['POST', '/api/cuenta/password', 'authenticated'], ['GET', '/api/cuenta/me', 'authenticated'],
  ['GET', '/api/usuarios', 'users.read'], ['POST', '/api/usuarios', 'users.create'], ['POST', '/api/register', 'users.create'],
  ['GET', '/api/admin/auditoria', 'audit.read'],
  ['POST', '/api/editorial/transicion', 'authenticated'], ['PATCH', '/api/editorial/asignar', 'authenticated'], ['GET', '/api/editorial/responsables', 'authenticated'],
  ['GET', '/api/gaceta/responsables', 'authenticated'], ['PATCH', '/api/gaceta/asignar', 'authenticated'],
  ...['obtener', 'obtener_recientes', 'obtener_destacados', 'actualidad/buscar', 'actualidad/obtener_todos'].map(p => ['GET', `/api/gaceta/${p}`, 'public']),
  ...['crear', 'actualizar', 'eliminar', 'transicion', 'desactivar_autor', 'agregar_destacada'].map((p, i) => [['POST','PUT','DELETE','POST','PATCH','PUT'][i], `/api/gaceta/${p}`, 'authenticated']),
  ['GET', '/api/investigadores/obtener', 'public'], ['POST', '/api/investigadores/agregar', 'investigadores.manage'], ['PUT', '/api/investigadores/editar', 'investigadores.manage'], ['DELETE', '/api/investigadores/eliminar', 'investigadores.manage'], ['POST', '/api/investigadores/subir_cv', 'investigadores.manage'], ['POST', '/api/investigadores/eliminar_archivo', 'investigadores.manage'],
  ['GET', '/api/inicio/obtener', 'public'], ['POST', '/api/inicio/agregar', 'inicio.manage'], ['PUT', '/api/inicio/editar', 'inicio.manage'], ['DELETE', '/api/inicio/eliminar', 'inicio.manage'], ['POST', '/api/inicio/eliminar_imagen', 'inicio.manage'],
  ...['obtener', 'obtener-filtrados', 'buscar'].map(p => ['GET', `/api/libros/${p}`, 'public']),
  ['POST', '/api/libros/actualizar-vistas', 'public'], ['POST', '/api/libros/crear', 'authenticated'], ['PUT', '/api/libros/actualizar', 'authenticated'], ['DELETE', '/api/libros/eliminar', 'libros.manage'],
  ['GET', '/api/investigaciones/investigaciones', 'public'], ...['POST','PUT','DELETE'].map(m => [m, '/api/investigaciones/investigaciones', 'authenticated']),
  ['GET', '/api/remi/obtener_revista', 'public'], ['GET', '/api/articulos', 'libros.read_internal'], ...['POST','PUT','DELETE'].map(m => [m, '/api/articulos', 'libros.manage']),
  ['POST', '/api/subir_imagen', 'authenticated'], ['POST', '/api/subir_pdf', 'authenticated'],
];
const table = new Map(entries.map(([method, path, permission]) => [`${method} ${path}`, permission]));
export function apiRule(method, path) {
  const exact = table.get(`${method === 'HEAD' ? 'GET' : method} ${path}`);
  if (exact) return exact;
  if (method === 'PATCH' && /^\/api\/usuarios\/[a-zA-Z0-9_-]+$/.test(path)) return 'users.update';
  if (method === 'POST' && /^\/api\/usuarios\/[a-zA-Z0-9_-]+\/acceso$/.test(path)) return 'sessions.revoke';
  if (['GET','HEAD'].includes(method) && /^\/api\/(investigaciones|investigaciones-programa)\/[a-zA-Z0-9_-]+$/.test(path)) return 'public';
  if (['GET','HEAD'].includes(method) && /^\/api\/archivos\/[a-f0-9-]+$/.test(path)) return 'public';
  return null;
}
export const ADMIN_PAGES = {
  '/admin': 'authenticated', '/admin/informacion': 'authenticated', '/admin/cuenta': 'authenticated',
  '/admin/usuarios': 'users.read', '/admin/auditoria': 'audit.read',
  '/admin/inicio': 'inicio.manage', '/admin/carrousel_imagenes': 'inicio.manage', '/admin/investigadores': 'investigadores.manage',
  '/admin/libros': 'libros.access', '/admin/investigacion': 'investigaciones.access',
  '/admin/gaceta': 'gaceta.access', '/admin/gaceta/gestion_publicaciones': 'gaceta.access',
  '/admin/gaceta/gestion_usuarios': 'autores.manage', '/admin/gaceta/gestion_autores': 'autores.manage', '/admin/gaceta/gestion_destacados': 'gaceta.feature',
};

export function adminRule(path) {
  if (path === '/admin/usuarios/nueva') return 'users.create';
  if (/^\/admin\/usuarios\/[a-zA-Z0-9_-]+$/.test(path)) return 'users.read';
  if (/^\/admin\/gaceta\/publicacion\/[a-zA-Z0-9_-]+$/.test(path)) return 'gaceta.access';
  return ADMIN_PAGES[path] || null;
}
