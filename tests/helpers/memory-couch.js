// A revision-aware, in-memory CouchDB double. No test performs network requests.
export function memoryCouch(seed = {}) {
  const records = new Map(Object.entries(seed).map(([key,value]) => [key, structuredClone(value)]));
  const fail = status => { throw Object.assign(new Error(`Couch ${status}`), { response: { status } }); };
  const clone = value => structuredClone(value);
  const keyFor = path => decodeURIComponent(path.replace(/^\//, '').split('?')[0]);
  const db = {
    records,
    async get(path, options = {}) {
      const key = keyFor(path);
      if (key.endsWith('/_all_docs')) {
        const prefix = key.replace('_all_docs', '');
        let rows = [...records.entries()].filter(([k]) => k.startsWith(prefix)).sort(([a],[b]) => a.localeCompare(b)).map(([k,doc]) => ({ id: k.slice(prefix.length), doc: clone(doc) }));
        if (options.params?.startkey) { const start = JSON.parse(options.params.startkey); rows = rows.filter(row => row.id > start); }
        return { data: { rows: rows.slice(0, options.params?.limit || 100000) } };
      }
      if (!records.has(key)) fail(404);
      return { data: clone(records.get(key)) };
    },
    async put(path, value) {
      const key = keyFor(path), old = records.get(key);
      if (old ? old._rev !== value._rev : !!value._rev) fail(409);
      const rev = `${old ? Number(old._rev.split('-')[0]) + 1 : 1}-test`;
      records.set(key, { ...clone(value), _rev: rev });
      return { status: 201, data: { id: key.split('/').at(-1), rev } };
    },
    async delete(path, options = {}) {
      const key = keyFor(path), old = records.get(key);
      if (!old) fail(404);
      if (options.params?.rev !== old._rev) fail(409);
      records.delete(key); return { data: { ok: true } };
    },
    async post(path, body) {
      const key = keyFor(path);
      if (key.endsWith('/_find')) {
        const prefix = key.replace('_find', '');
        const docs = [...records.entries()].filter(([k]) => k.startsWith(prefix)).map(([,doc]) => doc).filter(doc => Object.entries(body.selector).every(([field,value]) => typeof value === 'object' ? (value.$gt === undefined || doc[field] > value.$gt) : doc[field] === value));
        return { data: { docs: clone(docs.slice(0, body.limit || 100000)) } };
      }
      fail(400);
    },
  };
  return db;
}
