<template>
  <div class="auth-form-panel workspace-sheet">
    <div class="auth-form-heading"><span class="section-number" aria-hidden="true">{{ activation ? '01' : '↗' }}</span><p class="eyebrow">{{ activation ? 'ACTIVA TU ACCESO' : 'ACCESO AL EQUIPO' }}</p><h1>{{ activation ? 'Establecer contraseña' : 'Iniciar sesión' }}</h1><p class="subtle">{{ activation ? 'Define una contraseña personal para comenzar a trabajar con tu equipo.' : 'Ingresa con tu cuenta para continuar al panel editorial.' }}</p></div>

    <div v-if="success" class="auth-complete"><span class="auth-success-symbol" aria-hidden="true">✓</span><h2>Tu acceso está listo</h2><p>La contraseña se guardó correctamente. Ya puedes iniciar sesión con tu correo y tu nueva contraseña.</p><a href="/login" class="ui-button primary auth-submit">Ir al inicio de sesión <span aria-hidden="true">→</span></a></div>
    <template v-else>
      <p v-if="error" id="auth-error" class="ui-alert error" role="alert">{{ error }}</p>
      <form v-if="!activation || validLink" @submit.prevent="submit" :aria-busy="busy" :aria-describedby="error ? 'auth-error' : undefined">
        <fieldset :disabled="busy">
          <label v-if="!activation" class="field-label" for="auth-email">Correo electrónico<input id="auth-email" v-model="email" name="email" class="ui-control" type="email" required autocomplete="username" placeholder="nombre@institucion.edu.sv" /></label>
          <label class="field-label" for="auth-password">{{ activation ? 'Nueva contraseña' : 'Contraseña' }}<input id="auth-password" v-model="password" name="password" class="ui-control" :type="show ? 'text' : 'password'" required :minlength="activation ? 12 : undefined" :autocomplete="activation ? 'new-password' : 'current-password'" :aria-describedby="activation ? 'auth-password-help' : undefined" :placeholder="activation ? 'Escribe una contraseña de al menos 12 caracteres' : 'Ingresa tu contraseña'" /></label>
          <p v-if="activation" id="auth-password-help" class="field-help">Usa al menos 12 caracteres. Una frase larga y única es más fácil de recordar.</p>
          <label v-if="activation" class="field-label" for="auth-confirmation">Repetir contraseña<input id="auth-confirmation" v-model="confirmation" name="confirmation" class="ui-control" :type="show ? 'text' : 'password'" required minlength="12" autocomplete="new-password" placeholder="Vuelve a escribir tu contraseña" /></label>
          <label class="show-password"><input v-model="show" type="checkbox" class="checkbox checkbox-sm" />{{ activation ? 'Mostrar contraseñas' : 'Mostrar contraseña' }}</label>
        </fieldset>
        <button class="ui-button primary auth-submit" type="submit" :disabled="busy || (activation && !ready)"><span v-if="busy" class="loading loading-spinner loading-xs" aria-hidden="true"></span>{{ busy ? (activation ? 'Guardando…' : 'Ingresando…') : activation ? 'Guardar contraseña' : 'Iniciar sesión' }}<span v-if="!busy" aria-hidden="true">→</span></button>
      </form>
      <p v-if="activation && ready" class="auth-security-note"><span aria-hidden="true">◇</span>El enlace es personal y se utiliza una sola vez. Si venció, solicita uno nuevo a la administración.</p>
      <p v-if="!activation" class="auth-support">¿Necesitas acceso o recuperar tu contraseña?<br />Solicita un enlace a la administración de CIMU.</p>
      <a v-else href="/login" class="auth-secondary-link">← Volver al inicio de sesión</a>
    </template>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue';
import { notify, useFormNotifications } from '../../lib/notifications.js';
const props = defineProps({ mode: { type: String, default: 'login' }, redirectTo: { type: String, default: '/admin' } });
const activation = computed(() => props.mode === 'activation');
const email = ref(''), password = ref(''), confirmation = ref(''), show = ref(false), busy = ref(false), error = ref(''), success = ref(false), ready = ref(false), validLink = ref(true);
let id, token;
useFormNotifications({ error });
onMounted(() => {
  if (activation.value) {
    const fragment = new URLSearchParams(location.hash.slice(1));
    id = fragment.get('id'); token = fragment.get('token');
    history.replaceState(null, '', location.pathname);
    validLink.value = Boolean(id && token);
    if (!validLink.value) error.value = 'Enlace incompleto. Solicita un enlace nuevo a la administración.';
  }
  ready.value = true;
});
async function submit() {
  if (busy.value || (activation.value && (!ready.value || !validLink.value))) return;
  error.value = '';
  if (activation.value) {
    if (password.value !== confirmation.value) { error.value = 'Las contraseñas no coinciden. Revisa ambos campos.'; return; }
    if (password.value.length < 12 || new TextEncoder().encode(password.value).length > 72) { error.value = 'Usa al menos 12 caracteres y como máximo 72 bytes para la contraseña.'; return; }
  }
  busy.value = true;
  try {
    const response = await fetch(activation.value ? '/api/cuenta/activar' : '/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(activation.value ? { id, token, password: password.value } : { email: email.value, password: password.value }) });
    const result = await response.json();
    if (!response.ok) throw new Error(typeof result.error === 'string' ? result.error : 'Revisa los datos e intenta nuevamente.');
    if (activation.value) {
      success.value = true; password.value = ''; confirmation.value = ''; id = token = undefined;
      notify('Contraseña guardada. Ya puedes iniciar sesión.');
    } else location.href = props.redirectTo;
  } catch (err) { error.value = err instanceof Error ? err.message : 'No se pudo completar la solicitud. Intenta nuevamente.'; }
  finally { busy.value = false; }
}
</script>
