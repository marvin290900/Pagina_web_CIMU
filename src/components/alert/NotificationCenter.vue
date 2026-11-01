<template><Teleport :to="target"><div class="notification-center" aria-label="Notificaciones"><Alert v-for="item in notifications" :key="item.id" :mensaje="item.message" :type="item.type" :duracion="item.type === 'error' ? 10000 : 6000" positioned @cerrar="dismissNotification(item.id)" /></div></Teleport></template>
<script setup>
import Alert from './Alert.vue';
import { shallowRef, onMounted, onUnmounted } from 'vue';
import { notifications, dismissNotification, restoreNotification } from '../../lib/notifications.js';
const target = shallowRef('#notification-root');
let observer;
onMounted(() => {
  const updateTarget = () => {
    const dialogs = [...document.querySelectorAll('dialog[open]')];
    target.value = document.activeElement?.closest('dialog[open]') || dialogs.at(-1) || '#notification-root';
  };
  observer = new MutationObserver(updateTarget);
  observer.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['open'], childList: true });
  updateTarget();
  restoreNotification();
});
onUnmounted(() => observer?.disconnect());
</script>
<style scoped>
.notification-center { position:fixed;top:20px;right:20px;z-index:99999;display:flex;flex-direction:column;gap:12px;pointer-events:none;max-height:calc(100dvh - 40px);overflow-y:auto;padding:3px; }
.notification-center :deep(.notification) { pointer-events:auto;flex-shrink:0; }
</style>
