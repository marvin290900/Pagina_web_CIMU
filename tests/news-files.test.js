import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { couch } from '../src/lib/couchDB.js';
import { memoryCouch } from './helpers/memory-couch.js';
import { saveNews, transitionNews, listNews } from '../src/lib/security/newsStore.js';
import { newsAssetIds, imageType } from '../src/lib/security/uploads.js';
import { safePublicPath } from '../src/lib/security/files.js';
import { validateApiInput, validateDocumentIds } from '../src/lib/security/requestValidation.js';
const person = (role,id = role,section = 'opinion') => ({ id, status:'active', assignments:[{ role, modules:['gaceta'], sections:[section] }] });
function install(db) { const original = {}; for (const m of ['get','put','post','delete']) { original[m] = couch[m]; couch[m] = db[m]; } return () => Object.assign(couch,original); }
test('Gaceta end-to-end ownership, review, published visibility and edit locking', async () => {
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
    await assert.rejects(saveNews('opinion',{ ...input,_rev:doc._rev },director,doc._id), /borrador/);
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
