<template>
  <Transition name="notice">
    <div v-if="visible" class="notification" :class="`notification-${kind}`" :style="positioned ? undefined : { position: 'fixed', top: '20px', right: '20px', zIndex: 99999 }" :role="kind === 'error' || kind === 'warning' ? 'alert' : 'status'" :aria-live="kind === 'error' ? 'assertive' : 'polite'" aria-atomic="true" @mouseenter="pause" @mouseleave="resume" @focusin="pause" @focusout="resume">
      <span class="notification-icon" aria-hidden="true">{{ icons[kind] }}</span>
      <div class="notification-copy"><strong>{{ labels[kind] }}</strong><p>{{ mensaje }}</p></div>
      <button type="button" class="notification-close" aria-label="Cerrar notificación" @click="cerrar">×</button>
      <div v-if="autoCerrar && duracion > 0" class="notification-progress" aria-hidden="true"><span :style="{ animationDuration: `${duracion}ms`, animationPlayState: paused ? 'paused' : 'running' }"></span></div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
const props = defineProps({ type: { type: String, default: 'success' }, mensaje: { type: String, required: true }, duracion: { type: Number, default: 6000 }, autoCerrar: { type: Boolean, default: true }, positioned: { type: Boolean, default: false } });
const emit = defineEmits(['cerrar']);
const visible = ref(false), paused = ref(false);
const labels = { success: 'Operación completada', warning: 'Revisa esta información', error: 'No se pudo completar', info: 'Información' };
const icons = { success: '✓', warning: '!', error: '×', info: 'i' };
const kind = computed(() => Object.hasOwn(labels, props.type) ? props.type : 'info');
let timer, closeTimer, startedAt, remaining = props.duracion;
function cerrar() { clearTimeout(timer); visible.value = false; closeTimer = setTimeout(() => emit('cerrar'), 200); }
function resume() { if (!visible.value || !props.autoCerrar || props.duracion <= 0) return; clearTimeout(timer); paused.value = false; startedAt = Date.now(); timer = setTimeout(cerrar, remaining); }
function pause() { if (paused.value || !startedAt) return; clearTimeout(timer); remaining = Math.max(0, remaining - (Date.now() - startedAt)); paused.value = true; }
function showNotice() { clearTimeout(timer); clearTimeout(closeTimer); remaining = props.duracion; paused.value = false; visible.value = true; resume(); }
onMounted(showNotice);
watch(() => [props.mensaje, props.type], showNotice);
onUnmounted(() => { clearTimeout(timer); clearTimeout(closeTimer); });
</script>

<style scoped>
.notification { --notice-color:#246545; --notice-bg:#f0faf4; --notice-border:#b7ddc6; display:flex; align-items:flex-start; gap:12px; width:min(400px,calc(100vw - 40px)); padding:17px 14px 19px 17px; border:1px solid var(--notice-border); border-left:4px solid var(--notice-color); border-radius:10px; box-shadow:0 10px 35px #18232e24; background:var(--notice-bg); color:var(--notice-color); position:relative; overflow:hidden; font-family:ui-sans-serif,system-ui,sans-serif; }
.notification-warning { --notice-color:#78520c; --notice-bg:#fff9e9; --notice-border:#ead39a; }
.notification-error { --notice-color:#a12c2a; --notice-bg:#fff3f1; --notice-border:#edb8b2; }
.notification-info { --notice-color:#285a82; --notice-bg:#eff7ff; --notice-border:#b9d4ee; }
.notification-icon { display:grid;place-items:center;width:24px;height:24px;flex-shrink:0;border:1.5px solid currentColor;border-radius:50%;font-weight:700;font-size:16px;line-height:1; }
.notification-copy { min-width:0;flex:1; }
.notification-copy strong { font-size:12px;line-height:1.5;display:block;font-weight:750; }
.notification-copy p { font-size:12px;line-height:1.7;margin:4px 0 0;overflow-wrap:anywhere; }
.notification-close { border:0;background:transparent;color:inherit;cursor:pointer;font-size:22px;line-height:1;width:28px;height:28px;flex-shrink:0;border-radius:5px; }
.notification-close:hover { background:#0000000c; }
.notification-close:focus-visible { outline:2px solid currentColor;outline-offset:2px; }
.notification-progress { position:absolute;bottom:0;left:0;right:0;height:3px;background:#00000008; }
.notification-progress span { display:block;height:100%;background:var(--notice-color);opacity:.5;transform-origin:left;animation:notice-progress linear forwards; }
@keyframes notice-progress { to { transform:scaleX(0); } }
.notice-enter-active,.notice-leave-active { transition:opacity .2s ease,transform .2s ease; }
.notice-enter-from,.notice-leave-to { opacity:0;transform:translateY(-10px); }
@media(prefers-reduced-motion:reduce) { .notice-enter-active,.notice-leave-active { transition:none; }.notification-progress span { animation:none; } }
</style>
