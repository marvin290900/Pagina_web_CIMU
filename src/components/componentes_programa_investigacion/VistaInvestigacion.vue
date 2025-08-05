    <template>
      <div class="mb-6">
        <a href="/investigaciones/programa_de_investigaciones"
          class="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Regresar
        </a>
      </div>

      <div v-if="investigacion" class="grid grid-cols-1 md:grid-cols-3 gap-10">
        <!-- Columna izquierda -->

        <div class="space-y-4 md:col-span-1">
          <img :src="investigacion.imagen" alt="Portada" class="w-full object-cover border rounded shadow" />

          <!-- Archivos -->
          <div v-if="investigacion.archivo" class="text-sm">
            <h2 class="font-semibold text-gray-700 mb-1">Archivos</h2>
            <a :href="investigacion.archivo.url" class="text-blue-600 hover:underline break-all" download>
              {{ investigacion.archivo.nombre }} ({{ investigacion.archivo.peso }})
            </a>
          </div>

          <!-- Fecha -->
          <div>
            <h2 class="font-semibold text-gray-700 text-sm">Fecha</h2>
            <p class="text-gray-600 text-sm">{{ formatDate(investigacion.fecha) }}</p>
          </div>

          <!-- Autores -->
          <div v-if="investigacion.autores?.length">
            <h2 class="font-semibold text-gray-700 text-sm mb-1">Autores</h2>
            <ul class="text-sm text-blue-600 space-y-1">
              <li v-for="(autor, index) in investigacion.autores" :key="index">
                {{ autor }}
              </li>
            </ul>
          </div>

          <!-- Programas -->
          <div v-if="investigacion.programa" class="text-sm">
            <h2 class="font-semibold text-gray-700 mb-1">Programa</h2>
            <p class="text-gray-600">{{ investigacion.programa.toUpperCase() }}</p>

          </div>

        </div>

        <!-- Columna derecha -->
        <div class="md:col-span-2 space-y-6">
          <h1 class="text-3xl font-bold text-gray-900">{{ investigacion.titulo }}</h1>

          <!-- Resumen -->
          <div>
            <h2 class="font-semibold text-lg text-gray-800">Descripcion</h2>
            <p class="text-gray-700 prose prose-md whitespace-pre-line leading-relaxed text-justify">
              {{ investigacion.descripcion }}
            </p>
          </div>

          <div>
            <h2 class="font-semibold text-lg">Archivos</h2>

            <div v-if="investigacion.archivos?.length">
              <ul class="list-disc pl-5 space-y-1">
                <li v-for="(archivo, index) in investigacion.archivos" :key="index">
                  <a :href="archivo" target="_blank"
                    class="text-blue-800 visited:text-purple-800 hover:underline break-all">
                    {{ archivo }}
                  </a>
                </li>
              </ul>
            </div>

            <p v-else class="text-gray-500">No hay archivos disponibles.</p>
          </div>




        </div>
      </div>

      <div v-else-if="error" class="text-center py-10 text-red-600 text-lg">
        {{ error }}
      </div>

      <div v-else class="text-center py-10 text-gray-500 text-lg">
        Cargando investigación...
      </div>
    </template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const error = ref(null)

// Props
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

// Datos reactivos
const investigacion = ref(null)

const formatDate = (fecha) => {
  return new Date(fecha).toLocaleDateString('es-SV', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}


// Función para obtener la investigación desde el backend
const obtenerInvestigacion = async () => {
  try {
    const res = await fetch(`http://68.183.19.227:5984/investigaciones/${props.id}`, {
      headers: {
        "Authorization": "Basic " + btoa("admin:am191392120")
      }
    });

    if (!res.ok) {
      if (res.status === 404) {
        error.value = 'Investigación no encontrada.'
      } else {
        error.value = `Error al cargar: ${res.status} ${res.statusText}`
      }
      investigacion.value = null
      return
    }

    investigacion.value = await res.json()
    error.value = null // Limpia cualquier error anterior
    console.log('Investigación cargada:', investigacion.value)

  } catch (err) {
    console.error('Error de red:', err)
    error.value = 'Error de red al obtener la investigación.'
    investigacion.value = null
  }
}

// Llamada al cargar
onMounted(obtenerInvestigacion)
watch(() => props.id, obtenerInvestigacion)
</script>
