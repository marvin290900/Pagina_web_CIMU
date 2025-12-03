<template>
  <div
    class="w-11/12 pt-6 mx-auto gap-4 flex justify-start items-center md:flex-row flex-col"
  >
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
      <span class="text-sm text-gray-500">
        {{ totalPublicaciones }} publicaciones
      </span>
    </div>
  </div>

  <!-- Loading state inicial -->
  <div
    v-if="cargando && publicaciones.length === 0"
    class="w-11/12 py-6 mx-auto flex justify-center"
  >
    <span class="loading loading-spinner loading-lg"></span>
  </div>

  <!-- Publicaciones -->
  <div
    v-else-if="publicaciones.length > 0"
    class="w-11/12 py-6 mx-auto grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8"
  >
    <card-publicacion
      v-for="publicacion in publicaciones"
      :key="publicacion._id"
      :publicacion="publicacion"
    />
  </div>

  <!-- Sin resultados -->
  <div v-else class="w-11/12 py-6 mx-auto text-center">
    <p class="text-gray-500">
      No se encontraron publicaciones para el año {{ anioSelected }}
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
</template>

<script setup>
///NOTA: LOS AÑOS DEBEN APARTIR DE 2025 HACIA ATRAS, SIENDO EL 2025 EL AÑO DE INICIO DE LA GACETA. HAY QUE MODIFICARLO MANUALMENTE EN LA FUNCION OBTENERANOS
import { ref, onMounted } from "vue";
import CardPublicacion from "./components/CardPublicacion.vue";

const publicaciones = ref([]);
const anioSelected = ref(null);
const dropdownRef = ref(null);
const cargando = ref(false);
const paginaActual = ref(1);
const publicacionesPorPagina = 10; // ajustar las publicaciones por página
const totalPublicaciones = ref(0);
const todasLasPublicaciones = ref([]); // Cache de todas las publicaciones filtradas

// Props
const props = defineProps({
  coleccion: {
    type: String,
    required: true,
  },
});

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

// Función para obtener publicaciones
const obtenerPublicaciones = async (resetear = true) => {
  try {
    cargando.value = true;

    // Si es un reseteo, limpiar todo
    if (resetear) {
      paginaActual.value = 1;
      publicaciones.value = [];
      todasLasPublicaciones.value = [];
    }

    const url = `/api/gaceta/obtener?categoria=${props.coleccion}&anio=${anioSelected.value}`;

    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const json = await res.json();
    todasLasPublicaciones.value = json.rows.map((i) => i.doc);
    totalPublicaciones.value = todasLasPublicaciones.value.length;

    // Cargar primera página
    cargarPagina();
  } catch (error) {
    console.error("Error al obtener datos:", error);
    publicaciones.value = [];
    totalPublicaciones.value = 0;
  } finally {
    cargando.value = false;
  }
};

// Función para cargar una página específica
const cargarPagina = () => {
  const inicio = 0;
  const fin = paginaActual.value * publicacionesPorPagina;

  publicaciones.value = todasLasPublicaciones.value.slice(inicio, fin);

  // Verificar si hay más publicaciones
  hayMasPublicaciones.value = fin < todasLasPublicaciones.value.length;
};

// Función para cargar más publicaciones
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

  // Obtener publicaciones del año seleccionado
  obtenerPublicaciones(true);
};

onMounted(() => {
  obtenerPublicaciones();
});
</script>

<style lang="scss" scoped></style>
