import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import net from 'node:net';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import bcrypt from 'bcrypt';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { memoryCouch } from '../helpers/memory-couch.js';
const listen = server => new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
async function unusedPort() { const server = net.createServer(); await listen(server); const port = server.address().port; await new Promise(resolve => server.close(resolve)); return port; }
test('HTTP: login, account invitation, scoped draft, private file, review and public publication', { timeout:30000 }, async () => {
  const admin = { id:'admin', email:'admin@example.com', name:'Administradora', status:'active', authVersion:1, assignments:[{ role:'administrador', modules:[], sections:[] },{ role:'director', modules:['gaceta','autores','libros','investigaciones','inicio'], sections:['*'] }] };
  const memory = memoryCouch({
    'users/security-policy':{ _id:'security-policy',_rev:'1-test',accounts:{ admin } },
    'users/admin':{ _id:'admin',_rev:'1-test',credentialVersion:'v1',passwordHash:await bcrypt.hash('Private admin password',4) },
    'investigadores/r':{_id:'r',_rev:'1-test',nombre:'Investigadora'},
    'cimu-gaceta-actualidad/private-news':{_id:'private-news',_rev:'1-test',titulo:'Contenido de otra sección',editorialStatus:'borrador',createdBy:'other'},
    'cimu-gaceta-autores/a':{ _id:'a',_rev:'1-test',nombre:'Autora',correo:'private@example.com',estado:'activo' },
  });
  const couchServer = http.createServer(async (req,res) => {
    try {
      let text = ''; for await (const chunk of req) text += chunk;
      const url = new URL(req.url,'http://localhost');
      const options = { params:Object.fromEntries(url.searchParams) };
      const method = req.method.toLowerCase();
      const result = await memory[method](url.pathname, ['put','post'].includes(method) ? JSON.parse(text || '{}') : options);
      res.writeHead(200,{ 'Content-Type':'application/json' }); res.end(JSON.stringify(result.data));
    } catch (error) { res.writeHead(error.response?.status || 500,{ 'Content-Type':'application/json' });res.end('{}'); }
  });
  await listen(couchServer);
  const port = await unusedPort(), origin = `http://127.0.0.1:${port}`;
  const privateDir = await fs.mkdtemp(path.join(os.tmpdir(),'cimu-assets-'));
  let output = '';
  const app = spawn(process.execPath,['dist/server/entry.mjs'], { env:{ ...process.env, HOST:'127.0.0.1', PORT:String(port), COUCHDB_URL:`http://127.0.0.1:${couchServer.address().port}`,COUCHDB_USER:'test',COUCHDB_PASSWORD:'test',PRIVATE_UPLOAD_DIR:privateDir },stdio:['ignore','pipe','pipe'] });
  app.stdout.on('data',chunk => { output += chunk; }); app.stderr.on('data',chunk => { output += chunk; });
  async function request(route, method = 'GET', body, cookie, extraHeaders = {}) {
    const response = await fetch(origin+route,{ method,redirect:'manual',headers:{ ...(method === 'GET' ? {} : { origin }), ...(body instanceof FormData ? {} : { 'Content-Type':'application/json' }), ...(cookie ? { cookie } : {}), ...extraHeaders }, body: body instanceof FormData ? body : body === undefined ? undefined : JSON.stringify(body) });
    const type = response.headers.get('content-type') || '';
    const data = type.includes('application/json') ? await response.json() : await response.text();
    return { response,data,cookie:response.headers.get('set-cookie')?.split(';')[0] };
  }
  try {
    let ready = false;
    for (let n=0;n<100;n++) { try { await fetch(origin+'/login'); ready=true;break; } catch { await delay(50); } }
    assert(ready,output);
    assert.equal((await request('/api/investigaciones/investigaciones','DELETE',{ id:'victim' })).response.status,401);
    assert.equal((await request('/api/libros/buscar?id=..%2Fusers%2Fadmin')).response.status,400);
    const csrf = await fetch(origin+'/api/login',{ method:'POST',headers:{'Content-Type':'application/json'},body:'{}' }); assert.equal(csrf.status,403);
    const logged = await request('/api/login','POST',{email:admin.email,password:'Private admin password'});
    assert.equal(logged.response.status,200,JSON.stringify(logged.data)); const adminCookie = logged.cookie;
    assert(adminCookie); assert(logged.response.headers.get('set-cookie').includes('HttpOnly'));
    const adminPage = await request('/admin/usuarios','GET',undefined,adminCookie); assert.equal(adminPage.response.status,200); assert(adminPage.data.includes('Cuentas y permisos'));
    assert.equal((await request('/admin/usuarios/nueva','GET',undefined,adminCookie)).response.status,200);
    const ownProfile=await request('/admin/cuenta','GET',undefined,adminCookie);
    assert.equal(ownProfile.response.status,200);assert(ownProfile.data.includes('Mis roles y accesos'));
    const dashboard = await request('/admin','GET',undefined,adminCookie);
    assert.equal(dashboard.response.status,200);
    assert(dashboard.data.includes('href="/admin/carrousel_imagenes"'));
    assert(dashboard.data.includes('href="/admin/libros"'));
    assert(dashboard.data.includes('Buscar aplicaciones'));
    const gacetaMenu=await request('/admin/gaceta','GET',undefined,adminCookie);
    assert(gacetaMenu.data.includes('Aplicaciones de Gaceta'));
    const oldHome = await request('/admin/inicio','GET',undefined,adminCookie);
    assert.equal(oldHome.response.status,302);
    assert.equal(oldHome.response.headers.get('location'),'/admin/carrousel_imagenes');
    const carousel = await request('/admin/carrousel_imagenes','GET',undefined,adminCookie);
    assert.equal(carousel.response.status,200);
    assert(carousel.data.includes('Imágenes del Carrusel'));
    const created = await request('/api/usuarios','POST',{ email:'writer@example.com',name:'Colaboradora',assignments:[{role:'colaborador',modules:['gaceta','libros','investigaciones'],sections:['opinion']}] },adminCookie);
    assert.equal(created.response.status,201,JSON.stringify(created.data));
    // Creating another account must never replace the admin session.
    const stillAdmin = await request('/api/cuenta/me','GET',undefined,adminCookie); assert.equal(stillAdmin.data.user.id,'admin');
    const writerId = created.data.user.id;
    const accountRecord=await request(`/admin/usuarios/${writerId}`,'GET',undefined,adminCookie);
    assert.equal(accountRecord.response.status,200);
    assert(accountRecord.data.includes('Roles y permisos'));
    assert(!accountRecord.data.includes('passwordHash'));
    assert(!accountRecord.data.includes('setupTokenHash'));
    assert.equal((await request('/admin/usuarios/missing','GET',undefined,adminCookie)).response.status,404);
    assert.equal((await request('/api/cuenta/activar','POST',{id:writerId,token:created.data.setupToken,password:'Private writer password'})).response.status,200);
    const writerLogin = await request('/api/login','POST',{email:'writer@example.com',password:'Private writer password'}); assert.equal(writerLogin.response.status,200); const writerCookie = writerLogin.cookie;
    assert.equal((await request('/api/usuarios','GET',undefined,writerCookie)).response.status,403);
    assert.equal((await request('/admin/usuarios','GET',undefined,writerCookie)).response.status,403);
    assert.equal((await request(`/admin/usuarios/${writerId}`,'GET',undefined,writerCookie)).response.status,403);
    assert.equal((await request('/admin/usuarios/nueva','GET',undefined,writerCookie)).response.status,403);
    assert.equal((await request('/admin/carrousel_imagenes','GET',undefined,writerCookie)).response.status,403);
    const writerDashboard = await request('/admin','GET',undefined,writerCookie);
    assert(writerDashboard.data.includes('href="/admin/libros"'));
    assert(!writerDashboard.data.includes('href="/admin/carrousel_imagenes"'));
    assert.equal((await request('/admin/gaceta/gestion_publicaciones','GET',undefined,writerCookie)).response.status,200);
    const upload = new FormData();upload.set('module','gaceta');upload.set('section','opinion');upload.set('foto',new File([Buffer.from([255,216,255,0])],'cover.jpg',{type:'image/jpeg'}));
    const uploaded = await request('/api/subir_imagen','POST',upload,writerCookie); assert.equal(uploaded.response.status,200,JSON.stringify(uploaded.data));
    const assetUrl = uploaded.data.url;
    assert.equal((await request(assetUrl)).response.status,404);
    const body = { titulo:'Prueba editorial',tipo:'opinion',contenido:'Contenido de prueba',categoria:'Opinión',fecha_publicacion:new Date().toISOString(),autor:{id:'a',nombre:'Autora'},imagenes:{portada:{url:assetUrl,descripcion:''},galeria:[]} };
    assert.equal((await request('/api/gaceta/crear?coleccion=actualidad','POST',{...body,tipo:'actualidad'},writerCookie)).response.status,403);
    const draft = await request('/api/gaceta/crear?coleccion=opinion','POST',body,writerCookie); assert.equal(draft.response.status,201,JSON.stringify(draft.data));
    const newsId = draft.data.id;
    const previewPath = `/admin/gaceta/publicacion/${newsId}?categoria=opinion`;
    assert.equal((await request(previewPath)).response.status,302);
    const preview = await request(previewPath,'GET',undefined,writerCookie);
    assert.equal(preview.response.status,200,JSON.stringify(preview.data));
    assert(preview.data.includes('aria-label="Proceso editorial"'));
    assert(preview.data.includes('aria-current="step"'));
    assert(preview.data.includes('Datos editoriales'));
    assert(!preview.data.includes('private@example.com'));
    const deniedPreview = await request('/admin/gaceta/publicacion/private-news?categoria=actualidad','GET',undefined,writerCookie);
    assert.equal(deniedPreview.response.status,403);
    assert(!JSON.stringify(deniedPreview.data).includes('Contenido de otra sección'));
    assert.equal((await request(`/api/gaceta/obtener?categoria=opinion&id=${newsId}`)).response.status,404);
    assert.equal((await request(assetUrl,'GET',undefined,writerCookie)).response.status,200);
    const transition = (rev,target,cookie) => request('/api/gaceta/transicion','POST',{ section:'opinion',id:newsId,rev,target,note:'' },cookie);
    assert.equal((await transition(draft.data.rev,'publicado',writerCookie)).response.status,403);
    const review = await transition(draft.data.rev,'en_revision',writerCookie); assert.equal(review.response.status,200);
    const approved = await transition(review.data.publication._rev,'aprobado',adminCookie); assert.equal(approved.response.status,200);
    const published = await transition(approved.data.publication._rev,'publicado',adminCookie); assert.equal(published.response.status,200);
    const directorView=await request(previewPath,'GET',undefined,adminCookie);
    assert(directorView.data.includes('aria-label="Acciones editoriales"'));
    assert(directorView.data.includes('Archivar publicación'));
    assert(directorView.data.includes('Retirar a borrador'));
    const publicDoc = await request(`/api/gaceta/obtener?categoria=opinion&id=${newsId}`); assert.equal(publicDoc.response.status,200); assert(!('createdBy' in publicDoc.data));
    assert.equal((await request(assetUrl)).response.status,200);
    const author = await request('/api/gaceta/obtener?categoria=autores&id=a'); assert(!('correo' in author.data)); assert.equal(author.data.publicaciones.length,1);
    assert.equal((await request(`/api/gaceta/actualizar?coleccion=opinion&id=${newsId}`,'PUT',{...body,_rev:published.data.publication._rev},writerCookie)).response.status,409);
    const edited = await request(`/api/gaceta/actualizar?coleccion=opinion&id=${newsId}`,'PUT',{...body,titulo:'Título actualizado en vivo',_rev:published.data.publication._rev},adminCookie);
    assert.equal(edited.response.status,200,JSON.stringify(edited.data));
    assert.equal((await request(`/api/gaceta/obtener?categoria=opinion&id=${newsId}`)).data.titulo,'Título actualizado en vivo');
    const archived = await transition(edited.data.rev,'archivado',adminCookie); assert.equal(archived.response.status,200);
    assert.equal((await request(assetUrl)).response.status,404);
    assert.equal((await request(previewPath,'GET',undefined,adminCookie)).response.status,200);
    const restored = await transition(archived.data.publication._rev,'publicado',adminCookie);
    assert.equal(restored.response.status,200,JSON.stringify(restored.data));
    assert.equal((await request(assetUrl)).response.status,200);
    const deletePath = `/api/gaceta/eliminar?coleccion=opinion&id=${newsId}`;
    const deleteBody = {rev:restored.data.publication._rev};
    assert.equal((await request(deletePath,'DELETE',deleteBody,writerCookie)).response.status,403);
    assert.equal((await request(deletePath,'DELETE',{rev:edited.data.rev},adminCookie)).response.status,409);
    const deleted = await request(deletePath,'DELETE',deleteBody,adminCookie);
    assert.equal(deleted.response.status,200,JSON.stringify(deleted.data));
    assert.equal((await request(`/api/gaceta/obtener?categoria=opinion&id=${newsId}`)).response.status,404);
    assert.equal((await request(assetUrl)).response.status,404);
    assert.equal((await request(previewPath,'GET',undefined,adminCookie)).response.status,404);

    for (const module of ['libros','investigaciones']) {
      const input = module === 'libros' ? {titulo:'Libro de prueba',fecha_publicacion:'2026-10-15',autores:[{id:'r',nombre:'Investigadora'}]} : {titulo:'Investigación de prueba',resumen:'Resumen',descripcion:'Descripción',programa:'juridico',investigadores:[{id:'r',nombre:'Investigadora'}],'Fecha de publicacion':'2026-10-15'};
      const catalogUpload = new FormData();catalogUpload.set('module',module);
      catalogUpload.set('foto',new File([Buffer.from([255,216,255,0])],'cover.jpg',{type:'image/jpeg'}));
      const catalogAsset = await request('/api/subir_imagen','POST',catalogUpload,writerCookie);assert.equal(catalogAsset.response.status,200,JSON.stringify(catalogAsset.data));
      input[module === 'libros' ? 'portada' : 'imagenURL'] = catalogAsset.data.url;
      assert.equal((await request(catalogAsset.data.url)).response.status,404);
      const route = module === 'libros' ? '/api/libros/crear' : '/api/investigaciones/investigaciones';
      const saved = await request(route,'POST',input,writerCookie);
      assert.equal(saved.response.status,201,JSON.stringify(saved.data));
      const savedId = module === 'libros' ? saved.data.id : saved.data.data.id;
      let rev = module === 'libros' ? saved.data.rev : saved.data.data.rev;
      const publicPath = module === 'libros' ? `/api/libros/buscar?id=${savedId}` : `/api/investigaciones/${savedId}`;
      assert.equal((await request(publicPath)).response.status,404);
      assert.equal((await request(module === 'libros' ? '/admin/libros' : '/admin/investigacion','GET',undefined,writerCookie)).response.status,200);
      for (const [target,cookie] of [['en_revision',writerCookie],['aprobado',adminCookie],['publicado',adminCookie]]) {
        const changed = await request('/api/editorial/transicion','POST',{module,id:savedId,rev,target,note:''},cookie);
        assert.equal(changed.response.status,200,JSON.stringify(changed.data));rev = changed.data.publication._rev;
      }
      assert.equal((await request(catalogAsset.data.url)).response.status,200);
      const visible = await request(publicPath);assert.equal(visible.response.status,200,JSON.stringify(visible.data));
      assert(!('createdBy' in (module === 'libros' ? visible.data : visible.data.data)));
      const changed = await request('/api/editorial/transicion','POST',{module,id:savedId,rev,target:'archivado',note:''},adminCookie);
      assert.equal(changed.response.status,200);assert.equal((await request(publicPath)).response.status,404);assert.equal((await request(catalogAsset.data.url)).response.status,404);
    }
    const revoked = await request(`/api/usuarios/${writerId}/acceso`,'POST',{action:'revoke'},adminCookie);assert.equal(revoked.response.status,200);
    assert.equal((await request('/api/cuenta/me','GET',undefined,writerCookie)).response.status,401);
  } finally {
    app.kill('SIGTERM');await new Promise(resolve => app.once('exit',resolve));
    await new Promise(resolve => couchServer.close(resolve));
    await fs.rm(privateDir,{recursive:true,force:true});
  }
});
