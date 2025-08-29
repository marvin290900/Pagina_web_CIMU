<template>
  <section class="p-4">
    <h1 class="text-2xl font-bold mb-6">Panel de Investigaciones  </h1>

    <!-- Botón para nueva investigación -->
    <button @click="abrirModalNueva" class="btn btn-success mb-4">+ Nueva Investigación</button>

    <!-- Lista temporal de investigaciones -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="(inv, index) in investigaciones" :key="index" class="card bg-base-100 shadow-md">
        <figure>
          <img :src="inv.imagen" alt="imagen" class="object-cover h-48 w-full" />
        </figure>
        <div class="card-body">
          <h2 class="card-title">{{ inv.titulo }}</h2>
          <p><strong>Autores:</strong> {{ inv.autores.join(", ") }}</p>
          <p><strong>Programa:</strong> {{ inv.programa }}</p>
          <p><strong>Fecha:</strong> {{ formatDate(inv.fecha) }}</p>
          <div class="card-actions justify-end">
            <button @click="editarInvestigacion(inv, index)" class="btn btn-sm btn-info">Editar</button>
            <button @click="eliminarInvestigacion(index)" class="btn btn-sm btn-error">Eliminar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <dialog ref="modal" class="modal">
      <form method="dialog" class="modal-box w-11/12 max-w-2xl" @submit.prevent="guardarInvestigacion">
        <h3 class="font-bold text-lg mb-4">
          {{ investigacionEditando.index !== null ? 'Editar' : 'Nueva' }} Investigación
        </h3>

        <div class="flex flex-col gap-3">
          <input v-model="investigacionEditando.titulo" type="text" placeholder="Título*"
            class="input input-bordered w-full" required />

          <textarea v-model="investigacionEditando.resumen" maxlength="300"
            class="textarea textarea-bordered w-full min-h-[120px]"
            placeholder="Escribe un resumen breve de la investigación..." required></textarea>
          <p class="text-sm text-gray-500">{{ investigacionEditando.resumen.length }}/300 caracteres</p>

          <textarea
    v-model="investigacionEditando.descripcion"
    maxlength="1000"
    class="textarea textarea-bordered w-full min-h-[120px]"
    placeholder="Escribe aquí la descripción completa de la investigación..."
    required
  ></textarea>
  <p class="text-sm text-gray-500">{{ investigacionEditando.descripcion.length }}/1000 caracteres</p>

          <input v-model="autoresInput" type="text" placeholder="Autores (separados por coma)*"
            class="input input-bordered w-full" required />

          <select v-model="investigacionEditando.programa" class="select select-bordered w-full" required>
            <option value="">Selecciona programa</option>
            <option value="sociologico">Sociológicos</option>
            <option value="juridico">Jurídicos</option>
            <option value="medio_ambiente">Medio Ambiente</option>
            <option value="inclusion">Inclusión</option>
            <option value="laboratorio_publica">Laboratorio Pública</option>
          </select>

          <input v-model="investigacionEditando.fecha" type="date" class="input input-bordered w-full" required />

          <input v-model="investigacionEditando.uri" type="text" placeholder="URI (Opcional)" class="input input-bordered w-full" />
          <input v-model="investigacionEditando.keywords" type="text" placeholder="Palabras Claves*" class="input input-bordered w-full"
            required />

          <label class="label">Subir PDF</label>
          <input type="file" @change="handleFileUpload" accept="application/pdf"
            class="file-input file-input-bordered w-full" />
          <img v-if="previewImage" :src="previewImage" class="mt-2 w-full h-48 object-cover rounded" />
        </div>

        <div class="modal-action">
          <button type="button" class="btn btn-outline" @click="cerrarModal">Cancelar</button>
          <button type="submit" class="btn btn-primary">{{ investigacionEditando.index !== null ? 'Actualizar' :
            'Guardar' }}</button>
        </div>
      </form>
    </dialog>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const investigaciones = ref([])
const investigacionEditando = ref({ titulo: '', descripcion: '', resumen: '', autores: [], programa: '', fecha: '', imagen: '', index: null, uri: '' })
const autoresInput = ref('')
const keywordsInput = ref('')
const previewImage = ref(null)
const modal = ref(null)
let pdfSeleccionado = null


function abrirModalNueva() {
  investigacionEditando.value = { titulo: '', descripcion: '', resumen: '', autores: [], programa: '', fecha: '', imagen: '', index: null, uri: '' }
  autoresInput.value = ''
  previewImage.value = null
  pdfSeleccionado = null
  modal.value.showModal()
}

function cerrarModal() {
  modal.value.close()
}

function editarInvestigacion(inv, index) {
  investigacionEditando.value = { ...inv, index }
  autoresInput.value = inv.autores.join(', ')
  previewImage.value = inv.imagen || null
  modal.value.showModal()
}

function handleFileUpload(event) {
  const file = event.target.files[0]
  if (!file) return
  if (file.type !== 'application/pdf') {
    pdfSeleccionado = null
    return
  }
  pdfSeleccionado = file
  // Ojo: esto no muestra thumbnail, solo ícono/preview temporal
  previewImage.value = "/pdf-icon.png"
}

async function guardarInvestigacion() {
  investigacionEditando.value.autores = autoresInput.value.split(',').map(a => a.trim()).filter(a => a)

  // --- Preparar FormData ---
  const formData = new FormData()
  formData.append("titulo", investigacionEditando.value.titulo)
  formData.append("resumen", investigacionEditando.value.resumen)
  formData.append("descripcion", investigacionEditando.value.descripcion)
  formData.append("programa", investigacionEditando.value.programa)
  formData.append("fecha", investigacionEditando.value.fecha)
  formData.append("uri", investigacionEditando.value.uri)
  formData.append("keywords", investigacionEditando.value.keywords)
  formData.append("autores", JSON.stringify(investigacionEditando.value.autores))

  if (pdfSeleccionado) {
    formData.append("pdf", pdfSeleccionado)
  }

  try {
    const res = await fetch("/api/subir_pdf", {
      method: "POST",
      body: formData
    })

    const data = await res.json()
    console.log("Respuesta del servidor:", data)

    if (data.ok) {
      investigaciones.value.push(data.investigacion)
      cerrarModal()
    } else {
      console.error("Error al guardar:", data.error)
    }
  } catch (err) {
    console.error("Error de red:", err)
  }
}

function eliminarInvestigacion(index) {
  investigaciones.value.splice(index, 1)
}

function formatDate(fecha) {
  return fecha ? new Date(fecha).toLocaleDateString() : ''
}
</script>
