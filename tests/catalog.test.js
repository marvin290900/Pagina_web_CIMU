import test from 'node:test';
import assert from 'node:assert/strict';
import { couch } from '../src/lib/couchDB.js';
import { memoryCouch } from './helpers/memory-couch.js';
import { saveCatalog,listCatalog,transitionCatalog,researcherPublications } from '../src/lib/security/catalog.js';
import { bookSchema, researchInput, parseResearch } from '../src/lib/security/catalog.js';
import { idSchema } from '../src/lib/security/validation.js';
const person = role => ({id:role,status:'active',assignments:[{role,modules:['libros','investigaciones'],sections:[]}]});
function install(db) { const saved={};for(const key of ['get','put','post','delete']){saved[key]=couch[key];couch[key]=db[key];}return()=>Object.assign(couch,saved); }
for (const module of ['libros','investigaciones']) test(`${module}: drafts, assigned editing, review, publication and public profiles`,async()=>{
  const db=memoryCouch({'investigadores/a':{_id:'a',_rev:'1-test',nombre:'Investigadora'}}),restore=install(db);
  try {
    const input=module==='libros'?{titulo:'Libro',fecha_publicacion:'2026-10-15',autores:[{id:'a',nombre:'Investigadora'}]}:{titulo:'Investigación',resumen:'Resumen',descripcion:'Descripción',programa:'juridico',investigadores:[{id:'a',nombre:'Investigadora'}],'Fecha de publicacion':'2026-10-15'};
    const writer=person('colaborador'),editor=person('editor'),director=person('director');
    let doc=await saveCatalog(module,{...input,editorialStatus:'publicado',createdBy:'someone-else'},writer);
    assert.equal(doc.editorialStatus,'borrador');assert.equal(doc.createdBy,writer.id);
    assert.equal((await listCatalog(module)).length,0);
    assert.equal((await listCatalog(module,writer,true)).length,1);
    await assert.rejects(saveCatalog(module,{...input,_rev:doc._rev},editor,doc._id),/No puedes editar/);
    doc=await transitionCatalog(module,doc._id,doc._rev,'en_revision','Lista',writer);
    await assert.rejects(transitionCatalog(module,doc._id,doc._rev,'publicado','',writer),/no permitida/);
    doc=await transitionCatalog(module,doc._id,doc._rev,'aprobado','Revisada',editor);
    doc=await transitionCatalog(module,doc._id,doc._rev,'publicado','Publicar',director);
    assert.equal((await listCatalog(module)).length,1);
    assert(!('_rev' in (await listCatalog(module))[0]));
    let profile=(await researcherPublications([{_id:'a'}]))[0];
    assert.equal(module==='libros'?profile.libros.length:profile.proyectos_investigacion.length,1);
    await assert.rejects(saveCatalog(module,{...input,_rev:doc._rev},director,doc._id),/borrador/);
    doc=await transitionCatalog(module,doc._id,doc._rev,'archivado','Retirar',director);
    assert.equal((await listCatalog(module)).length,0);
    profile=(await researcherPublications([{_id:'a'}]))[0];
    assert.equal(module==='libros'?profile.libros.length:profile.proyectos_investigacion.length,0);
  }finally{restore();}
});

test('catalog researcher references accept legacy email IDs but record IDs stay strict', async()=>{
  const id='Author.Legacy+books@example.test';
  assert(!idSchema.safeParse(id).success);
  const db=memoryCouch({[`investigadores/${id}`]:{_id:id,_rev:'1-test',nombre:'Nombre canónico'}}),restore=install(db);
  try {
    const input={_id:'',titulo:'Libro con autor histórico',fecha_publicacion:'2026-10-23',autores:[{id,nombre:'Nombre enviado'}]};
    let book=await saveCatalog('libros',input,person('colaborador'));
    assert.equal(book.autores[0].id,id);
    assert.equal(book.autores[0].nombre,'Nombre canónico');
    assert.match(book._id,/^[a-f0-9-]{36}$/);
    book=await saveCatalog('libros',{...input,titulo:'Libro corregido',_rev:book._rev},person('colaborador'),book._id);
    assert.equal(book.autores[0].id,id);
    const research={titulo:'Investigación',resumen:'Resumen',descripcion:'Descripción',programa:'juridico',investigadores:[{id,nombre:'Autora'}],'Fecha de publicacion':'2026-10-23'};
    assert.equal(parseResearch(research).investigadores[0].id,id);
    for(const unsafe of ['../users/admin','author%2Fusers@example.test','author@example.test?x=y']){
      assert(!bookSchema.safeParse({...input,autores:[{id:unsafe,nombre:'Autora'}]}).success);
      assert(!researchInput.safeParse({...research,investigadores:[{id:unsafe,nombre:'Autora'}]}).success);
    }
  } finally {restore();}
});
