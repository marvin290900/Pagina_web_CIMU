<template>
  <div class="w-11/12 sm:w-[80%] mx-auto">
    <!-- input de busqueda -->
    <div class="flex items-center gap-3 py-5">
      <details ref="dropdownRef" class="dropdown">
        <summary class="btn m-1">
          <span class="mdi mdi-filter"></span>
          Filtrar por año
          <div v-if="anioSelected" class="badge badge-soft mx-2.5">
            {{ anioSelected }}
          </div>
        </summary>
        <ul
          class="menu dropdown-content bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm"
        >
          <li v-for="anio in obtenerAnos(2018)" :key="anio">
            <a
              @click="seleccionarAnio(anio)"
              :class="{ active: anio === anioSelected }"
            >
              {{ anio }}
            </a>
          </li>
        </ul>
      </details>

      <div>
        <p class="text-gray-500 text-xs">{{ libros.length }} investigaciones</p>
      </div>
    </div>

    <div
      v-if="cargando"
      class="w-full flex justify-center items-center h-[45vh]"
    >
      <div>
        <span class="loading loading-spinner loading-xl"></span>
        Cargando
      </div>
    </div>

    <!-- Grid de libros -->
    <div v-else-if="libros.length > 0">
      <h2
        class="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5"
      >
        Nuestras investigaciones
      </h2>

      <div
        class="grid grid-cols-[repeat(auto-fit,minmax(175px,300px))] gap-16 p-4 cursor-pointer justify-start"
      >
        <div
          v-for="(investigacion, index) in libros"
          :key="index"
          class="flex flex-col gap-3 pb-3 group"
        >
          <div class="w-full aspect-[3/4] rounded-lg overflow-hidden relative">
            <a :href="`/publicaciones/multidisciplinaria/${investigacion._id}`">
              <!-- Modifica la variable de portada_libro por portada -->
              <img
                :src="investigacion.portada_libro"
                alt=""
                class="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-75"
              />
              <div
                class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              ></div>
            </a>
          </div>
          <div>
            <p class="font-medium text-xl">
              {{ investigacion.titulo }}
            </p>
            <p class="text-[#637488] text-sm font-normal leading-normal">
              {{ investigacion.editorial }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Sin resultados -->
    <div v-else class="w-11/12 py-6 mx-auto text-center">
      <div class="flex justify-center">
        <span class="mdi mdi-book-alert-outline text-5xl text-gray-500"></span>
      </div>
      <p class="text-gray-500">
        No se encontraron libros para el año {{ anioSelected }}
      </p>
    </div>

    <!-- Botón cargar más -->
    <div
      v-if="hayMasPublicaciones"
      class="w-11/12 mx-auto flex justify-center pb-8"
    >
      <button
        @click="cargarMas"
        :disabled="cargando"
        class="btn bg-red-600 text-white hover:bg-red-700"
      >
        <span v-if="cargando" class="loading loading-spinner loading-sm"></span>
        <span v-else class="mdi mdi-reload"></span>
        {{ cargando ? "Cargando..." : "Cargar más" }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";

const libros = ref([]);
const cargando = ref(true);
const anioSelected = ref(null);
const dropdownRef = ref(null);
const paginaActual = ref(1);
const librosPorPagina = 2; // ajustar las libros por página
const totallibros = ref(0);
const todosLosLibros = ref([]); // Cache de todas las publicaciones filtradas

// Inicializar con el año actual
anioSelected.value = new Date().getFullYear();

// Función para calcular los años transcurridos
const obtenerAnos = (anoInicio) => {
  const anoActual = new Date().getFullYear();
  const anos = [];

  for (let ano = anoActual; ano >= anoInicio; ano--) {
    anos.push(ano);
  }

  return anos;
};

// Variable para verificar si hay más publicaciones
const hayMasPublicaciones = ref(false);

// Función para cargar una página específica
const cargarPagina = () => {
  const inicio = 0;
  const fin = paginaActual.value * librosPorPagina;

  libros.value = todosLosLibros.value.slice(inicio, fin);

  // Verificar si hay más libros
  hayMasPublicaciones.value = fin < todosLosLibros.value.length;
};

// Función para cargar más libros
const cargarMas = () => {
  paginaActual.value++;
  cargarPagina();
};

// Función para seleccionar año
const seleccionarAnio = (anio) => {
  anioSelected.value = anio;

  // Cerrar el dropdown
  if (dropdownRef.value) {
    dropdownRef.value.open = false;
  }

  // Obtener libros del año seleccionado
  obtenerLibros(true);
};

const obtenerLibros = async (resetear) => {
  try {
    cargando.value = true;

    // Si es un reseteo, limpiar todo
    if (resetear) {
      paginaActual.value = 1;
      libros.value = []; // Resetea el array visible
      todosLosLibros.value = []; // Resetea el cache
    }

    const response = await fetch(
      // Asumo que tu API se llama 'obtener-filtrados'
      "/api/libros/obtener-filtrados?anio=" + anioSelected.value
    );
    if (!response.ok) {
      throw new Error("Error al obtener los libros");
    }
    const dataLibros = await response.json();
    console.log("Datos recibidos:", dataLibros);

    // --- ESTA ES LA CORRECCIÓN ---
    // Tu API _find ya devuelve el array de documentos, no necesitas .map
    todosLosLibros.value = dataLibros;
    // ----------------------------

    totallibros.value = todosLosLibros.value.length;

    // Cargar primera página
    cargarPagina();
    console.log("Libros obtenidos:", libros.value.length);
    console.log("Contenido de libros:", libros.value); // Revisa qué hay aquí
  } catch (error) {
    console.error(error);
  } finally {
    cargando.value = false;
  }
};

onMounted(() => {
  obtenerLibros();
});
</script>
