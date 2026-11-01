import { ref, watch } from 'vue';

export const notifications = ref([]);
let sequence = 0;
export function notify(message, type = 'success') {
  if (!message) return;
  const item = { id: ++sequence, message: String(message), type };
  notifications.value = [...notifications.value.slice(-2), item];
  return item.id;
}
export function dismissNotification(id) {
  notifications.value = notifications.value.filter(item => item.id !== id);
}
// Keep persistent field errors in their forms while also making feedback visible
// when a long page or an open dialog would hide the message.
export function useFormNotifications({ error, notice } = {}) {
  const stops = [];
  if (error) stops.push(watch(error, message => { if (message) notify(message, 'error'); }, { flush: 'sync' }));
  if (notice) stops.push(watch(notice, message => { if (message) notify(message, 'success'); }, { flush: 'sync' }));
  return () => stops.forEach(stop => stop());
}

export function notifyAfterNavigation(message) {
  try { sessionStorage.setItem('cimu-notice', JSON.stringify({ message, type: 'success' })); } catch { /* Navigation still works when storage is unavailable. */ }
}
export function restoreNotification() {
  try {
    const raw = sessionStorage.getItem('cimu-notice');
    sessionStorage.removeItem('cimu-notice');
    if (!raw) return;
    const item = JSON.parse(raw);
    if (typeof item.message === 'string' && item.message.length <= 500 && item.type === 'success') notify(item.message);
  } catch { /* Ignore invalid or unavailable session storage. */ }
}
