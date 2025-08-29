<template>
  <section class="p-4">
    <h1 class="text-2xl font-bold mb-6">Panel de Investigaciones</h1>

    <!-- Botón para nueva investigación -->
    <button @click="abrirModalNueva" class="btn btn-success mb-4">+ Nueva Investigación</button>

    <!-- Lista temporal de investigaciones -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="(inv, index) in investigaciones" :key="index" class="card bg-base-100 shadow-md">
        <figure>
          <img v-if="inv.imagenURL" :src="inv.imagenURL" alt="thumbnail" class="object-cover h-48 w-full" />
          <div v-else class="h-48 w-full flex items-center justify-center bg-gray-100 text-gray-500">PDF</div>
        </figure>
        <div class="card-body">
          <h2 class="card-title">{{ inv.titulo }}</h2>
          <p><strong>Autores:</strong> {{ inv.investigadores?.join(", ") }}</p>
          <p><strong>Programa:</strong> {{ inv.programa }}</p>
          <p><strong>Fecha:</strong> {{ formatDate(inv["Fecha de publicacion"]) }}</p>
          <p v-if="inv.pdfURL" class="truncate">📄 <a :href="inv.pdfURL" target="_blank" class="text-blue-500 underline">Ver PDF</a></p>
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
          <input v-model="keywordsInput" type="text" placeholder="Palabras Claves* (ej: A,B,C)" class="input input-bordered w-full"
            required />

          <label class="label">Subir PDF</label>
          <input type="file" ref="pdfInput" @change="handleFileUpload" accept="application/pdf"
            class="file-input file-input-bordered w-full" />

          <div v-if="pdfSeleccionado" class="flex items-center gap-3">
            <div class="flex-1 text-sm text-gray-600">📄 {{ pdfSeleccionado.name }} ({{ humanFileSize(pdfSeleccionado.size) }})</div>
            <div class="text-sm">{{ uploadStatus }}</div>
          </div>

          <div v-if="uploading" class="w-full bg-gray-200 h-2 rounded overflow-hidden">
            <div class="h-2 bg-blue-500" :style="`width: ${uploadProgress}%`"></div>
          </div>

          <img v-if="previewImage" :src="previewImage" class="mt-2 w-full h-48 object-cover rounded" />
        </div>

        <div class="modal-action">
          <button type="button" class="btn btn-outline" @click="cerrarModal">Cancelar</button>
          <button :disabled="saving" type="submit" class="btn btn-primary">{{ saving ? 'Guardando...' : (investigacionEditando.index !== null ? 'Actualizar' : 'Guardar') }}</button>
        </div>
      </form>
    </dialog>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const investigaciones = ref([])
const investigacionEditando = ref({ titulo: '', descripcion: '', resumen: '', investigadores: [], programa: '', fecha: '', pdfURL: '', imagenURL: '', index: null, URI: '', 'palabras clave': '' })
const autoresInput = ref('')
const keywordsInput = ref('')
const previewImage = ref(null)
const modal = ref(null)
let pdfSeleccionado = null

const uploading = ref(false)
const uploadProgress = ref(0)
const uploadStatus = ref('')
const saving = ref(false)

function abrirModalNueva() {
  investigacionEditando.value = { titulo: '', descripcion: '', resumen: '', investigadores: [], programa: '', fecha: '', pdfURL: '', imagenURL: '', index: null, URI: '', 'palabras clave': '' }
  autoresInput.value = ''
  keywordsInput.value = ''
  previewImage.value = null
  pdfSeleccionado = null
  uploading.value = false
  uploadProgress.value = 0
  uploadStatus.value = ''
  modal.value.showModal()
}

function cerrarModal() {
  modal.value.close()
}

function editarInvestigacion(inv, index) {
  investigacionEditando.value = { ...inv, index }
  autoresInput.value = (inv.investigadores || []).join(', ')
  keywordsInput.value = inv['palabras clave'] || ''
  previewImage.value = inv.imagenURL || null
  modal.value.showModal()
}

function handleFileUpload(event) {
  const file = event.target.files[0]
  if (!file) return
  if (file.type !== 'application/pdf') {
    pdfSeleccionado = null
    uploadStatus.value = 'Archivo no permitido'
    return
  }
  pdfSeleccionado = file
  previewImage.value = null // will be set after upload (thumbnail)
  uploadStatus.value = 'Listo para subir'
}

function humanFileSize(bytes) {
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return (bytes / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'KB', 'MB', 'GB'][i]
}

async function uploadPdfAndGetUrls() {
  if (!pdfSeleccionado) return { pdfURL: null, imagenURL: null }
  const fd = new FormData()
  fd.append('pdf', pdfSeleccionado)
  fd.append('carpeta', 'investigaciones')

  uploading.value = true
  uploadProgress.value = 0
  uploadStatus.value = 'Subiendo PDF...'

  // usar fetch con XHR like progress requires XMLHttpRequest
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/api/subir_pdf')

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        uploadProgress.value = Math.round((e.loaded / e.total) * 100)
      }
    }

    xhr.onload = () => {
      uploading.value = false
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText)
          if (!res.ok) return reject(new Error(res.error || 'Upload failed'))
          // soportar varias formas de respuesta
          const pdfURL = res.pdfUrl || res.url || res.pdf || res.pdfURL
          const imagenURL = res.thumbnailUrl || res.thumbnail || res.imagenURL || res.thumbnailUrl
          resolve({ pdfURL, imagenURL })
        } catch (err) {
          reject(err)
        }
      } else {
        reject(new Error('Error subiendo PDF: ' + xhr.status))
      }
    }

    xhr.onerror = () => {
      uploading.value = false
      reject(new Error('Error de red al subir PDF'))
    }

    xhr.send(fd)
  })
}

async function guardarInvestigacion() {
  // validaciones básicas en cliente
  if (!investigacionEditando.value.titulo || !autoresInput.value.trim() || !investigacionEditando.value.fecha) {
    alert('Completa los campos obligatorios: título, autores y fecha')
    return
  }

  saving.value = true
  try {
    // preparar autores
    investigacionEditando.value.investigadores = autoresInput.value.split(',').map(a => a.trim()).filter(Boolean)

    // 1) subir PDF y obtener URLs (si hay pdf seleccionado)
    const { pdfURL, imagenURL } = await uploadPdfAndGetUrls().catch(err => { throw err })

    if (pdfURL) investigacionEditando.value.pdfURL = pdfURL
    if (imagenURL) {
      investigacionEditando.value.imagenURL = imagenURL
      previewImage.value = imagenURL
    }

    // 2) armar objeto JSON que espera Zod (claves exactas)
    const body = {
      titulo: investigacionEditando.value.titulo,
      resumen: investigacionEditando.value.resumen,
      descripcion: investigacionEditando.value.descripcion,
      programa: investigacionEditando.value.programa,
      investigadores: investigacionEditando.value.investigadores,
      "Fecha de publicacion": investigacionEditando.value.fecha, // YYYY-MM-DD from input
      URI: investigacionEditando.value.URI || '',
      "palabras clave": keywordsInput.value || '',
      imagenURL: investigacionEditando.value.imagenURL || '',
      pdfURL: investigacionEditando.value.pdfURL || '',
      metadata: {
        UploadDate: new Date().toISOString(),
        LastChange: new Date().toISOString()
      }
    }

    // 3) enviar JSON al endpoint validado por Zod
    const res = await fetch('/api/investigaciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    const data = await res.json()
    if (!res.ok || !data.ok) {
      console.error('Error del servidor:', data)
      alert('Error guardando investigación: ' + (data.error ? JSON.stringify(data.error) : res.statusText))
      return
    }

    // añadir a lista local (usar el objeto normalizado que enviaste)
    investigaciones.value.push(body)
    cerrarModal()
  } catch (err) {
    console.error('Error:', err)
    alert('Error: ' + err.message)
  } finally {
    saving.value = false
    uploading.value = false
    uploadProgress.value = 0
  }
}

function eliminarInvestigacion(index) {
  investigaciones.value.splice(index, 1)
}

function formatDate(fecha) {
  return fecha ? new Date(fecha).toLocaleDateString() : ''
}
</script>

<style scoped>
.modal::backdrop { background: rgba(0,0,0,0.5); }
</style>
