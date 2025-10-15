<template>
  <main>
    <!-- Loading inicial -->
    <div
      v-if="cargandoAutor"
      class="w-11/12 xl:w-3/5 mx-auto my-12 flex justify-center"
    >
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <template v-else-if="autor">
      <!-- Perfil del autor -->
      <div class="mb-12 w-11/12 xl:w-3/5 mx-auto my-12">
        <div class="bg-white rounded-xl shadow-lg overflow-hidden">
          <!-- Banner del perfil -->
          <div
            class="relative h-48 bg-gradient-to-r from-blue-600 to-indigo-700"
          >
            <div class="absolute inset-0 bg-black bg-opacity-20">
              <img
                class="object-cover w-full h-full"
                src="https://t3.ftcdn.net/jpg/03/73/78/44/360_F_373784438_lEuzytWcTtLRdZ9CFks7I81yG3lOiSWK.jpg"
                alt="Banner"
              />
            </div>
            <div class="absolute -bottom-16 left-8">
              <img
                :src="autor.foto"
                alt="Foto de perfil"
                class="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover"
              />
            </div>
          </div>

          <!-- Información del autor -->
          <div class="pt-20 px-8 pb-8">
            <div
              class="flex flex-col md:flex-row md:items-center md:justify-between"
            >
              <div>
                <h1 class="text-3xl font-bold text-gray-900">
                  {{ autor.nombre }}
                </h1>
                <p class="text-gray-600 mt-1 flex items-center">
                  <span class="mdi mdi-email text-black/25 pr-1"></span>
                  {{ autor.correo }}
                </p>
              </div>
            </div>

            <!-- Biografía -->
            <div class="mt-6">
              <h2 class="text-xl font-semibold text-gray-800 mb-2">
                Biografía
              </h2>
              <p class="text-gray-600 leading-relaxed max-w-3xl">
                {{ autor.biografia }}
              </p>
            </div>

            <!-- Estadísticas y redes sociales -->
            <div
              class="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between"
            >
              <div class="flex space-x-8 mb-4 sm:mb-0">
                <div class="text-center">
                  <p class="text-2xl font-bold text-blue-500">
                    {{ totalPublicaciones }}
                  </p>
                  <p class="text-sm text-gray-500">Publicaciones</p>
                </div>
              </div>

              <div class="flex space-x-4">
                <a
                  href="https://twitter.com/luis_dev"
                  target="_blank"
                  class="text-blue-400 hover:text-blue-600 transition-colors text-3xl"
                >
                  <span class="mdi mdi-twitter"></span>
                </a>
                <a
                  href="https://linkedin.com/in/luisalfaro"
                  target="_blank"
                  class="text-blue-700 hover:text-blue-900 transition-colors text-3xl"
                >
                  <span class="mdi mdi-linkedin"></span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sección de publicaciones -->
      <section class="mb-12 w-11/11 xl:w-3/5 mx-auto my-12">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl font-bold">Publicaciones</h2>
          <span class="text-sm text-gray-500">
            Mostrando {{ publicacionesMostradas.length }} de
            {{ totalPublicaciones }}
          </span>
        </div>

        <!-- Loading publicaciones -->
        <div
          v-if="cargandoPublicaciones && publicacionesMostradas.length === 0"
          class="flex justify-center py-12"
        >
          <span class="loading loading-spinner loading-lg"></span>
        </div>

        <!-- Grid de publicaciones -->
        <div
          v-else-if="publicacionesMostradas.length > 0"
          class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8 py-8"
        >
          <card-publicacion
            v-for="publicacion in publicacionesMostradas"
            :key="publicacion._id"
            :publicacion="publicacion"
          />
        </div>

        <!-- Sin publicaciones -->
        <div v-else class="text-center py-12">
          <p class="text-gray-500">Este autor no tiene publicaciones aún</p>
        </div>

        <!-- Botón cargar más -->
        <div v-if="hayMasPublicaciones" class="flex justify-center mt-8">
          <button
            @click="cargarMas"
            :disabled="cargandoPublicaciones"
            class="btn btn-primary"
          >
            <span
              v-if="cargandoPublicaciones"
              class="loading loading-spinner loading-sm"
            ></span>
            <span v-else class="mdi mdi-reload"></span>
            {{ cargandoPublicaciones ? "Cargando..." : "Cargar más" }}
          </button>
        </div>
      </section>
    </template>

    <!-- Error -->
    <div v-else class="w-11/12 xl:w-3/5 mx-auto my-12 text-center">
      <p class="text-red-500">No se pudo cargar la información del autor</p>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import CardPublicacion from "../components/CardPublicacion.vue";

// Props
const props = defineProps({
  autorId: {
    type: String,
    required: true,
  },
});

// Estado
const autor = ref(null);
const todasLasPublicaciones = ref([]);
const cargandoAutor = ref(true);
const cargandoPublicaciones = ref(false);
const paginaActual = ref(1);
const publicacionesPorPagina = 1; // Ajusta la cantidad de publicaciones por página

// Computed
const totalPublicaciones = computed(() => todasLasPublicaciones.value.length);

const publicacionesMostradas = computed(() => {
  const fin = paginaActual.value * publicacionesPorPagina;
  return todasLasPublicaciones.value.slice(0, fin);
});

const hayMasPublicaciones = computed(() => {
  return publicacionesMostradas.value.length < totalPublicaciones.value;
});

// Función para obtener el autor
const obtenerAutor = async () => {
  try {
    cargandoAutor.value = true;

    const response = await fetch(
      `/api/gaceta/actualidad/buscar?id=${props.autorId}&coleccion=autores`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    autor.value = await response.json();

    // Después de obtener el autor, cargar sus publicaciones
    await obtenerPublicaciones();
  } catch (error) {
    console.error("Error al obtener autor:", error);
    autor.value = null;
  } finally {
    cargandoAutor.value = false;
  }
};

// Función para obtener todas las publicaciones del autor
const obtenerPublicaciones = async () => {
  try {
    cargandoPublicaciones.value = true;

    if (!autor.value || !autor.value.publicaciones) {
      todasLasPublicaciones.value = [];
      return;
    }

    // Obtener todas las publicaciones en paralelo
    const promesas = autor.value.publicaciones.map(async (publicacion) => {
      try {
        const response = await fetch(
          `/api/gaceta/obtener?id=${publicacion.id}&categoria=${publicacion.tipo}`
        );

        if (!response.ok) {
          console.error(`Error al obtener publicación ${publicacion.id}`);
          return null;
        }

        return await response.json();
      } catch (error) {
        console.error(`Error al obtener publicación ${publicacion.id}:`, error);
        return null;
      }
    });

    const resultados = await Promise.all(promesas);

    // Filtrar publicaciones nulas (las que no se pudieron obtener)
    todasLasPublicaciones.value = resultados.filter((pub) => pub !== null);
  } catch (error) {
    console.error("Error al obtener publicaciones:", error);
    todasLasPublicaciones.value = [];
  } finally {
    cargandoPublicaciones.value = false;
  }
};

// Función para cargar más publicaciones
const cargarMas = () => {
  paginaActual.value++;
};

// Lifecycle
onMounted(() => {
  obtenerAutor();
});
</script>

<style scoped>
/* Agrega estilos personalizados si es necesario */
</style>
