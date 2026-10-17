<script setup>
import { ref } from 'vue';
import { initials, ACCOUNT_STATES } from '../../../lib/adminUi.js';
import { dateLabel, adminRequest } from '../../../lib/publicationUi.js';
import AccesosCuenta from './AccesosCuenta.vue';
const props=defineProps({user:{type:Object,required:true}});
const currentPassword=ref(''), password=ref(''), confirmation=ref(''), show=ref(false), busy=ref(false), error=ref('');
async function save(){
  error.value='';
  if(password.value!==confirmation.value){error.value='Las contraseñas nuevas no coinciden.';return;}
  if(password.value.length<12||new TextEncoder().encode(password.value).length>72){error.value='Usa al menos 12 caracteres y como máximo 72 bytes para la nueva contraseña.';return;}
  busy.value=true;
  try{await adminRequest('/api/cuenta/password',{method:'POST',body:JSON.stringify({currentPassword:currentPassword.value,password:password.value})});location.href='/login';}
  catch(e){error.value=e.message;}finally{busy.value=false;}
}
</script>
<template><section class="editorial-workspace profile-workspace">
<div class="workspace-heading"><div><p class="eyebrow">ESPACIO PERSONAL</p><h1>Mi cuenta</h1><p class="subtle">Consulta tus accesos y mantén segura tu cuenta.</p></div></div>
<div class="profile-banner workspace-sheet"><span class="profile-avatar" aria-hidden="true">{{initials(user.name)}}</span><div><h2>{{user.name}}</h2><p>{{user.email}}</p><span class="state-badge" :data-state="user.status">{{ACCOUNT_STATES[user.status]}}</span></div><div class="profile-banner-meta"><span>MIEMBRO DEL EQUIPO</span><strong>CIMU · Editorial</strong><small v-if="user.createdAt">Desde {{dateLabel(user.createdAt)}}</small></div></div>
<div class="profile-columns"><section class="workspace-sheet form-sheet"><div class="section-heading"><span class="section-number">01</span><div><h2>Mis roles y accesos</h2><p class="subtle">Estos permisos determinan las aplicaciones y acciones que tienes disponibles.</p></div></div><AccesosCuenta :assignments="user.assignments"/><p class="workspace-footnote">Si necesitas otro acceso, solicita el cambio a una persona administradora.</p></section>
<section class="workspace-sheet form-sheet"><div class="section-heading"><span class="section-number">02</span><div><h2>Seguridad</h2><p class="subtle">Cambia tu contraseña cuando lo necesites.</p></div></div><form @submit.prevent="save" class="password-form"><fieldset :disabled="busy"><label class="field-label">Contraseña actual<input v-model="currentPassword" name="currentPassword" class="ui-control" :type="show?'text':'password'" required autocomplete="current-password" /></label><label class="field-label">Nueva contraseña<input v-model="password" name="password" class="ui-control" :type="show?'text':'password'" required minlength="12" autocomplete="new-password" aria-describedby="password-help" /></label><p id="password-help" class="field-help">Al menos 12 caracteres. Una frase larga y única resulta más fácil de recordar.</p><label class="field-label">Repetir nueva contraseña<input v-model="confirmation" name="confirmation" class="ui-control" :type="show?'text':'password'" required minlength="12" autocomplete="new-password" /></label><label class="show-password"><input v-model="show" type="checkbox" class="checkbox checkbox-sm" />Mostrar contraseñas</label></fieldset><p v-if="error" class="ui-alert error" role="alert">{{error}}</p><div class="password-notice"><span aria-hidden="true">↗</span><p>Al cambiar la contraseña se cerrarán todas tus sesiones, incluida esta. Después podrás ingresar con la nueva contraseña.</p></div><button class="ui-button primary" :disabled="busy">{{busy?'Actualizando…':'Actualizar contraseña'}}</button></form></section></div>
</section></template>
