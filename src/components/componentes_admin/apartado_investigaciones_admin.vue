<template>
  <section class="p-4">
    <h1 class="text-2xl font-bold mb-6">Panel de Investigaciones</h1>

    <!-- Filtro y botón -->
    <div class="mb-4 flex flex-col sm:flex-row sm:items-center gap-2">
      <select v-model="filtroPrograma" class="select select-bordered max-w-xs">
        <option value="">Todos los programas</option>
        <option value="sociologico">Sociológicos</option>
        <option value="juridico">Jurídicos</option>
        <option value="medio_ambiente">Medio Ambiente</option>
        <option value="inclusion">Inclusión</option>
        <option value="laboratorio_publica">Laboratorio Pública</option>
      </select>

      <button @click="abrirModalNueva" class="btn btn-success bg-green-600 text-white bold ml-auto hover:bg-green-700 transition">+ Nueva Investigación</button>
    </div>

    <!-- Grid de Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="inv in investigacionesFiltradas" :key="inv._id" class="card bg-base-100 shadow-md">
        <figure>
          <img :src="inv.imagen" alt="imagen" class="object-cover h-48 w-full" />
        </figure>
        <div class="card-body">
          <h2 class="card-title">{{ inv.titulo }}</h2>
          <p><strong>Programa:</strong> {{ inv.programa }}</p>
          <p><strong>Fecha:</strong> {{ formatDate(inv.fecha) }}</p>
          <div class="card-actions justify-end">
            <button @click="editarInvestigacion(inv)" class="btn btn-sm btn-info">Editar</button>
            <button @click="eliminarInvestigacion(inv._id, inv._rev)" class="btn btn-sm btn-error">Eliminar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <dialog ref="modal" class="modal">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">
          {{ investigacionEditando?._id ? 'Editar' : 'Nueva' }} Investigación
        </h3>
        <form @submit.prevent="guardarInvestigacion" class="space-y-4">
          <input type="hidden" v-model="investigacionEditando._id" />
          <input type="hidden" v-model="investigacionEditando._rev" />

          <div>
            <label class="label">Título</label>
            <input v-model="investigacionEditando.titulo" type="text" class="input input-bordered w-full" required />
          </div>

          <div>
            <label class="label">Programa</label>
            <select v-model="investigacionEditando.programa" class="select select-bordered w-full" required>
              <option value="">Selecciona</option>
              <option value="sociologico">Sociológicos</option>
              <option value="juridico">Jurídicos</option>
              <option value="medio_ambiente">Medio Ambiente</option>
              <option value="inclusion">Inclusión</option>
              <option value="laboratorio_publica">Laboratorio Pública</option>
            </select>
          </div>

          <div>
            <label class="label">Fecha</label>
            <input v-model="investigacionEditando.fecha" type="date" class="input input-bordered w-full" required />
          </div>

          <div>
            <label class="label">Imagen</label>
            <input type="file" @change="handleFileUpload" accept="image/*" class="file-input file-input-bordered w-full" />
            <img v-if="previewImage" :src="previewImage" class="mt-2 w-full h-48 object-cover rounded" />
          </div>

          <div class="modal-action">
            <button type="button" class="btn" @click="cerrarModal">Cancelar</button>
            <button type="submit" class="btn btn-primary">Guardar</button>
          </div>
        </form>
      </div>
    </dialog>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const filtroPrograma = ref('')
const investigaciones = ref([])
const investigacionEditando = ref({})
const previewImage = ref(null)
const modal = ref(null)
let imagenSeleccionada = null

async function cargarInvestigaciones() {
  const res = await fetch('https://couchdb.am19139.me/investigaciones/_all_docs?include_docs=true', {
    headers: {
      Authorization: 'Basic ' + btoa('admin:am191392120')
    }
  })
  const data = await res.json()
  investigaciones.value = data.rows.map(r => r.doc)
}

const investigacionesFiltradas = computed(() => {
  if (!filtroPrograma.value) return investigaciones.value
  return investigaciones.value.filter(i => i.programa === filtroPrograma.value)
})

function abrirModalNueva() {
  investigacionEditando.value = { titulo: '', programa: '', fecha: '', imagen: '' }
  previewImage.value = null
  imagenSeleccionada = null
  modal.value.showModal()
}

function cerrarModal() {
  modal.value.close()
}

function editarInvestigacion(inv) {
  investigacionEditando.value = { ...inv }
  previewImage.value = inv.imagen || null
  modal.value.showModal()
}

function handleFileUpload(event) {
  const file = event.target.files[0]
  if (file) {
    imagenSeleccionada = file
    previewImage.value = URL.createObjectURL(file)
  }
}

async function guardarInvestigacion() {
  const data = { ...investigacionEditando.value }
  const id = data._id || crypto.randomUUID()

  if (imagenSeleccionada) {
    // Simulación: subir imagen a tu backend en el futuro
    const formData = new FormData()
    formData.append('file', imagenSeleccionada)

    // await fetch('/api/upload', { method: 'POST', body: formData })
    // const imageUrl = await respuestaDelBackend()
    const imageUrl = previewImage.value
    data.imagen = imageUrl
  }

  const res = await fetch(`https://couchdb.am19139.me/investigaciones/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: 'Basic ' + btoa('admin:am191392120'),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  await cargarInvestigaciones()
  cerrarModal()
}

async function eliminarInvestigacion(id, rev) {
  await fetch(`https://couchdb.am19139.me/investigaciones/${id}?rev=${rev}`, {
    method: 'DELETE',
    headers: {
      Authorization: 'Basic ' + btoa('admin:am191392120')
    }
  })
  await cargarInvestigaciones()
}

function formatDate(fecha) {
  return new Date(fecha).toLocaleDateString()
}

onMounted(cargarInvestigaciones)
</script>
