import test from 'node:test';
import assert from 'node:assert/strict';
import { can, canReadContent, canEditContent, MODULES } from '../src/lib/security/roles.js';
import { nextNewsState, publicNews, publicAuthor, isPublished } from '../src/lib/security/editorial.js';
import { apiRule } from '../src/lib/security/routes.js';
import { assertSameOrigin, safeRedirect } from '../src/lib/security/http.js';
import { accountSchema, passwordSchema } from '../src/lib/security/validation.js';
const person = (role, modules = ['gaceta'], sections = ['opinion']) => ({ id: role, status: 'active', assignments: [{ role, modules, sections }] });
test('roles restrict section, action, owner and unknown permissions', () => {
  const collaborator = person('colaborador');
  assert(can(collaborator, 'gaceta.create', { section: 'opinion' }));
  assert(!can(collaborator, 'gaceta.create', { section: 'actualidad' }));
  assert(!can(collaborator, 'gaceta.publish', { section: 'opinion' }));
  assert(!can(collaborator, 'users.create'));
  assert(!can(collaborator, 'gaceta.unknown'));
  assert(canEditContent(collaborator, 'gaceta', { createdBy: collaborator.id }, 'opinion'));
  assert(!canEditContent(collaborator, 'gaceta', { createdBy: 'other' }, 'opinion'));
  assert(!canReadContent(collaborator, 'gaceta', { createdBy: 'other' }, 'opinion'));
  assert(!can({ ...collaborator, status: 'disabled' }, 'gaceta.create', { section: 'opinion' }));
});
test('permissions and scope cannot be combined across assignments', () => {
  const user = { id: 'x', status: 'active', assignments: [...person('director', ['libros']).assignments, ...person('consulta').assignments] };
  assert(!can(user, 'gaceta.publish', { section: 'opinion' }));
  assert(can(user, 'gaceta.read_internal', { section: 'opinion' }));
  assert(can(user, 'libros.manage'));
});
test('administration never confers editorial access', () => {
  const admin = person('administrador', [], []);
  assert(can(admin, 'users.assign_roles'));
  assert(!can(admin, 'gaceta.publish', { section: 'opinion' }));
  assert(!can(admin, 'libros.manage'));
  const director = person('director', MODULES, ['*']);
  assert(!can(director, 'users.update'));
  assert(can(director, 'gaceta.publish', { section: 'memoria' }));
});
test('review and publication cannot be skipped', () => {
  const collaborator = person('colaborador'), editor = person('editor'), director = person('director');
  const draft = { createdBy: 'colaborador', editorialStatus: 'borrador' };
  assert.equal(nextNewsState(collaborator, draft, 'opinion', 'en_revision'), 'en_revision');
  assert.throws(() => nextNewsState(collaborator, draft, 'opinion', 'publicado'));
  assert.equal(nextNewsState(editor, { ...draft, editorialStatus: 'en_revision' }, 'opinion', 'aprobado'), 'aprobado');
  assert.throws(() => nextNewsState(editor, { ...draft, editorialStatus: 'aprobado' }, 'opinion', 'publicado'));
  assert.equal(nextNewsState(director, { ...draft, editorialStatus: 'aprobado' }, 'opinion', 'publicado'), 'publicado');
  assert.throws(() => nextNewsState(director, draft, 'actualidad', 'en_revision'));
});
test('public responses exclude internal state, email and revision', () => {
  assert(!isPublished({ estado: 'activo' }));
  assert(!isPublished({ editorialStatus: 'borrador' }));
  assert(isPublished({ editorialStatus: 'publicado' }));
  const news = publicNews({ _id:'n', _rev:'1-x', editorialStatus:'publicado', createdBy:'secret', editorialHistory:['internal'], titulo:'Título' });
  assert(!('_rev' in news)); assert(!('createdBy' in news)); assert(!('editorialHistory' in news));
  assert(!('correo' in publicAuthor({ nombre:'Autor', correo:'private@example.com' })));
});
test('API public exceptions are exact and read-only', () => {
  assert.equal(apiRule('GET','/api/investigaciones/investigaciones'), 'public');
  for (const method of ['POST','PUT','DELETE']) assert.equal(apiRule(method,'/api/investigaciones/investigaciones'), 'authenticated');
  assert.equal(apiRule('GET','/api/gaceta/obtener_hack'), null);
  assert.equal(apiRule('POST','/api/gaceta/obtener'), null);
  assert.equal(apiRule('GET','/api/gaceta/desactivar_autor'), null);
  assert.equal(apiRule('POST','/api/register'), 'users.create');
  assert.equal(apiRule('GET','/api/usuarios/anything'), null);
});
test('mutations require an exact same-origin and redirects stay internal', () => {
  assert.doesNotThrow(() => assertSameOrigin(new Request('https://cimu.test/api/login', { method:'POST', headers:{ origin:'https://cimu.test' } })));
  for (const headers of [{}, { origin:'https://evil.test' }, { origin:'https://cimu.test', 'sec-fetch-site':'cross-site' }]) assert.throws(() => assertSameOrigin(new Request('https://cimu.test/api/login', { method:'POST', headers })));
  for (const value of ['//evil.test','https://evil.test','/admin\\evil.test','/administrator']) assert.equal(safeRedirect(value), '/admin');
  assert.equal(safeRedirect('/admin/gaceta'), '/admin/gaceta');
});
test('password length, email normalization and role assignment validation', () => {
  assert(!passwordSchema.safeParse('short').success);
  assert(!passwordSchema.safeParse('ñ'.repeat(40)).success);
  assert(passwordSchema.safeParse('Una frase larga y privada').success);
  const parsed = accountSchema.parse({ email:'  USER@EXAMPLE.COM ', name:'Persona', assignments:[{ role:'colaborador', modules:['gaceta'], sections:['opinion'] }] });
  assert.equal(parsed.email, 'user@example.com');
  assert(!accountSchema.safeParse({ ...parsed, assignments:[{ role:'colaborador', modules:['gaceta'], sections:[] }] }).success);
});
