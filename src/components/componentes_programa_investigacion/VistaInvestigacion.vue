    <template>
    <div v-if="investigacion" class="grid grid-cols-1 md:grid-cols-3 gap-10">
        <!-- Columna izquierda -->
        <div class="space-y-4 md:col-span-1">
        <img
            v-if="investigacion.imagen"
            :src="investigacion.imagen"
            alt="Portada"
            class="w-full object-cover border rounded shadow"
        />

        <!-- Archivos -->
        <div v-if="investigacion.archivo" class="text-sm">
            <h2 class="font-semibold text-gray-700 mb-1">Archivos</h2>
            <a
            :href="investigacion.archivo.url"
            class="text-blue-600 hover:underline break-all"
            download
            >
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

        <!-- Palabras clave -->
        <div v-if="investigacion.keywords?.length">
            <h2 class="font-semibold text-gray-800 text-sm">Palabras clave</h2>
            <p class="text-gray-600 text-sm">{{ investigacion.keywords.join(', ') }}</p>
        </div>

        <!-- URI -->
        <div v-if="investigacion.uri">
            <h2 class="font-semibold text-gray-800 text-sm">URI</h2>
            <a :href="investigacion.uri" class="text-blue-600 text-sm hover:underline break-all" target="_blank">
            {{ investigacion.uri }}
            </a>
        </div>

        <!-- Programa -->
        <div>
            <h2 class="font-semibold text-gray-800 text-sm">Colecciones</h2>
            <p class="text-blue-700 text-sm">{{ investigacion.programa }}</p>
        </div>
        </div>
    </div>

    <div v-else class="text-center py-10 text-gray-500 text-lg">
        Cargando investigación...
    </div>
    </template>

<script setup>
import { ref, onMounted, watch } from 'vue'

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
investigacion.value =
  {
  _id: "abc123",
  titulo: "Construcción de marca para la ciudad de Apaneca...",
  descripcion: "Lorem ipsum dolor sit amet consectetur adipiscing elit sem montes commodo, dignissim tortor hendrerit donec lobortis mattis tellus \n enim ut natoque torquent, a felis magnis aptent nunc cum porta luctus pellentesque. Ad tortor habitasse montes sem auctor primis dictum penatibus, urna erat massa neque nisl nam sapien, iaculis blandit velit nisi lacus cursus parturient. Volutpat dapibus cursus a lectus rutrum fusce nunc fringilla nam augue magnis, duis vulputate felis sollicitudin ornare cum mus penatibus vel etiam, vestibulum class egestas tortor \n congue curabitur massa iaculis fermentum eleifend Egestas at aliquam libero leo integer accumsan litora dapibus, potenti fusce commodo netus facilisis turpis natoque, sem risus inceptos conubia sodales quam maecenas. Fringilla sapien himenaeos leo habitant per nullam iaculis class orci sodales integer eros massa, senectus purus primis placerat vulputate viverra odio rutrum eget consequat ac vivamus, lectus congue metus semper volutpat ligula feugiat mollis cum eleifend commodo lacus. Erat torquent nascetur hac netus phasellus, duis scelerisque accumsan tempor, himenaeos velit tortor euismod.",
  fecha: "2021-11-01",
  imagen: "https://tesisdoctoralesonline.com/wp-content/uploads/2021/12/Tipos-de-metodologias-de-investigacion-como-identificarlas-1.jpg",
  archivo: {
    nombre: "DOCUMENTO_APANECA.pdf",
    url: "/uploads/DOCUMENTO_APANECA.pdf",
    peso: "30.45 MB"
  },
  autores: ["Calderón Ramos, Ramón Alberto", "Linares Ramos, Estefany Geraldina"],
  keywords: ["Marca", "urbanismo", "apaneca", "estrategia"],
  uri: "https://hdl.handle.net/20.500.14492/20797",
  programa: "Arquitectura"
}

// Función para obtener la investigación desde el backend
const obtenerInvestigacion = async () => {
//   try {
    
//     investigacion.value = await res.json()
//   } catch (err) {
//     console.error('Error al obtener la investigación:', err)
//   }
}

// Llamada al cargar
onMounted(obtenerInvestigacion)
watch(() => props.id, obtenerInvestigacion)
</script>
