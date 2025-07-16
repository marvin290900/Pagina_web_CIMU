<template>
  <section id="seccion_investigacion" class="px-2 bg-white md:px-15">
    <div class="py-8 text-2xl text-gray-600 mt-4">
      <div class="mb-4"><span class="mdi mdi-filter"></span> Filtrar</div>
      <div class="inline-flex flex-col md:flex-row w-full items-stretch md:items-end md:gap-1 gap-4">
        <button
          @click="modo = 'recientes'"
          :disabled="modo === 'recientes'"
          :class="modo === 'recientes'
            ? 'bg-primary text-white'
            : 'bg-gray-200 text-gray-700'"
          class="flex-1 btn btn-xl px-10 py-3 text-lg rounded-l"
        >Recientes</button>

        <button
          @click="modo = 'todo'"
          :disabled="modo === 'todo'"
          :class="modo === 'todo'
            ? 'bg-primary text-white'
            : 'bg-gray-200 text-gray-700'"
          class="flex-1 btn btn-xl px-10 py-3 text-lg rounded-r"
        >Todas</button>

        <div class="flex-1 flex flex-col ml-4">
          <label for="filtroProgramas" class="text-base text-gray-700 mb-1">Por programas</label>
          <select id="filtroProgramas" v-model="programa" class="p-2 border rounded">
            <option value="">Todos</option>
            <option value="sociologico">Sociológicos</option>
            <option value="juridico">Jurídicos</option>
            <option value="medio_ambiente">Medio Ambiente</option>
            <option value="inclusion">Inclusión</option>
            <option value="laboratorio_publica">Laboratorio Pública</option>
          </select>
        </div>
      </div>

      <!-- Tarjetas de investigaciones -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <div
          v-for="investigacion in investigaciones"
          :key="investigacion._id"
        >
          <a
            @click.prevent="handleClick(investigacion)"
            class="block border rounded-xl overflow-hidden shadow-lg hover:shadow-xl transform transition-transform duration-300 hover:scale-105 cursor-pointer"
          >
            <img
              v-if="investigacion.imagen"
              :src="investigacion.imagen"
              alt="Imagen de investigación"
              class="w-full h-48 object-cover"
            />
            <div class="p-4">
              <h3 class="font-semibold text-lg text-gray-800">{{ investigacion.titulo }}</h3>
              <p class="text-sm text-gray-600 mt-1">{{ investigacion.programa }}</p>
              <p class="text-sm text-gray-500 mt-2">{{ formatDate(investigacion.fecha) }}</p>
              <p
                v-if="investigacion.description"
                class="text-sm text-gray-700 mt-2 line-clamp-3 overflow-hidden"
              >
                {{ investigacion.description }}
              </p>
            </div>
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, watchEffect } from 'vue'

// Estados reactivos
const modo = ref('todo')
const programa = ref('')
const investigaciones = ref([ 
  // Datos de ejemplo, reemplazar con datos reales
  { _id: '1', titulo: 'Investigación A', programa: 'Sociológicos', fecha: '2023-10-01', imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPHvG2-NVd8j7oQbPH3eHEAGvbn9-apLCM7A&s', description: 'Descripción de la investigación A' },
  { _id: '2', titulo: 'Investigación B', programa: 'Jurídicos', fecha: '2023-09-15', imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9KGeu4iNFo2O-3nRh1XRlbPIRdohKkfT91Q&s',  description: 'Descripción de la investigación B' },
  { _id: '3', titulo: 'Investigación C', programa: 'Medio Ambiente', fecha: '2023-08-20', imagen: 'https://tesisdoctoralesonline.com/wp-content/uploads/2021/12/Tipos-de-metodologias-de-investigacion-como-identificarlas-1.jpg', description: 'Descripción de la investigación C' },
  { _id: '4', titulo: 'Investigación D', programa: 'Inclusión', fecha: '2023-07-10', imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ1b2k5j6Z7J8a5gXy1Y2c9f3s4x8z6k5m7wA&s', description: 'Descripción de la investigación D' },
  { _id: '5', titulo: 'Investigación E', programa: 'Laboratorio Pública', fecha: '2023-06-05', imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9KGeu4iNFo2O-3nRh1XRlbPIRdohKkfT91Q&s', description: 'Descripción de la investigación E' }
]);

// Formateo de fecha
function formatDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

// Carga de datos
async function cargar() {
  // let url = `/api/investigaciones?modo=${modo.value}`
  // if (programa.value) url += `&programa=${programa.value}`
  // const res = await fetch(url)
  // investigaciones.value = await res.json()
}

// Manejar click en tarjeta
function handleClick(investigacion) {
  // Ejemplo: navegar a detalle de investigación
  window.location.href = `/investigaciones/${investigacion._id}`
}

// Recarga cuando cambian filtros
watchEffect(cargar)
</script>

<style scoped>
.bg-primary {
  background-color: var(--color-primary);
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
