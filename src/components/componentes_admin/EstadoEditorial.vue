<script setup>
import { ref, computed } from 'vue';
import { can,canEditContent } from '../../lib/security/roles.js';
const props = defineProps({ user:Object, doc:Object, module:String });
const emit = defineEmits(['changed']);
const note = ref(''), error = ref(''), busy = ref(false), users = ref([]);
const targets = computed(() => {
  const d = props.doc, result = [];
  if (d.editorialStatus === 'borrador' && canEditContent(props.user,props.module,d)) result.push(['en_revision','Enviar a revisión']);
  if (d.editorialStatus === 'en_revision' && can(props.user,`${props.module}.review`)) result.push(['borrador','Pedir correcciones'],['aprobado','Aprobar']);
  if (d.editorialStatus === 'aprobado' && can(props.user,`${props.module}.publish`)) result.push(['publicado','Publicar']);
  if (['publicado','aprobado','archivado'].includes(d.editorialStatus) && can(props.user,`${props.module}.unpublish`)) result.push(['borrador','Retirar a borrador']);
  if (d.editorialStatus !== 'archivado' && can(props.user,`${props.module}.archive`)) result.push(['archivado','Archivar']);
  return result;
});
async function api(path,options = {}) {
  const res = await fetch(path,{ ...options,headers:{'Content-Type':'application/json'} });const data = await res.json();
  if (!res.ok) throw new Error(typeof data.error === 'string' ? data.error : 'Revisa los datos');return data;
}
async function change(target) {
  if (props.doc.editorialStatus === 'publicado' && !confirm('El contenido dejará de estar visible. ¿Continuar?')) return;
  busy.value=true;error.value='';
  try { await api('/api/editorial/transicion',{method:'POST',body:JSON.stringify({module:props.module,id:props.doc._id,rev:props.doc._rev,target,note:note.value})});note.value='';emit('changed'); }
  catch(e) { error.value=e.message; } finally { busy.value=false; }
}
async function loadUsers() {
  try { users.value=(await api(`/api/editorial/responsables?module=${props.module}`)).users; } catch(e) {error.value=e.message;}
}
async function assign(id) {
  busy.value=true;error.value='';
  try { await api('/api/editorial/asignar',{method:'PATCH',body:JSON.stringify({module:props.module,id:props.doc._id,rev:props.doc._rev,assignedTo:id ? [id] : []})});emit('changed'); }
  catch(e) {error.value=e.message;} finally {busy.value=false;}
}
</script>
<template><div class="space-y-2 min-w-48"><p class="font-semibold">{{ doc.editorialStatus }}</p>
  <p v-if="error" role="alert" class="text-red-700">{{ error }}</p>
  <label v-if="targets.length" class="block">Observaciones<input v-model="note" class="input input-sm block w-full" maxlength="2000" /></label>
  <div class="flex flex-wrap gap-2"><button v-for="[target,label] in targets" :key="target" class="btn btn-sm" :disabled="busy" @click="change(target)">{{label}}</button></div>
  <details v-if="can(user,`${module}.assign`)" @toggle="$event.target.open && loadUsers()"><summary>Asignar edición</summary><label>Responsable<select class="select select-sm" :disabled="busy" :value="doc.assignedTo?.[0] || ''" @change="assign($event.target.value)"><option value="">Sin asignar</option><option v-for="u in users" :key="u.id" :value="u.id">{{u.name}}</option></select></label></details>
  <details v-if="doc.editorialHistory?.length"><summary>Historial</summary><p v-for="(event,index) in doc.editorialHistory" :key="index">{{event.at}} · {{event.to}} · {{event.note}}</p></details>
</div></template>
