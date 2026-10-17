<script setup>
import { computed } from 'vue';
import { can } from '../../../lib/security/roles.js';
import { newsActions, catalogActions } from '../../../lib/publicationUi.js';
const props=defineProps({user:Object,doc:{type:Object,required:true},module:{type:String,default:'gaceta'},section:String,busy:Boolean});
defineEmits(['select']);
const actions=computed(()=>props.module==='gaceta'?newsActions(props.user,props.doc,props.section):catalogActions(props.user,props.doc,props.module));
const pendingApproval=computed(()=>['borrador','en_revision'].includes(props.doc.editorialStatus)&&can(props.user,`${props.module}.publish`,{section:props.section}));
</script>
<template><div class="publication-actions" aria-label="Acciones editoriales"><div class="record-actions"><button v-for="action in actions" :key="action.target" type="button" class="ui-button" :class="{primary:!action.secondary,'archive-action':action.target==='archivado'}" :disabled="busy" @click="$emit('select',action)"><span v-if="action.target==='archivado'" aria-hidden="true">▣</span><span v-else-if="action.target==='borrador'" aria-hidden="true">↶</span>{{action.label}}</button><button v-if="pendingApproval" type="button" class="ui-button" disabled title="La publicación debe aprobarse antes de publicarla">Publicar</button></div><p v-if="pendingApproval" class="field-help">Para publicar, primero completa la revisión y la aprobación.</p><p v-if="!actions.length&&!pendingApproval" class="field-help">Tu cuenta puede consultar este registro. No tiene acciones de cambio disponibles en su estado actual.</p></div></template>
