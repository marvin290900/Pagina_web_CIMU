<script setup>
import { ROLE_LABELS } from '../../../lib/security/roles.js';
import { NEWS_SECTIONS } from '../../../lib/publicationUi.js';
import { MODULE_LABELS, ROLE_DESCRIPTIONS } from '../../../lib/adminUi.js';
defineProps({assignments:{type:Array,default:()=>[]}});
</script>
<template><div class="access-card-list"><article v-for="(assignment,index) in assignments" :key="index" class="access-summary"><h3>{{ROLE_LABELS[assignment.role]}}</h3><p class="subtle">{{ROLE_DESCRIPTIONS[assignment.role]}}</p><div v-if="assignment.role!=='administrador'" class="inline-tags"><span v-for="module in assignment.modules" :key="module" class="section-label">{{MODULE_LABELS[module]}}</span></div><p v-if="assignment.role!=='administrador'&&assignment.modules.includes('gaceta')" class="access-scope">Gaceta · {{assignment.sections.includes('*')?'Todas las secciones':assignment.sections.map(s=>NEWS_SECTIONS[s]).join(', ')}}</p></article></div></template>
