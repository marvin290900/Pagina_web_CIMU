// Shared by server and UI. These definitions never grant access on their own.
export const MODULES = ['gaceta', 'libros', 'investigaciones', 'investigadores', 'autores', 'inicio'];
export const SECTIONS = ['actualidad', 'vida_universitaria', 'opinion', 'memoria', 'audiovisuales'];
export const ROLE_LABELS = { administrador: 'Administrador', director: 'Director editorial', editor: 'Editor', colaborador: 'Colaborador', consulta: 'Consulta interna' };
const editorial = ['read_internal', 'create', 'edit_own', 'edit_assigned', 'review', 'publish', 'unpublish', 'archive', 'feature', 'assign', 'manage'];
export const ROLE_ACTIONS = {
  administrador: ['users.read', 'users.create', 'users.update', 'users.assign_roles', 'users.disable', 'sessions.revoke', 'audit.read'],
  director: editorial,
  editor: ['read_internal', 'create', 'edit_own', 'edit_assigned', 'review'],
  colaborador: ['read_own', 'create', 'edit_own', 'submit'],
  consulta: ['read_internal'],
};
export function can(user, permission, scope = {}) {
  if (!user || user.status !== 'active' || typeof permission !== 'string') return false;
  const [module, action, extra] = permission.split('.');
  if (extra || !action) return false;
  return (user.assignments || []).some(assignment => {
    const actions = [...(ROLE_ACTIONS[assignment.role] || []), ...(assignment.role === 'director' && module === 'gaceta' ? ['edit_published', 'delete'] : [])];
    if (assignment.role === 'administrador') return actions.includes(permission);
    if (!MODULES.includes(module) || !actions.includes(action)) return false;
    if (!assignment.modules?.includes(module)) return false;
    if (module === 'gaceta') {
      if (scope.section && !assignment.sections?.includes('*') && !assignment.sections?.includes(scope.section)) return false;
      if (!assignment.sections?.length) return false;
    }
    if (action === 'edit_own' || action === 'read_own') return scope.createdBy === user.id;
    if (action === 'edit_assigned') return assignment.role === 'director' || scope.assignedTo?.includes(user.id);
    return true;
  });
}
export function canReadContent(user, module, doc, section) {
  return can(user, `${module}.read_internal`, { section }) || can(user, `${module}.read_own`, { section, createdBy: doc.createdBy });
}
export function canEditContent(user, module, doc, section) {
  const scope = { section, createdBy: doc.createdBy, assignedTo: doc.assignedTo };
  return can(user, `${module}.edit_own`, scope) || can(user, `${module}.edit_assigned`, scope);
}
// Direction can update live news and archived news without changing their visibility.
export function canEditNews(user, doc, section) {
  if (!canEditContent(user, 'gaceta', doc, section)) return false;
  return doc.editorialStatus === 'borrador'
    || (doc.editorialStatus === 'publicado' && can(user, 'gaceta.edit_published', { section }))
    || (doc.editorialStatus === 'archivado' && can(user, 'gaceta.manage', { section }));
}
export function publicUser(account) {
  const { id, email, name, status, assignments, authVersion, createdAt, updatedAt } = account;
  return { id, email, name, status, assignments, authVersion, createdAt, updatedAt };
}
