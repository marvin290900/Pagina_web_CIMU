import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import net from 'node:net';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { initializationCouch } from '../helpers/initialization-couch.js';
const listen = server => new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
async function port() { const server = net.createServer(); await listen(server); const value = server.address().port; await new Promise(resolve => server.close(resolve)); return value; }
test('HTTP: an empty installation starts with demo content, administrator login and non-destructive restarts', { timeout: 30000 }, async () => {
  const memory = initializationCouch();
  const couch = http.createServer(async (request, response) => {
    try {
      let body = ''; for await (const chunk of request) body += chunk;
      const url = new URL(request.url, 'http://localhost');
      const method = request.method.toLowerCase();
      const result = await memory[method](url.pathname, ['post','put'].includes(method) ? JSON.parse(body || '{}') : { params: Object.fromEntries(url.searchParams) });
      response.writeHead(200, { 'Content-Type': 'application/json' }); response.end(JSON.stringify(result.data));
    } catch (error) { response.writeHead(error.response?.status || 500, { 'Content-Type': 'application/json' }); response.end('{}'); }
  });
  await listen(couch);
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'cimu-first-start-'));
  const applicationPort = await port(); const origin = `http://127.0.0.1:${applicationPort}`;
  const startup = path.resolve('scripts/start.mjs');
  const password = 'Clave privada de prueba inicial 2026';
  let app; let output = '';
  async function stop() { if (!app || app.exitCode !== null) return; const exited = new Promise(resolve => app.once('exit', resolve)); app.kill('SIGTERM'); await exited; }
  async function start(overrides = {}) {
    output = '';
    app = spawn(process.execPath, [startup], { cwd: directory, env: { ...process.env, HOST: '127.0.0.1', PORT: String(applicationPort), COUCHDB_URL: `http://127.0.0.1:${couch.address().port}`, COUCHDB_USER: 'test', COUCHDB_PASSWORD: 'test', CIMU_BOOTSTRAP: 'true', CIMU_SEED_DEMO: 'true', CIMU_ADMIN_EMAIL: 'admin@example.test', CIMU_ADMIN_NAME: 'Administración de prueba', CIMU_ADMIN_PASSWORD: password, ...overrides }, stdio: ['ignore', 'pipe', 'pipe'] });
    app.stdout.on('data', chunk => { output += chunk; }); app.stderr.on('data', chunk => { output += chunk; });
    for (let n = 0; n < 120; n++) {
      try { if ((await fetch(origin + '/login')).ok) return; } catch {}
      if (app.exitCode !== null) assert.fail(output);
      await delay(50);
    }
    assert.fail('The initial application did not start: ' + output);
  }
  async function login(secret) {
    const response = await fetch(origin + '/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json', origin }, body: JSON.stringify({ email: 'admin@example.test', password: secret }) });
    return { response, body: await response.json(), cookie: response.headers.get('set-cookie')?.split(';')[0] };
  }
  try {
    await start();
    assert(!output.includes(password));
    const logged = await login(password);
    assert.equal(logged.response.status, 200, JSON.stringify(logged.body));
    assert.equal(logged.body.user.assignments.length, 2);
    assert(!JSON.stringify(logged.body).includes('passwordHash'));
    const accounts = await fetch(origin + '/api/usuarios', { headers: { cookie: logged.cookie } });
    assert.equal(accounts.status, 200);
    assert.equal((await accounts.json()).users.length, 1);
    const news = await (await fetch(origin + '/api/gaceta/obtener_recientes?categoria=actualidad')).json();
    assert.equal(news.rows.length, 1);
    assert.equal((await (await fetch(origin + '/api/gaceta/obtener_recientes?categoria=opinion')).json()).rows.length, 0);
    const books = await (await fetch(origin + '/api/libros/obtener-filtrados')).json();
    assert.equal(books.length, 1);
    const audit = await (await fetch(origin + '/api/admin/auditoria', { headers: { cookie: logged.cookie } })).json();
    assert(audit.events.some(event => event.action === 'system.bootstrap'));
    const file = await fs.readFile(path.join(directory, 'public/uploads/demo/cimu-demo.pdf'));
    assert.match(file.toString(), /^%PDF-1.4/);
    await stop();
    const originalCredential = structuredClone(memory.records.get(`users/${logged.body.user.id}`));
    memory.records.get('cimu-libros/demo-libro-publicado').titulo = 'Edición posterior de una persona';
    memory.records.delete('cimu-gaceta-opinion/demo-noticia-opinion');
    await start({ CIMU_ADMIN_EMAIL: '', CIMU_ADMIN_PASSWORD: '', CIMU_SEED_DEMO: 'false' });
    assert.equal((await login(password)).response.status, 200);
    assert.deepEqual(memory.records.get(`users/${logged.body.user.id}`), originalCredential);
    assert.equal(memory.records.get('cimu-libros/demo-libro-publicado').titulo, 'Edición posterior de una persona');
    assert(!memory.records.has('cimu-gaceta-opinion/demo-noticia-opinion'));
    assert.equal(Object.keys(memory.records.get('users/security-policy').accounts).length, 1);
  } finally { await stop(); await new Promise(resolve => couch.close(resolve)); await fs.rm(directory, { recursive: true, force: true }); }
});
