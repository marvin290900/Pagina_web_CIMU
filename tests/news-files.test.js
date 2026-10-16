import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { couch } from '../src/lib/couchDB.js';
import { memoryCouch } from './helpers/memory-couch.js';
import { saveNews, transitionNews, listNews, deleteNews } from '../src/lib/security/newsStore.js';
import { newsAssetIds, imageType } from '../src/lib/security/uploads.js';
import { safePublicPath } from '../src/lib/security/files.js';
import { validateApiInput, validateDocumentIds } from '../src/lib/security/requestValidation.js';
const person = (role,id = role,section = 'opinion') => ({ id, status:'active', assignments:[{ role, modules:['gaceta'], sections:[section] }] });
function install(db) { const original = {}; for (const m of ['get','put','post','delete']) { original[m] = couch[m]; couch[m] = db[m]; } return () => Object.assign(couch,original); }
test('Gaceta ownership, review and direct updates preserve publication state', async () => {
  const db = memoryCouch({ 'cimu-gaceta-autores/a': { _id:'a', _rev:'1-test', nombre:'Autora', correo:'secret@example.com', estado:'activo' } });
  const restore = install(db);
  try {
    const author = person('colaborador'), editor = person('editor'), director = person('director');
    const input = { titulo:'Noticia', tipo:'opinion', contenido:'Texto de opinión', categoria:'Opinión', fecha_publicacion:new Date().toISOString(), autor:{ id:'a',nombre:'Nombre manipulado' }, imagenes:{ portada:{ url:'https://example.com/image.png',descripcion:'' }, galeria:[] } };
    let doc = await saveNews('opinion', { ...input, createdBy:'victim', editorialStatus:'publicado' },author);
    assert.equal(doc.createdBy,author.id); assert.equal(doc.editorialStatus,'borrador'); assert.equal(doc.autor.nombre,'Autora');
    assert.equal((await listNews('opinion',null,false)).length,0);
    assert.equal((await listNews('opinion',author,true)).length,1);
    assert.equal((await listNews('opinion',person('colaborador','other'),true)).length,0);
    await assert.rejects(saveNews('opinion',{ ...input,_rev:doc._rev },person('colaborador','other'),doc._id), /No puedes editar/);
    await assert.rejects(saveNews('actualidad',{ ...input,tipo:'actualidad' },author), /No puedes crear/);
    await assert.rejects(saveNews('opinion',{ ...input,_rev:'old' },author,doc._id), /cambió/);
    doc = await transitionNews('opinion',doc._id,doc._rev,'en_revision','Lista',author);
    await assert.rejects(transitionNews('opinion',doc._id,doc._rev,'publicado','',author), /no permitida/);
    doc = await transitionNews('opinion',doc._id,doc._rev,'aprobado','Revisada',editor);
    doc = await transitionNews('opinion',doc._id,doc._rev,'publicado','Aprobada',director);
    assert.equal((await listNews('opinion',null,false)).length,1);
    await assert.rejects(saveNews('opinion',{ ...input,_rev:doc._rev },editor,doc._id), /No puedes editar/);
    doc = await saveNews('opinion',{ ...input,titulo:'Título corregido',_rev:doc._rev },director,doc._id);
    assert.equal(doc.editorialStatus,'publicado');
    assert.equal(doc.estado,'activo');
    assert.equal(doc.createdBy,author.id);
    assert.equal((await listNews('opinion',null,false))[0].titulo,'Título corregido');
    doc = await transitionNews('opinion',doc._id,doc._rev,'borrador','Corregir',director);
    assert.equal((await listNews('opinion',null,false)).length,0);
    assert.equal(doc.editorialHistory.length,4);
  } finally { restore(); }
});
test('private asset discovery covers cover, gallery and markdown', () => {
  const a = randomUUID(), b = randomUUID(), c = randomUUID();
  const ids = newsAssetIds({ imagenes:{ portada:{ url:`/api/archivos/${a}` },galeria:[{ url:`/api/archivos/${b}` }] },contenido:`![image](/api/archivos/${c})` });
  assert.deepEqual(ids,[a,b,c]);
  assert.throws(() => imageType(Buffer.from('<svg onload=alert(1)>')), /no permitido/);
  assert.deepEqual(imageType(Buffer.from([255,216,255,0])), ['.jpg','image/jpeg']);
});
test('file paths cannot escape their authorized module', () => {
  assert(safePublicPath('/uploads/libros/nonexistent.pdf',['libros']).endsWith('/public/uploads/libros/nonexistent.pdf'));
  for (const value of ['/uploads/libros/../../.env', '/uploads/libros/%2e%2e/%2e%2e/.env','/uploads/carrousel/picture.jpg','https://evil.test/uploads/libros/a.pdf']) assert.throws(() => safePublicPath(value,['libros']));
});
test('legacy endpoint identifiers cannot traverse CouchDB databases', async () => {
  for (const id of ['../users/security-policy','%2e%2e%2fusers','_design/security','a?x=y','a/b']) {
    assert.throws(() => validateDocumentIds({ nested:{ _id:id } }));
    await assert.rejects(validateApiInput(new Request('http://localhost/api/libros/buscar?id=' + encodeURIComponent(id))));
  }
  assert.doesNotThrow(() => validateDocumentIds({ id:'colecciones', investigadores:[{ id:randomUUID() }] }));
});

test('Gaceta archive, direct update, restore and delete enforce scope and revisions', async () => {
  const db = memoryCouch({
    'cimu-gaceta-autores/a': { _id:'a', _rev:'1-test', nombre:'Autora', estado:'inactivo' },
    'cimu-gaceta-opinion/n': { _id:'n', _rev:'1-test', titulo:'Noticia', tipo:'opinion', editorialStatus:'publicado', estado:'activo', createdBy:null, fecha_publicacion:'2026-01-01', autor:{id:'a',nombre:'Autora'}, contenido:'Texto', categoria:'Opinión', imagenes:{portada:{url:'',descripcion:''},galeria:[]} },
  });
  const restore = install(db);
  try {
    const director = person('director'), writer = person('colaborador'), otherDirector = person('director','other','actualidad');
    let doc = db.records.get('cimu-gaceta-opinion/n');
    await assert.rejects(deleteNews('opinion','n',doc._rev,writer), /No puedes eliminar/);
    await assert.rejects(deleteNews('opinion','n',doc._rev,otherDirector), /No puedes eliminar/);
    await assert.rejects(deleteNews('opinion','n','old',director), /cambió/);
    assert(db.records.has('cimu-gaceta-opinion/n'));
    doc = await transitionNews('opinion','n',doc._rev,'archivado','Ocultar',director);
    assert.equal(doc.archivedFrom,'publicado');
    assert.equal((await listNews('opinion',null,false)).length,0);
    doc = await saveNews('opinion',{ ...doc,titulo:'Noticia corregida' },director,'n');
    assert.equal(doc.editorialStatus,'archivado');assert.equal(doc.createdBy,null);
    assert.equal((await listNews('opinion',null,false)).length,0);
    doc = await transitionNews('opinion','n',doc._rev,'publicado','Mostrar',director);
    assert.equal(doc.fecha_publicacion,'2026-01-01');
    assert.equal((await listNews('opinion',null,false)).length,1);
    await deleteNews('opinion','n',doc._rev,director);
    assert(!db.records.has('cimu-gaceta-opinion/n'));
    assert.equal((await listNews('opinion',director,true)).length,0);
    assert([...db.records.values()].some(record => record.action === 'gaceta.delete'));
    await assert.rejects(deleteNews('autores','a','1-test',director));
  } finally { restore(); }
});
