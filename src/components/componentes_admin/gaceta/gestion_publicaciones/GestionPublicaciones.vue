<script setup>
import { ref, computed, onMounted, defineAsyncComponent } from 'vue';
import { can } from '../../../../lib/security/roles.js';
import { NEWS_SECTIONS, PUBLICATION_STATES, stateLabel, dateLabel, newsSectionsFor, newsRecordUrl, adminRequest } from '../../../../lib/publicationUi.js';
import CargandoEditor from '../../editorial/CargandoEditor.vue';
const ModalPublicacion = defineAsyncComponent({ loader: () => import('./componentes/ModalPublicacion.vue'), loadingComponent: CargandoEditor, delay: 100 });
const user = ref(null), rows = ref([]), loading = ref(true), saving = ref(false), error = ref('');
const section = ref(''), status = ref(''), search = ref(''), page = ref(1), pageSize = 15;
const picker = ref(null), formDialog = ref(null), createSection = ref(''), formMounted = ref(false);
const sections = computed(() => newsSectionsFor(user.value));
const createSections = computed(() => sections.value.filter(s => can(user.value, 'gaceta.create', { section: s })));
const totals = computed(() => ({ all: rows.value.length, preparation: rows.value.filter(d => ['borrador','en_revision','aprobado'].includes(d.editorialStatus)).length, published: rows.value.filter(d => d.editorialStatus === 'publicado').length, archived: rows.value.filter(d => d.editorialStatus === 'archivado').length }));
const filtered = computed(() => {
  const query = search.value.trim().toLocaleLowerCase('es');
  return rows.value.filter(doc => (!section.value || doc.sectionKey === section.value) && (!status.value || doc.editorialStatus === status.value) && (!query || [doc.titulo, doc.autor?.nombre, NEWS_SECTIONS[doc.sectionKey]].some(value => value?.toLocaleLowerCase('es').includes(query))));
});
const pages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)));
const currentPage = computed(() => Math.min(page.value, pages.value));
const visibleRows = computed(() => filtered.value.slice((currentPage.value - 1) * pageSize, currentPage.value * pageSize));
const first = computed(() => filtered.value.length ? (currentPage.value - 1) * pageSize + 1 : 0);
function resetPage() { page.value = 1; }
async function load() {
  loading.value = true; error.value = '';
  try {
    if (!user.value) user.value = (await adminRequest('/api/cuenta/me')).user;
    const results = await Promise.allSettled(sections.value.map(async s => ({ section: s, data: await adminRequest(`/api/gaceta/obtener?categoria=${s}&admin=1`) })));
    rows.value = results.filter(r => r.status === 'fulfilled').flatMap(r => r.value.data.rows.map(({ doc }) => ({ ...doc, sectionKey: r.value.section })));
    rows.value.sort((a,b) => (Date.parse(b.updatedAt || b.fecha_publicacion) || 0) - (Date.parse(a.updatedAt || a.fecha_publicacion) || 0));
    const failures = results.map((r,i) => r.status === 'rejected' ? NEWS_SECTIONS[sections.value[i]] : null).filter(Boolean);
    if (failures.length) error.value = `No se pudieron cargar: ${failures.join(', ')}. Puedes intentar actualizar la lista.`;
  } catch(e) { error.value = e.message; }
  finally { loading.value = false; }
}
function openCreate() {
  createSection.value = createSections.value.includes(section.value) ? section.value : createSections.value[0] || '';
  if (!createSection.value) return;
  if (section.value || createSections.value.length === 1) startForm(); else picker.value.showModal();
}
function startForm() { picker.value?.close(); formMounted.value = true; error.value = ''; formDialog.value.showModal(); }
function openRow(event, doc) {
  if (event.target.closest('a,button,input,select')) return;
  if (event.ctrlKey || event.metaKey) window.open(newsRecordUrl(doc), '_blank', 'noopener'); else location.href = newsRecordUrl(doc);
}
async function save(input) {
  saving.value = true; error.value = '';
  try {
    const data = await adminRequest(`/api/gaceta/crear?coleccion=${createSection.value}`, { method: 'POST', body: JSON.stringify({ ...input, tipo: createSection.value }) });
    location.href = newsRecordUrl({ _id: data.id }, createSection.value);
  } catch(e) { error.value = e.message; saving.value = false; }
}
onMounted(load);
</script>
<template>
  <section class="editorial-workspace">
    <div class="workspace-heading">
      <div><p class="eyebrow">GACETA MULTIDISCIPLINARIA</p><h1>Publicaciones</h1><p class="subtle">Un espacio para preparar, revisar y compartir las historias de la comunidad.</p></div>
      <button v-if="createSections.length" class="ui-button primary" :disabled="loading || saving" @click="openCreate"><span aria-hidden="true">＋</span> Nueva publicación</button>
    </div>
    <div class="metric-grid" aria-label="Resumen de publicaciones">
      <div><span>Total de publicaciones</span><strong>{{ loading ? '—' : totals.all }}</strong></div>
      <div><span><i class="metric-dot amber"></i> En preparación</span><strong>{{ loading ? '—' : totals.preparation }}</strong></div>
      <div><span><i class="metric-dot green"></i> Publicadas</span><strong>{{ loading ? '—' : totals.published }}</strong></div>
      <div><span><i class="metric-dot gray"></i> Archivadas</span><strong>{{ loading ? '—' : totals.archived }}</strong></div>
    </div>
    <p v-if="error && !formDialog?.open" class="ui-alert error" role="alert">{{ error }}</p>
    <div class="workspace-sheet">
      <div class="list-toolbar">
        <label class="search-field"><span aria-hidden="true">⌕</span><input v-model="search" type="search" aria-label="Buscar publicaciones" placeholder="Buscar por título, autor o sección…" @input="resetPage" /></label>
        <div class="list-filters">
          <label><span class="sr-only">Sección</span><select v-model="section" class="ui-control" @change="resetPage"><option value="">Todas las secciones</option><option v-for="s in sections" :key="s" :value="s">{{ NEWS_SECTIONS[s] }}</option></select></label>
          <label><span class="sr-only">Estado</span><select v-model="status" class="ui-control" @change="resetPage"><option value="">Todos los estados</option><option v-for="s in PUBLICATION_STATES" :key="s.value" :value="s.value">{{ s.label }}</option><option value="archivado">Archivadas</option></select></label>
          <button class="ui-button quiet" :disabled="loading" @click="load" aria-label="Actualizar publicaciones">↻ <span>Actualizar</span></button>
        </div>
      </div>
      <div class="table-scroll" :aria-busy="loading">
        <table class="record-table"><thead><tr><th>Publicación</th><th>Sección</th><th>Autor</th><th>Estado</th><th>Actualización</th><th class="numeric">Vistas</th><th><span class="sr-only">Abrir</span></th></tr></thead>
          <tbody v-if="loading"><tr v-for="n in 5" :key="n"><td colspan="7"><div class="loading-line" :style="{width: `${65 + n * 5}%`}"></div></td></tr></tbody>
          <tbody v-else><tr v-for="doc in visibleRows" :key="doc.sectionKey + doc._id" class="clickable-row" @click="openRow($event,doc)">
            <td><div class="publication-cell"><img v-if="doc.imagenes?.portada?.url" :src="doc.imagenes.portada.url" alt="" loading="lazy" class="list-cover" /><span v-else class="list-cover placeholder" aria-hidden="true">▤</span><a :href="newsRecordUrl(doc)" class="record-title">{{ doc.titulo || 'Sin título' }}</a></div></td>
            <td><span class="section-label">{{ NEWS_SECTIONS[doc.sectionKey] }}</span></td><td>{{ doc.autor?.nombre || 'Sin autor' }}</td>
            <td><span class="state-badge" :data-state="doc.editorialStatus">{{ stateLabel(doc.editorialStatus) }}</span></td><td class="nowrap">{{ dateLabel(doc.updatedAt || doc.fecha_publicacion) }}</td><td class="numeric">{{ new Intl.NumberFormat('es-SV').format(doc.visitas || 0) }}</td><td aria-hidden="true" class="row-arrow">↗</td>
          </tr></tbody>
        </table>
      </div>
      <div v-if="!loading && !filtered.length" class="empty-state"><span class="empty-symbol" aria-hidden="true">▤</span><h2>{{ rows.length ? 'No encontramos coincidencias' : 'Aquí comienzan tus próximas historias' }}</h2><p>{{ rows.length ? 'Prueba otro término o cambia los filtros.' : 'Las publicaciones a las que tienes acceso aparecerán en esta lista.' }}</p><button v-if="rows.length" class="ui-button" @click="search='';section='';status='';resetPage()">Limpiar filtros</button></div>
      <footer class="table-footer"><span>{{ first }}–{{ Math.min(currentPage * pageSize, filtered.length) }} de {{ filtered.length }} publicaciones</span><div class="pagination"><button class="ui-button quiet" aria-label="Página anterior" :disabled="currentPage <= 1 || loading" @click="page=currentPage-1">←</button><span>{{ currentPage }} / {{ pages }}</span><button class="ui-button quiet" aria-label="Página siguiente" :disabled="currentPage >= pages || loading" @click="page=currentPage+1">→</button></div></footer>
    </div>
    <dialog ref="picker" class="modal editorial-modal" aria-labelledby="choose-section-title"><div class="modal-box ui-dialog"><p class="eyebrow">NUEVA PUBLICACIÓN</p><h2 id="choose-section-title">¿En qué sección quieres escribir?</h2><label class="field-label">Sección<select v-model="createSection" class="ui-control"><option v-for="s in createSections" :key="s" :value="s">{{ NEWS_SECTIONS[s] }}</option></select></label><div class="dialog-actions"><button class="ui-button" @click="picker.close()">Cancelar</button><button class="ui-button primary" @click="startForm">Continuar →</button></div></div></dialog>
    <dialog ref="formDialog" class="modal editorial-modal" aria-label="Nueva publicación" @cancel="saving && $event.preventDefault()"><ModalPublicacion v-if="formMounted" :key="createSection" :publicacion="{}" modo="crear" :section="createSection" :server-error="error" :saving="saving" @cerrar="formDialog.close();formMounted=false" @guardar="save" /></dialog>
  </section>
</template>
