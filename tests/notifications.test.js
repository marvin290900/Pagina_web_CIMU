import test from 'node:test';
import assert from 'node:assert/strict';
import { ref } from 'vue';
import { notifications, notify, dismissNotification, useFormNotifications, notifyAfterNavigation, restoreNotification } from '../src/lib/notifications.js';

test('a dismissed form error is announced again on a repeated failed attempt', () => {
  notifications.value = [];
  const error = ref('');
  const stop = useFormNotifications({ error });
  error.value = 'No se pudo guardar';
  assert.equal(notifications.value[0].type, 'error');
  dismissNotification(notifications.value[0].id);
  error.value = ''; error.value = 'No se pudo guardar';
  assert.equal(notifications.value.length, 1);
  assert.equal(notifications.value[0].message, error.value);
  stop();
  error.value = 'Otro mensaje';
  assert.equal(notifications.value.length, 1);
  notifications.value = [];
});

test('feedback survives one navigation, is consumed once, and limits stacked notifications', () => {
  const previous = globalThis.sessionStorage;
  const store = new Map();
  globalThis.sessionStorage = { getItem: key => store.get(key) || null, setItem: (key, value) => store.set(key, value), removeItem: key => store.delete(key) };
  try {
    notifications.value = [];
    notifyAfterNavigation('Libro creado correctamente.');
    restoreNotification(); restoreNotification();
    assert.equal(notifications.value.length, 1);
    assert.equal(notifications.value[0].message, 'Libro creado correctamente.');
    for (let n = 0; n < 5; n++) notify(`Mensaje ${n}`);
    assert.equal(notifications.value.length, 3);
    assert.deepEqual(notifications.value.map(item => item.message), ['Mensaje 2', 'Mensaje 3', 'Mensaje 4']);
  } finally { notifications.value = []; if (previous === undefined) delete globalThis.sessionStorage; else globalThis.sessionStorage = previous; }
});
