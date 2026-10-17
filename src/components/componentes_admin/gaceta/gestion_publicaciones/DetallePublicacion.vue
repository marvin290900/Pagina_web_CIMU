<script setup>
import { ref, computed, onMounted, defineAsyncComponent } from 'vue';
import { can, canEditNews } from '../../../../lib/security/roles.js';
import { NEWS_SECTIONS, stateLabel, dateLabel, newsActions, adminRequest, videoEmbedUrl } from '../../../../lib/publicationUi.js';
import BarraEstados from '../../editorial/BarraEstados.vue';
import CargandoEditor from '../../editorial/CargandoEditor.vue';
import { sanitizeHtml } from '../../../../lib/security/sanitize.js';
const ModalPublicacion = defineAsyncComponent({ loader: () => import('./componentes/ModalPublicacion.vue'), loadingComponent: CargandoEditor, delay: 100 });
const MarkdownPreview = defineAsyncComponent(async () => { const { MdPreview } = await import('md-editor-v3'); await import('md-editor-v3/lib/style.css'); return MdPreview; });
const props = defineProps({ initialPublication: { type: Object, required: true }, user: { type: Object, required: true }, section: { type: String, required: true }, author: { type: Object, default: () => ({}) } });
const doc = ref(JSON.parse(JSON.stringify(props.initialPublication))), busy = ref(false), error = ref(''), notice = ref(''), tab = ref('content'), mounted = ref(false);
const editDialog = ref(null), editMounted = ref(false), actionDialog = ref(null), pending = ref(null), note = ref(''), assignees = ref([]);
const scope = computed(() => ({ section: props.section }));
const actions = computed(() => newsActions(props.user, doc.value, props.section));
const primaryActions = computed(() => actions.value.filter(a => !a.secondary));
const secondaryActions = computed(() => actions.value.filter(a => a.secondary));
const canEdit = computed(() => canEditNews(props.user, doc.value, props.section));
const canAssign = computed(() => can(props.user, 'gaceta.assign', scope.value));
const publicUrl = computed(() => `/gaceta/${encodeURIComponent(doc.value._id)}?categoria=${props.section}`);
const videoUrl = computed(() => videoEmbedUrl(doc.value.link_yt));
const history = computed(() => [...(doc.value.editorialHistory || [])].reverse());
const assignedName = computed(() => {
  const id = doc.value.assignedTo?.[0];
  if (!id) return 'Sin asignar';
  return id === props.user.id ? props.user.name : assignees.value.find(u => u.id === id)?.name || 'Responsable asignado';
});
const confirmation = computed(() => {
  if (pending.value?.delete) return 'Se eliminará este registro definitivamente. Para ocultarlo y conservar su historial, utiliza Archivar.';
  if (pending.value?.target === 'publicado') return 'La publicación y sus archivos asociados estarán disponibles para los visitantes de Gaceta.';
  if (doc.value.editorialStatus === 'publicado') return 'La publicación dejará de aparecer en el sitio. Podrás seguir consultándola desde este panel.';
  if (pending.value?.target === 'archivado') return 'El registro se conservará en el panel y dejará de estar visible en el sitio.';
  return `El registro pasará de ${stateLabel(doc.value.editorialStatus).toLowerCase()} a ${stateLabel(pending.value?.target).toLowerCase()}.`;
});
async function reload() {
  doc.value = await adminRequest(`/api/gaceta/obtener?categoria=${props.section}&id=${encodeURIComponent(doc.value._id)}&admin=1`);
}
function edit() { error.value = ''; editMounted.value = true; editDialog.value.showModal(); }
function openAction(action) { pending.value = action; note.value = ''; error.value = ''; actionDialog.value.showModal(); }
async function perform(action) {
  if (busy.value) return;
  busy.value = true; error.value = ''; notice.value = '';
  try { await action(); }
  catch(e) { error.value = e.message; }
  finally { busy.value = false; }
}
async function save(input) {
  await perform(async () => {
    await adminRequest(`/api/gaceta/actualizar?coleccion=${props.section}&id=${encodeURIComponent(doc.value._id)}`, { method: 'PUT', body: JSON.stringify({ ...input, tipo: props.section, _rev: doc.value._rev }) });
    editDialog.value.close(); editMounted.value = false; await reload(); notice.value = 'Cambios guardados.';
  });
}
async function confirmAction() {
  await perform(async () => {
    if (pending.value.delete) {
      await adminRequest(`/api/gaceta/eliminar?coleccion=${props.section}&id=${encodeURIComponent(doc.value._id)}`, { method: 'DELETE', body: JSON.stringify({ rev: doc.value._rev }) });
      location.href = '/admin/gaceta/gestion_publicaciones'; return;
    }
    const data = await adminRequest('/api/gaceta/transicion', { method: 'POST', body: JSON.stringify({ section: props.section, id: doc.value._id, rev: doc.value._rev, target: pending.value.target, note: note.value }) });
    doc.value = data.publication; actionDialog.value.close(); pending.value = null; notice.value = 'Estado actualizado.';
  });
}
async function assign(id) {
  await perform(async () => {
    await adminRequest('/api/gaceta/asignar', { method: 'PATCH', body: JSON.stringify({ section: props.section, id: doc.value._id, rev: doc.value._rev, assignedTo: id ? [id] : [] }) });
    await reload(); notice.value = 'Responsable actualizado.';
  });
}
function selectTab(event, name) { tab.value = name; }
function tabKeys(event, name) {
  const names = ['content','details','activity']; const index = names.indexOf(name);
  let next;
  if (event.key === 'ArrowRight') next = names[(index + 1) % names.length];
  else if (event.key === 'ArrowLeft') next = names[(index + names.length - 1) % names.length];
  else if (event.key === 'Home') next = names[0];
  else if (event.key === 'End') next = names.at(-1);
  if (next) { event.preventDefault(); tab.value = next; document.getElementById(`tab-${next}`)?.focus(); }
}
onMounted(async () => {
  mounted.value = true;
  if (canAssign.value) {
    try { assignees.value = (await adminRequest(`/api/gaceta/responsables?section=${props.section}`)).users; }
    catch(e) { error.value = `No se pudieron cargar los responsables. ${e.message}`; }
  }
});
</script>
<template>
  <section class="editorial-workspace record-workspace">
    <nav class="record-breadcrumb" aria-label="Ruta de navegación"><a href="/admin/gaceta/gestion_publicaciones">← Publicaciones</a><span aria-hidden="true">/</span><span>{{ NEWS_SECTIONS[section] }}</span></nav>
    <div class="record-toolbar">
      <div class="record-actions">
        <button v-if="canEdit" class="ui-button primary" :disabled="busy" @click="edit">Editar publicación</button>
        <button v-for="action in primaryActions" :key="action.target" class="ui-button" :disabled="busy" @click="openAction(action)">{{ action.label }} <span aria-hidden="true">→</span></button>
        <details v-if="secondaryActions.length || can(user,'gaceta.delete',scope)" class="action-menu"><summary class="ui-button quiet" aria-label="Más acciones">Más acciones <span aria-hidden="true">⌄</span></summary><div class="action-menu-panel"><button v-for="action in secondaryActions" :key="action.target" :disabled="busy" @click="openAction(action);$event.target.closest('details').removeAttribute('open')">{{ action.label }}</button><button v-if="can(user,'gaceta.delete',scope)" class="danger-text" :disabled="busy" @click="openAction({delete:true,label:'Eliminar publicación'});$event.target.closest('details').removeAttribute('open')">Eliminar publicación</button></div></details>
      </div>
      <a v-if="doc.editorialStatus === 'publicado'" class="ui-button quiet" :href="publicUrl" target="_blank" rel="noopener">Ver en el sitio ↗</a>
    </div>
    <div class="record-state-row"><span class="eyebrow">PROCESO EDITORIAL</span><BarraEstados :state="doc.editorialStatus" :actions="actions" :busy="busy" @select="openAction" /></div>
    <p v-if="error && !editDialog?.open && !actionDialog?.open" role="alert" class="ui-alert error">{{ error }}</p><p v-if="notice" role="status" class="ui-alert success">{{ notice }}</p>
    <div class="record-layout">
      <article class="workspace-sheet record-main">
        <header class="record-heading"><div class="record-kickers"><span class="section-label">{{ NEWS_SECTIONS[section] }}</span><span class="visibility-note" :class="{live:doc.editorialStatus === 'publicado'}"><i></i>{{ doc.editorialStatus === 'publicado' ? 'Visible en Gaceta' : 'Contenido interno' }}</span></div><h1>{{ doc.titulo }}</h1><p class="subtle">Por {{ doc.autor?.nombre || author.nombre || 'Sin autor' }} <span aria-hidden="true">·</span> Actualizada {{ dateLabel(doc.updatedAt || doc.fecha_publicacion) }}</p></header>
        <div class="record-tabs" role="tablist" aria-label="Información de la publicación"><button v-for="item in [{key:'content',label:'Contenido'},{key:'details',label:'Datos editoriales'},{key:'activity',label:'Actividad'}]" :id="`tab-${item.key}`" :key="item.key" role="tab" :aria-selected="tab === item.key" :aria-controls="`panel-${item.key}`" :tabindex="tab === item.key ? 0 : -1" @click="selectTab($event,item.key)" @keydown="tabKeys($event,item.key)">{{ item.label }}<span v-if="item.key === 'activity' && history.length" class="tab-count">{{ history.length }}</span></button></div>
        <div v-show="tab === 'content'" id="panel-content" role="tabpanel" aria-labelledby="tab-content" class="record-content">
          <img v-if="doc.imagenes?.portada?.url" class="record-cover" :src="doc.imagenes.portada.url" :alt="doc.imagenes.portada.descripcion || 'Portada de la publicación'" />
          <div v-if="doc.imagenes?.portada?.descripcion" class="image-caption">{{ doc.imagenes.portada.descripcion }}</div>
          <MarkdownPreview v-if="mounted" :modelValue="doc.contenido || ''" :sanitize="sanitizeHtml" editorId="publication-record-preview" />
          <p v-else class="whitespace-pre-wrap">{{ doc.contenido }}</p>
          <div v-if="doc.imagenes?.galeria?.length" class="record-gallery"><figure v-for="(image,index) in doc.imagenes.galeria" :key="index"><img :src="image.url" :alt="image.descripcion || 'Imagen de la galería'" loading="lazy" /><figcaption>{{ image.descripcion }}</figcaption></figure></div>
          <iframe v-if="videoUrl" class="record-video" :src="videoUrl" title="Video de la publicación" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
          <div v-if="doc.etiquetas?.length" class="tag-list"><span v-for="tag in doc.etiquetas" :key="tag">#{{ tag }}</span></div>
        </div>
        <div v-show="tab === 'details'" id="panel-details" role="tabpanel" aria-labelledby="tab-details" class="record-content"><h2 class="small-heading">Datos editoriales</h2><dl class="detail-grid"><div><dt>Sección</dt><dd>{{ NEWS_SECTIONS[section] }}</dd></div><div><dt>Categoría</dt><dd>{{ doc.categoria || '—' }}</dd></div><div><dt>Autor</dt><dd>{{ doc.autor?.nombre || '—' }}</dd></div><div><dt>Estado actual</dt><dd>{{ stateLabel(doc.editorialStatus) }}</dd></div><div><dt>Fecha de publicación</dt><dd>{{ dateLabel(doc.fecha_publicacion,true) }}</dd></div><div><dt>Creación del registro</dt><dd>{{ dateLabel(doc.createdAt,true) }}</dd></div><div><dt>Última actualización</dt><dd>{{ dateLabel(doc.updatedAt,true) }}</dd></div><div><dt>Responsable de edición</dt><dd>{{ assignedName }}</dd></div></dl><p v-if="doc.editorialStatus !== 'publicado'" class="subtle">La fecha de publicación se confirma al publicar el registro.</p></div>
        <div v-show="tab === 'activity'" id="panel-activity" role="tabpanel" aria-labelledby="tab-activity" class="record-content"><h2 class="small-heading">Historial editorial</h2><ol v-if="history.length" class="activity-timeline"><li v-for="(event,index) in history" :key="index"><span class="timeline-dot"></span><div><p><strong>{{ stateLabel(event.to) }}</strong><span class="subtle"> · {{ dateLabel(event.at,true) }}</span></p><p class="subtle">{{ event.actorId === user.id ? user.name : 'Equipo editorial' }} · {{ stateLabel(event.from) }} → {{ stateLabel(event.to) }}</p><p v-if="event.note" class="activity-note">{{ event.note }}</p></div></li></ol><p v-else class="subtle">Todavía no hay cambios de estado registrados.</p></div>
      </article>
      <aside class="record-sidebar"><div class="workspace-sheet side-card"><h2>Resumen</h2><dl><div><dt>Estado</dt><dd><span class="state-badge" :data-state="doc.editorialStatus">{{ stateLabel(doc.editorialStatus) }}</span></dd></div><div><dt>Sección</dt><dd>{{ NEWS_SECTIONS[section] }}</dd></div><div><dt>Autor</dt><dd>{{ doc.autor?.nombre || '—' }}</dd></div><div><dt>Visualizaciones</dt><dd class="view-number">{{ new Intl.NumberFormat('es-SV').format(doc.visitas || 0) }}</dd></div></dl></div>
        <div class="workspace-sheet side-card"><h2>Responsable de edición</h2><label v-if="canAssign" class="field-label"><span class="sr-only">Asignar responsable</span><select class="ui-control" :value="doc.assignedTo?.[0] || ''" :disabled="busy" @change="assign($event.target.value)"><option value="">Sin asignar</option><option v-for="person in assignees" :key="person.id" :value="person.id">{{ person.name }}</option></select></label><p v-else>{{ assignedName }}</p><p class="subtle fine-print">El responsable podrá editar el contenido dentro de sus permisos.</p></div>
        <p class="record-help">Los cambios de estado quedan registrados en la actividad de esta publicación.</p>
      </aside>
    </div>
    <dialog ref="editDialog" class="modal editorial-modal" aria-label="Editar publicación" @cancel="busy && $event.preventDefault()"><ModalPublicacion v-if="editMounted" :publicacion="doc" modo="editar" :section="section" :server-error="error" :saving="busy" @cerrar="editDialog.close();editMounted=false" @guardar="save" /></dialog>
    <dialog ref="actionDialog" class="modal editorial-modal" aria-labelledby="action-title" @cancel="busy && $event.preventDefault()"><form class="modal-box ui-dialog" @submit.prevent="confirmAction"><p class="eyebrow">{{ pending?.delete ? 'ELIMINAR REGISTRO' : 'PROCESO EDITORIAL' }}</p><h2 id="action-title">{{ pending?.label }}</h2><p class="subtle">{{ confirmation }}</p><p class="dialog-record-title">{{ doc.titulo }}</p><label v-if="!pending?.delete" class="field-label">Observaciones <span class="subtle">(opcional)</span><textarea v-model="note" class="ui-control" maxlength="2000" rows="3" placeholder="Añade contexto para el equipo…"></textarea></label><p v-if="error" class="ui-alert error" role="alert">{{ error }}</p><div class="dialog-actions"><button type="button" class="ui-button" :disabled="busy" @click="actionDialog.close()">Cancelar</button><button class="ui-button" :class="pending?.delete ? 'danger' : 'primary'" :disabled="busy">{{ busy ? 'Procesando…' : pending?.delete ? 'Eliminar definitivamente' : 'Confirmar cambio' }}</button></div></form></dialog>
  </section>
</template>
