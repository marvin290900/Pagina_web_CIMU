<template>
  <section class="p-4">
    <h1 class="text-2xl font-bold mb-6">Panel de Investigaciones</h1>

    <!-- Botón para nueva investigación -->
    <button @click="abrirModalNueva" class="btn btn-success mb-4">+ Nueva Investigación</button>

    <!-- Lista temporal de investigaciones -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="(inv, index) in investigaciones" :key="index" class="card bg-base-100 shadow-md">
        <figure class="bg-gray-50 overflow-hidden rounded">
          <img v-if="inv.doc.imagenURL" :src="inv.doc.imagenURL" alt="thumbnail"
            class="w-full h-48 object-contain object-center bg-white" loading="lazy" decoding="async" />
          <div v-else class="h-48 w-full flex items-center justify-center bg-gray-100 text-gray-500">PDF</div>
        </figure>
        <div class="card-body">
          <h2 class="card-title">{{ inv.doc.titulo }}</h2>
          <p><strong>Autores:</strong> {{ inv.doc.investigadores?.join(", ") }}</p>
          <p><strong>Programa:</strong> {{ inv.doc.programa }}</p>
          <p><strong>Fecha:</strong> {{ formatDate(inv.doc.fecha_publicacion) }}</p>
          <p v-if="inv.doc.pdfURL" class="truncate">📄 <a :href="inv.doc.pdfURL" target="_blank"
              class="text-blue-500 underline">Ver PDF</a></p>
          <div class="card-actions justify-end">
            <button @click="editarInvestigacion(inv, index)" class="btn btn-sm btn-info">Editar</button>
            <button @click="abrirConfirm" class="btn btn-sm btn-error">Eliminar</button>
            <input type="checkbox" id="confirm-modal" class="modal-toggle" v-model="showModal">
    <div class="modal">
      <div class="modal-box">
        <h3 class="font-bold text-lg">¿Estás seguro?</h3>
        <p class="py-4">Esta acción no se puede deshacer.</p>
        <div class="modal-action">
          <button class="btn" @click="cancelar">Cancelar</button>
          <button class="btn btn-error" @click="confirmar(index)">Sí, eliminar</button>
        </div>
      </div>
    </div>
   
    <div v-if="visible" :class="['toast fixed top-5 right-5 z-50', tipoClase]" @click="cerrarToast">
      <div>
        <span>{{ mensaje }}</span>
      </div>
    </div>
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

          <textarea v-model="investigacionEditando.descripcion" maxlength="1000"
            class="textarea textarea-bordered w-full min-h-[120px]"
            placeholder="Escribe aquí la descripción completa de la investigación..." required></textarea>
          <p class="text-sm text-gray-500">{{ investigacionEditando.descripcion.length }}/1000 caracteres</p>

          
          <div ref="dropdownRef">
            <!-- Input de búsqueda -->
            <input type="text" v-model="search" placeholder="Investigadores...*" class="input input-bordered w-full mb-2"
              @focus="showDropdown = true" />

            <!-- Lista desplegable -->
            <ul v-if="showDropdown && filteredOptions.length"
              class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-full mt-1 max-h-48 overflow-y-auto">
              <li v-for="(option, index) in filteredOptions" :key="index">
                <button class="w-full text-left" @click="selectOption(option)">
                  {{ option }}
                </button>
              </li>
            </ul>

            <!-- Opciones seleccionadas -->
            <div class="flex flex-wrap gap-2 mt-3">
              <div v-for="(item, index) in selected" :key="index" class="badge badge-primary gap-2">
                {{ item }}
                <button class="btn btn-xs btn-circle btn-ghost" @click="removeOption(index)">
                  ✕
                </button>
              </div>
            </div>
          </div>

          <select v-model="investigacionEditando.programa" class="select select-bordered w-full" required>
            <option value="">Selecciona programa</option>
            <option value="sociologico">Sociológicos</option>
            <option value="juridico">Jurídicos</option>
            <option value="medio_ambiente">Medio Ambiente</option>
            <option value="inclusion">Inclusión</option>
            <option value="laboratorio_publica">Laboratorio Pública</option>
          </select>

          <input v-model="investigacionEditando.fecha" type="date" class="input input-bordered w-full" required />

          <input v-model="investigacionEditando.uri" type="text" placeholder="URI (Opcional)"
            class="input input-bordered w-full" />
          <input v-model="keywordsInput" type="text" placeholder="Palabras Claves* (ej: A,B,C)"
            class="input input-bordered w-full" required />

          <label class="label">Subir PDF</label>
          <input type="file" ref="pdfInput" @change="handleFileUpload" accept="application/pdf"
            class="file-input file-input-bordered w-full" />

          <div v-if="pdfSeleccionado" class="flex items-center gap-3">
            <div class="flex-1 text-sm text-gray-600">📄 {{ pdfSeleccionado.name }} ({{
              humanFileSize(pdfSeleccionado.size) }})</div>
            <div class="text-sm">{{ uploadStatus }}</div>
          </div>

          <div v-if="uploading" class="w-full bg-gray-200 h-2 rounded overflow-hidden">
            <div class="h-2 bg-blue-500" :style="`width: ${uploadProgress}%`"></div>
          </div>

          <img v-if="previewImage" :src="previewImage" class="mt-2 w-full h-48 object-cover rounded" />
        </div>

        <div class="modal-action">
          <button type="button" class="btn btn-outline" @click="cerrarModal">Cancelar</button>
          <button :disabled="saving" type="submit" class="btn btn-primary">{{ saving ? 'Guardando...' :
            (investigacionEditando.index !== null ? 'Actualizar' : 'Guardar') }}</button>
        </div>
      </form>
    </dialog>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const investigaciones = ref([])
const investigacionEditando = ref({ titulo: '', descripcion: '', resumen: '', investigadores: [], programa: '', fecha: '', pdfURL: '', imagenURL: '', index: null, URI: '', 'palabras clave': '' })
const autoresInput = ref('')
const keywordsInput = ref('')
const previewImage = ref(null)
const modal = ref(null)
const search = ref("")
const showDropdown = ref(false)
let pdfSeleccionado = null

const uploading = ref(false)
const uploadProgress = ref(0)
const uploadStatus = ref('')
const saving = ref(false)
const dropdownRef = ref(null);
const selected = ref([])
const options = ref([])
const editando = ref(false);
const showModal = ref(false)
const visible = ref(false)
const mensaje = ref('')
const tipoClase = ref('alert alert-info')

function abrirModalNueva() {
  investigacionEditando.value = { titulo: '', descripcion: '', resumen: '', investigadores: [], programa: '', fecha: '', pdfURL: '', imagenURL: '', index: null, URI: '', 'palabras clave': '' }
  selected.value = []
  autoresInput.value = ''
  keywordsInput.value = ''
  previewImage.value = null
  pdfSeleccionado = null
  uploading.value = false
  uploadProgress.value = 0
  uploadStatus.value = ''
  modal.value.showModal()
  editando.value = false;
  
}

function cerrarModal() {
  modal.value.close()
}

async function getInvestigacion() {
   const listRes = await fetch('/api/investigaciones/investigaciones');
    const listJson = await listRes.json();
    if (listRes.ok && listJson.ok) {
      investigaciones.value = listJson.data.rows; // conserva estructura esperada por el template
    }
}

function mostrarToast(texto, tipo = 'neutral', duracion = 3000) {
  const toast = document.createElement('div');
  toast.className = `alert ${tipoClaseDaisy(tipo)} shadow-lg fixed top-5 right-5 z-50`;
  toast.textContent = texto;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, duracion);
}

function tipoClaseDaisy(tipo) {
  switch(tipo) {
    case 'success': return 'alert-success';
    case 'error': return 'alert-error';
    case 'warning': return 'alert-warning';
    default: return 'alert-neutral'; // ya es seguro
  }
}

// Función que abre el confirm
function abrirConfirm() {
  showModal.value = true
}

// Función para cancelar
function cancelar() {
  showModal.value = false
}

// Función para confirmar
async function confirmar(index) {
  showModal.value = false
  const body = {id: investigaciones.value[index].id}
  // Aquí pones la lógica que quieres ejecutar
  
  const res = await fetch('/api/investigaciones/investigaciones', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
  if (res.ok) {
    console.log('¡Confirmado!', res);
    mostrarToast('Investigación eliminada correctamente', 'success');
    getInvestigacion();
  } else {
    console.error('Error al eliminar:', res);
  }
}


// Filtrar por búsqueda y quitar los ya seleccionados
const filteredOptions = computed(() => {
  return options.value.filter(
    (opt) =>
      opt.toLowerCase().includes(search.value.toLowerCase()) &&
      !selected.value.includes(opt)
  )
})

// Seleccionar opción
const selectOption = (option) => {
  selected.value.push(option)
  search.value = "" // limpiar búsqueda
  showDropdown.value = false
}

// Quitar opción
const removeOption = (index) => {
  selected.value.splice(index, 1)
}

function editarInvestigacion(inv, index) {
  investigacionEditando.value = { ...inv.doc, index }
  investigacionEditando.value.fecha = inv.doc.fecha_publicacion   || '' // YYYY-MM-DD

  selected.value = inv.doc.investigadores ? [...inv.doc.investigadores] : []
 

  keywordsInput.value = inv.doc.palabras_clave || ''
   const pk = inv.doc.palabras_clave;
   console.log("No hay palabras clave", pk)
  if (pk.length > 0) {
    keywordsInput.value = pk.join(", ");
     console.log("KEYWORDS INPUT", keywordsInput.value)
  } else {
    
    keywordsInput.value = pk[0] || "";
     
  }

  previewImage.value = inv.doc.imagenURL || null
  modal.value.showModal()
  editando.value = true
  
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
  if (!investigacionEditando.value.titulo || !investigacionEditando.value.fecha || selected.value.length === 0) {
    alert('Completa los campos obligatorios: título, investigadores  y fecha')
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
      investigadores: selected.value,
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

    let res = null;
    if(editando.value && investigacionEditando.value._id){
      // Editando, obtener _id y _rev del doc actual
      body.id = investigacionEditando.value._id
      res = await fetch('/api/investigaciones/investigaciones', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    console.log("RESPUESTA",res)
    }else{
      delete body.id // asegurarse que no hay id
      res = await fetch('/api/investigaciones/investigaciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    }
    
    
    const data = await res.json()
    if (!res.ok || !data.ok) {
      console.error('Error del servidor:', data)
      alert('Error guardando investigación: ' + (data.error ? JSON.stringify(data.error) : res.statusText))
      return
    }else{
      console.log('Investigación guardada:', data)
    }

    getInvestigacion()
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





function formatDate(fecha) {
  return fecha ? new Date(fecha).toLocaleDateString() : ''
}

//Dropdown 
const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
 
    showDropdown.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  
  getInvestigacion()
  // Conseguir investigaciones
 

  // Conseguir Investigadores
  fetch('/api/investigadores/obtener')
    .then(response => response.json())
    .then(data => {
      if (data.ok) {
        console.log('Investigadores obtenidos:', data.docs);
        options.value = data.docs.map(doc => doc.nombre).filter(Boolean);
      } else {
        console.error('Error al obtener investigadores:', data.error);
      }
    })
    .catch(error => {
      console.error('Error de red:', error);
    });

});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
.modal::backdrop {
  background: rgba(0, 0, 0, 0.5);
}
</style>
