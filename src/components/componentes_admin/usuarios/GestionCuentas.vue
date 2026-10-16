<script setup>
import { ref, onMounted } from 'vue';
import { ROLE_LABELS, MODULES, SECTIONS } from '../../../lib/security/roles.js';
const users = ref([]), busy = ref(false), error = ref(''), notice = ref(''), setupLink = ref('');
const editing = ref(null), form = ref(empty());
function empty() { return { name: '', email: '', status: 'invited', assignments: [{ role: 'colaborador', modules: ['gaceta'], sections: ['actualidad'] }] }; }
async function api(url, options = {}) {
  const response = await fetch(url, { ...options, headers: { 'Content-Type': 'application/json' } });
  const data = await response.json();
  if (!response.ok) throw new Error(typeof data.error === 'string' ? data.error : 'Revisa los datos del formulario');
  return data;
}
async function load() { users.value = (await api('/api/usuarios')).users; }
function select(user) {
  editing.value = user?.id || null; form.value = user ? JSON.parse(JSON.stringify({ name: user.name, email: user.email, status: user.status, assignments: user.assignments, version: user.authVersion })) : empty();
  setupLink.value = ''; notice.value = ''; error.value = '';
}
function showLink(id, token) { setupLink.value = `${location.origin}/activar-cuenta#id=${encodeURIComponent(id)}&token=${encodeURIComponent(token)}`; }
async function run(action) { busy.value = true; error.value = ''; notice.value = ''; try { await action(); } catch (e) { error.value = e.message; } finally { busy.value = false; } }
async function save() {
  await run(async () => {
    if (editing.value) {
      const { email, ...body } = form.value;
      await api(`/api/usuarios/${editing.value}`, { method: 'PATCH', body: JSON.stringify(body) });
      notice.value = 'Cuenta actualizada. Sus sesiones anteriores quedaron revocadas.';
    } else {
      const { status, ...body } = form.value;
      const result = await api('/api/usuarios', { method: 'POST', body: JSON.stringify(body) });
      showLink(result.user.id, result.setupToken);
      notice.value = 'Cuenta creada. Entrega el enlace de forma privada; se muestra solo en esta pantalla.';
    }
    editing.value = null; form.value = empty(); await load();
  });
}
async function access(user, action) {
  if (!window.confirm(action === 'reset' ? 'Se invalidará la contraseña actual y todas las sesiones. ¿Restablecer acceso?' : '¿Cerrar todas las sesiones de esta cuenta?')) return;
  await run(async () => {
    const data = await api(`/api/usuarios/${user.id}/acceso`, { method: 'POST', body: JSON.stringify({ action }) });
    if (data.setupToken) showLink(user.id, data.setupToken);
    notice.value = action === 'reset' ? 'Entrega el nuevo enlace de forma privada. Vence en una hora.' : 'Sesiones revocadas.';
    await load();
  });
}
onMounted(() => run(load));
</script>
<template>
  <section class="max-w-6xl mx-auto px-4 space-y-6">
    <h1 class="text-3xl font-bold">Cuentas y permisos</h1>
    <p>Cada cuenta pertenece a una persona. Los autores públicos se administran por separado en Gaceta.</p>
    <p v-if="error" role="alert" class="alert alert-error">{{ error }}</p>
    <p v-if="notice" role="status" class="alert alert-success">{{ notice }}</p>
    <div v-if="setupLink" class="p-4 border rounded space-y-2">
      <label class="block font-bold" for="setup-link">Enlace privado para establecer contraseña</label>
      <input id="setup-link" class="input w-full" readonly :value="setupLink" @focus="$event.target.select()" />
      <button class="btn btn-sm" @click="setupLink = ''">Ocultar enlace</button>
    </div>
    <div class="overflow-x-auto"><table class="table">
      <thead><tr><th>Persona</th><th>Correo</th><th>Estado</th><th>Roles</th><th>Acciones</th></tr></thead>
      <tbody><tr v-for="user in users" :key="user.id">
        <td>{{ user.name }}</td><td>{{ user.email }}</td><td>{{ user.status }}</td>
        <td><div v-for="(a, index) in user.assignments" :key="index">{{ ROLE_LABELS[a.role] }} · {{ a.modules.join(', ') }}<span v-if="a.sections.length"> · {{ a.sections.join(', ') }}</span></div></td>
        <td><div class="flex flex-wrap gap-2"><button class="btn btn-sm" :disabled="busy" @click="select(user)">Editar</button><button class="btn btn-sm" :disabled="busy" @click="access(user, 'revoke')">Cerrar sesiones</button><button class="btn btn-sm" :disabled="busy" @click="access(user, 'reset')">Restablecer acceso</button></div></td>
      </tr></tbody>
    </table></div>
    <form class="border rounded p-6 space-y-4" @submit.prevent="save">
      <div class="flex justify-between"><h2 class="text-xl font-bold">{{ editing ? 'Editar cuenta' : 'Crear cuenta' }}</h2><button type="button" class="btn btn-sm" :disabled="busy" @click="select(null)">Nueva cuenta</button></div>
      <label class="block">Nombre<input v-model="form.name" class="input block w-full" required minlength="2" maxlength="120" :disabled="busy" /></label>
      <label class="block">Correo<input v-model="form.email" class="input block w-full" type="email" required :disabled="busy || !!editing" /></label>
      <label v-if="editing" class="block">Estado<select v-model="form.status" class="select block" :disabled="busy"><option value="active">Activa</option><option value="disabled">Desactivada</option><option v-if="form.status === 'invited'" value="invited">Invitación pendiente</option></select></label>
      <fieldset v-for="(assignment, index) in form.assignments" :key="index" class="border rounded p-4 space-y-3" :disabled="busy">
        <legend>Asignación {{ index + 1 }}</legend>
        <label>Rol <select v-model="assignment.role" class="select"><option v-for="(label, role) in ROLE_LABELS" :key="role" :value="role">{{ label }}</option></select></label>
        <template v-if="assignment.role !== 'administrador'">
          <p>Módulos</p><div class="flex flex-wrap gap-4"><label v-for="module in MODULES" :key="module"><input v-model="assignment.modules" type="checkbox" :value="module" class="checkbox checkbox-sm" /> {{ module }}</label></div>
          <template v-if="assignment.modules.includes('gaceta')"><p>Secciones de Gaceta</p><div class="flex flex-wrap gap-4"><label v-for="section in ['*', ...SECTIONS]" :key="section"><input v-model="assignment.sections" type="checkbox" :value="section" class="checkbox checkbox-sm" /> {{ section === '*' ? 'Todas' : section }}</label></div></template>
        </template>
        <p v-else>Administra cuentas y sesiones. Para publicar, agrega también el rol de dirección editorial.</p>
        <button type="button" class="btn btn-sm" :disabled="form.assignments.length === 1" @click="form.assignments.splice(index, 1)">Quitar asignación</button>
      </fieldset>
      <button type="button" class="btn" :disabled="busy || form.assignments.length >= 12" @click="form.assignments.push({ role: 'consulta', modules: [], sections: [] })">Agregar rol y alcance</button>
      <p class="text-sm">Los colaboradores trabajan en borradores propios; los editores revisan y editan contenidos asignados; dirección editorial publica.</p>
      <div><button class="btn btn-primary" :disabled="busy">{{ busy ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear y generar enlace' }}</button></div>
    </form>
  </section>
</template>
