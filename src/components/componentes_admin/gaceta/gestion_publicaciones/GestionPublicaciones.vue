<script setup>
import { ref, computed, onMounted } from 'vue';
import ModalPublicacion from './componentes/ModalPublicacion.vue';
import { SECTIONS, can, canEditContent } from '../../../../lib/security/roles.js';
const user = ref(null), section = ref(''), publications = ref([]), busy = ref(false), error = ref(''), notice = ref('');
const dialog = ref(null), selected = ref({}), mode = ref('crear'), note = ref('');
const assignees = ref([]);
const labels = { actualidad: 'Actualidad', vida_universitaria: 'Vida universitaria', opinion: 'Opinión', memoria: 'Memoria', audiovisuales: 'Audiovisuales' };
const allowedSections = computed(() => SECTIONS.filter(s => user.value?.assignments.some(a => a.role !== 'administrador' && a.modules.includes('gaceta') && (a.sections.includes('*') || a.sections.includes(s)))));
const scope = computed(() => ({ section: section.value }));
async function api(url, options = {}) {
  const response = await fetch(url, { ...options, headers: { 'Content-Type': 'application/json' } });
  const data = await response.json();
  if (!response.ok) throw new Error(typeof data.error === 'string' ? data.error : 'Revisa los datos de la publicación');
  return data;
}
async function run(action) { busy.value = true; error.value = ''; try { await action(); } catch (e) { error.value = e.message; } finally { busy.value = false; } }
async function load() {
  if (!section.value) return;
  publications.value = (await api(`/api/gaceta/obtener?categoria=${section.value}&admin=1`)).rows.map(row => row.doc);
  assignees.value = can(user.value, 'gaceta.assign', scope.value) ? (await api(`/api/gaceta/responsables?section=${section.value}`)).users : [];
}
async function assign(doc, id) {
  await run(async () => {
    await api('/api/gaceta/asignar', { method: 'PATCH', body: JSON.stringify({ section: section.value, id: doc._id, rev: doc._rev, assignedTo: id ? [id] : [] }) });
    await load();
  });
}
function edit(doc) { selected.value = doc ? JSON.parse(JSON.stringify(doc)) : {}; mode.value = doc ? 'editar' : 'crear'; dialog.value.showModal(); }
async function save(input) {
  await run(async () => {
    const editing = mode.value === 'editar';
    const body = { ...input, tipo: section.value, _rev: selected.value._rev };
    await api(`/api/gaceta/${editing ? 'actualizar' : 'crear'}?coleccion=${section.value}${editing ? '&id=' + selected.value._id : ''}`, { method: editing ? 'PUT' : 'POST', body: JSON.stringify(body) });
    dialog.value.close(); notice.value = 'Borrador guardado. Envía a revisión cuando esté listo.'; await load();
  });
}
function transitions(doc) {
  const result = [];
  if (doc.editorialStatus === 'borrador' && canEditContent(user.value, 'gaceta', doc, section.value)) result.push(['en_revision', 'Enviar a revisión']);
  if (doc.editorialStatus === 'en_revision' && can(user.value, 'gaceta.review', scope.value)) result.push(['borrador', 'Pedir correcciones'], ['aprobado', 'Aprobar']);
  if (doc.editorialStatus === 'aprobado' && can(user.value, 'gaceta.publish', scope.value)) result.push(['publicado', 'Publicar']);
  if (['publicado', 'aprobado', 'archivado'].includes(doc.editorialStatus) && can(user.value, 'gaceta.unpublish', scope.value)) result.push(['borrador', 'Retirar a borrador']);
  if (doc.editorialStatus !== 'archivado' && can(user.value, 'gaceta.archive', scope.value)) result.push(['archivado', 'Archivar']);
  return result;
}
async function transition(doc, target) {
  if (doc.editorialStatus === 'publicado' && !confirm('La publicación dejará de estar visible. ¿Continuar?')) return;
  await run(async () => {
    await api('/api/gaceta/transicion', { method: 'POST', body: JSON.stringify({ section: section.value, id: doc._id, rev: doc._rev, target, note: note.value }) });
    note.value = ''; notice.value = 'Estado actualizado'; await load();
  });
}
onMounted(() => run(async () => { user.value = (await api('/api/cuenta/me')).user; section.value = allowedSections.value[0] || ''; await load(); }));
</script>
<template>
  <section class="max-w-6xl mx-auto px-4 space-y-5">
    <h1 class="text-3xl font-bold">Publicaciones de Gaceta</h1>
    <p>Guarda un borrador, envíalo a revisión y publica después de su aprobación. Para modificar una publicación visible, retírala primero a borrador.</p>
    <p v-if="error" role="alert" class="alert alert-error">{{ error }}</p><p v-if="notice" role="status" class="alert alert-success">{{ notice }}</p>
    <div class="flex flex-wrap gap-4 items-end">
      <label>Sección<select v-model="section" class="select block" :disabled="busy" @change="run(load)"><option v-for="s in allowedSections" :key="s" :value="s">{{ labels[s] }}</option></select></label>
      <button v-if="can(user, 'gaceta.create', scope)" class="btn btn-primary" :disabled="busy" @click="edit(null)">Nuevo borrador</button>
      <label class="grow">Observaciones para la próxima transición<input v-model="note" class="input block w-full" maxlength="2000" /></label>
    </div>
    <p v-if="busy" role="status">Procesando…</p>
    <p v-else-if="!publications.length">No hay publicaciones en esta sección para tu cuenta.</p>
    <div class="overflow-x-auto"><table v-if="publications.length" class="table"><thead><tr><th>Título y autor</th><th>Estado</th><th>Acciones</th></tr></thead>
      <tbody><tr v-for="doc in publications" :key="doc._id"><td><strong>{{ doc.titulo }}</strong><p>{{ doc.autor?.nombre }}</p><details v-if="doc.editorialHistory?.length"><summary>Historial</summary><p v-for="(event, index) in doc.editorialHistory" :key="index">{{ event.at }} · {{ event.to }} · {{ event.note }}</p></details></td><td>{{ doc.editorialStatus }}</td><td><div class="flex flex-wrap gap-2">
        <button v-if="doc.editorialStatus === 'borrador' && canEditContent(user, 'gaceta', doc, section)" class="btn btn-sm" :disabled="busy" @click="edit(doc)">Editar</button>
        <label v-if="can(user, 'gaceta.assign', scope)">Responsable<select class="select select-sm" :value="doc.assignedTo?.[0] || ''" :disabled="busy" @change="assign(doc, $event.target.value)"><option value="">Sin asignar</option><option v-for="person in assignees" :key="person.id" :value="person.id">{{ person.name }}</option></select></label>
        <details><summary class="cursor-pointer">Leer contenido</summary><p class="whitespace-pre-wrap max-w-xl">{{ doc.contenido }}</p></details>
        <button v-for="[target,label] in transitions(doc)" :key="target" class="btn btn-sm" :disabled="busy" @click="transition(doc,target)">{{ label }}</button>
        <a v-if="doc.editorialStatus === 'publicado'" class="btn btn-sm" :href="`/gaceta/${doc._id}?categoria=${section}`" target="_blank" rel="noopener">Ver publicación</a>
      </div></td></tr></tbody>
    </table></div>
    <dialog ref="dialog" class="modal"><ModalPublicacion :publicacion="selected" :modo="mode" :section="section" @cerrar="dialog.close()" @guardar="save" /></dialog>
  </section>
</template>
