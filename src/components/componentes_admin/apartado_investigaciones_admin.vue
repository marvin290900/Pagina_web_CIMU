<script setup>
import { ref, onMounted, defineAsyncComponent } from 'vue';
import { adminRequest } from '../../lib/publicationUi.js';
import CatalogoEditorial from './editorial/CatalogoEditorial.vue';
import CargandoEditor from './editorial/CargandoEditor.vue';
const Formulario=defineAsyncComponent({loader:()=>import('./editorial/FormularioInvestigacion.vue'),loadingComponent:CargandoEditor,delay:100});
const user=ref(null), records=ref([]), loading=ref(true), error=ref(''), saving=ref(false), notice=ref('');
const dialog=ref(null), editorMounted=ref(false), formBusy=ref(false), editing=ref(null), formError=ref('');
async function load(){loading.value=true;error.value='';try{if(!user.value)user.value=(await adminRequest('/api/cuenta/me')).user;records.value=(await adminRequest('/api/investigaciones/investigaciones?admin=1')).data.rows.map(r=>r.doc);}catch(e){error.value=e.message;}finally{loading.value=false;}}
function edit(doc=null){editing.value=doc?JSON.parse(JSON.stringify(doc)):null;formError.value='';editorMounted.value=true;dialog.value.showModal();}
async function save(input){if(saving.value)return;saving.value=true;formError.value='';try{const result=await adminRequest('/api/investigaciones/investigaciones',{method:editing.value?'PUT':'POST',body:JSON.stringify({...input,...(editing.value?{id:editing.value._id,_rev:editing.value._rev}:{})})});dialog.value.close();editorMounted.value=false;if(!editing.value){location.href=`/admin/investigacion?registro=${encodeURIComponent(result.data.id)}`;return;}await load();notice.value='Cambios guardados.';}catch(e){formError.value=e.message;}finally{saving.value=false;}}
onMounted(load);
</script>
<template><div><p v-if="notice" class="ui-alert" role="status">{{notice}}</p><CatalogoEditorial module="investigaciones" :user="user" :documents="records" :loading="loading" :error="error" @create="edit()" @edit="edit" @refresh="load"/>
<dialog ref="dialog" class="modal editorial-modal" :aria-label="editing?'Editar investigación':'Nueva investigación'" @cancel="(saving||formBusy)&&$event.preventDefault()" @close="editorMounted=false"><Formulario v-if="editorMounted" :record="editing" :saving="saving" :server-error="formError" @close="dialog.close();editorMounted=false" @save="save" @busy="formBusy=$event"/></dialog></div></template>
