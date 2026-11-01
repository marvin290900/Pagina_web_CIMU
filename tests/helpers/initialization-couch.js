import { memoryCouch } from './memory-couch.js';
// Emulates database creation and indexes as well as revision-aware documents.
export function initializationCouch(seed = {}) {
  const memory = memoryCouch(seed);
  const databases = new Set(Object.keys(seed).map(key => key.split('/')[0]));
  const indexes = new Set();
  const fail = status => { throw Object.assign(new Error(`Couch ${status}`), { response: { status } }); };
  return {
    records: memory.records, databases, indexes,
    async get(path, options) {
      if (path === '/') return { data: { couchdb: 'Welcome' } };
      const database = path.replace(/^\//, '').split('/')[0];
      if (!databases.has(database)) fail(404);
      return memory.get(path, options);
    },
    async put(path, value) {
      const key = path.replace(/^\//, '');
      if (!key.includes('/')) { if (databases.has(key)) fail(412); databases.add(key); return { data: { ok: true } }; }
      if (!databases.has(key.split('/')[0])) fail(404);
      return memory.put(path, value);
    },
    async post(path, value) {
      if (path.endsWith('/_index')) { indexes.add(`${path}:${value.name}`); return { data: { result: 'created' } }; }
      return memory.post(path, value);
    },
    delete: memory.delete,
  };
}
