import test from 'node:test';
import assert from 'node:assert/strict';
import { getAdminLinks, canAccessAdminPage, hasAccessRule } from '../src/lib/security/navigation.js';
const account = (role, modules) => ({ id: 'person', status: 'active', assignments: [{ role, modules, sections: ['opinion'] }] });
test('directors have working links to carousel and books when assigned those modules', () => {
  const user = account('director', ['inicio', 'libros']);
  const links = getAdminLinks(user);
  assert(links.some(link => link.href === '/admin/carrousel_imagenes'));
  assert(links.some(link => link.href === '/admin/libros'));
  assert(!links.some(link => link.href === '/admin/inicio'));
  assert(!links.some(link => link.href === '/admin/gaceta'));
  assert(canAccessAdminPage(user, '/admin/inicio'));
  for (const link of links) assert(canAccessAdminPage(user, link.href));
});
test('links and pages respect assignment and active state without granting administrative bypass', () => {
  const admin = account('administrador', []);
  assert(getAdminLinks(admin).some(link => link.href === '/admin/usuarios'));
  assert(!getAdminLinks(admin).some(link => link.href === '/admin/libros'));
  assert(!canAccessAdminPage(admin, '/admin/carrousel_imagenes'));
  const writer = account('colaborador', ['libros']);
  assert(getAdminLinks(writer).some(link => link.href === '/admin/libros'));
  assert(!canAccessAdminPage(writer, '/admin/carrousel_imagenes'));
  assert(!canAccessAdminPage(writer, '/admin/usuarios'));
  for (const path of ['/admin/usuarios/nueva','/admin/usuarios/person']) {
    assert(canAccessAdminPage(admin,path));
    assert(!canAccessAdminPage(writer,path));
    assert(!canAccessAdminPage(account('director',['libros']),path));
    assert(!canAccessAdminPage({...admin,status:'disabled'},path));
  }
  assert(!canAccessAdminPage(admin,'/admin/usuarios/person/otro'));
  assert.deepEqual(getAdminLinks({ ...writer, status: 'disabled' }), []);
  assert.deepEqual(getAdminLinks(null), []);
  assert(!hasAccessRule(account('unknown', ['libros']), 'libros.access'));
});
