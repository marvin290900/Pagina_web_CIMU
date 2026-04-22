<template>
  <div class="w-11/12 mx-auto">
    <div v-if="cargando" class="lg:w-9/12 mx-auto w-full">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold">Publicaciones destacadas</h2>

        <!-- Botones de navegación skeleton -->
        <div class="flex gap-2">
          <div class="skeleton w-8 h-8 rounded-full"></div>
          <div class="skeleton w-8 h-8 rounded-full"></div>
        </div>
      </div>

      <!-- Tarjetas skeleton -->
      <div class="flex overflow-hidden gap-4 pb-4">
        <article
          v-for="i in 3"
          :key="i"
          class="bg-white rounded-2xl shadow-sm border border-gray-100 flex-shrink-0 w-85 md:w-100 min-h-[140px] flex"
        >
          <div class="flex w-full items-center p-6 gap-6">
            <!-- Skeleton para el número -->
            <div class="flex-shrink-0 w-14 flex justify-center items-center">
              <div class="skeleton w-10 h-14 rounded-lg"></div>
            </div>

            <!-- Skeleton para el contenido -->
            <div class="flex-grow">
              <div class="skeleton h-5 md:h-6 w-full mb-3"></div>
              <div class="skeleton h-5 md:h-6 w-4/5 mb-4"></div>
              
              <div class="flex items-center gap-4">
                <div class="skeleton h-4 w-20"></div>
                <div class="skeleton h-4 w-24"></div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>

    <div v-else class="lg:w-9/12 mx-auto w-full">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold">Publicaciones destacadas</h2>

        <!-- Botones de navegación -->
        <div class="flex gap-2">
          <button
            @click="scrollLeft"
            :disabled="isAtStart"
            class="btn btn-circle btn-sm bg-base-200 hover:bg-base-300 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Anterior"
          >
            <span class="mdi mdi-chevron-left text-xl"></span>
          </button>
          <button
            @click="scrollRight"
            :disabled="isAtEnd"
            class="btn btn-circle btn-sm bg-base-200 hover:bg-base-300 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Siguiente"
          >
            <span class="mdi mdi-chevron-right text-xl"></span>
          </button>
        </div>
      </div>

      <!-- Scroll horizontal en todas las pantallas -->
      <div
        ref="scrollContainer"
        @scroll="checkScrollPosition"
        class="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x snap-mandatory scroll-smooth"
      >
        <card-publicacion
          v-for="(publicacion, index) in publicaciones"
          :key="publicacion._id"
          :publicacion="publicacion"
          :index="index + 1"
          class="flex-shrink-0 w-85 md:w-100 snap-start"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import CardPublicacion from "../components/cardPublicacionDestacada.vue";

const publicaciones = ref([]);
const cargando = ref(true);
const scrollContainer = ref(null);
const isAtStart = ref(true);
const isAtEnd = ref(false);

const obtenerPublicaciones = async () => {
  try {
    const res = await fetch(
      "/api/gaceta/obtener_destacados?id=publicacion_destacadas"
    );

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const json = await res.json();
    publicaciones.value = json;
    cargando.value = false;

    // Verificar posición inicial después de cargar
    setTimeout(checkScrollPosition, 100);
  } catch (error) {
    console.error("Error al obtener datos:", error);
  }
};

// Función para hacer scroll a la izquierda
const scrollLeft = () => {
  if (scrollContainer.value) {
    const cardWidth =
      scrollContainer.value.querySelector(".flex-shrink-0")?.offsetWidth || 0;
    const gap = 16; // gap-4 = 16px
    scrollContainer.value.scrollBy({
      left: -(cardWidth + gap),
      behavior: "smooth",
    });
  }
};

// Función para hacer scroll a la derecha
const scrollRight = () => {
  if (scrollContainer.value) {
    const cardWidth =
      scrollContainer.value.querySelector(".flex-shrink-0")?.offsetWidth || 0;
    const gap = 16; // gap-4 = 16px
    scrollContainer.value.scrollBy({
      left: cardWidth + gap,
      behavior: "smooth",
    });
  }
};

// Verificar posición del scroll para deshabilitar botones
const checkScrollPosition = () => {
  if (scrollContainer.value) {
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.value;
    isAtStart.value = scrollLeft === 0;
    isAtEnd.value = scrollLeft + clientWidth >= scrollWidth - 1;
  }
};

onMounted(() => {
  obtenerPublicaciones();
});
</script>

<style scoped>
/* Ocultar scrollbar para un diseño más limpio */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Transición suave para el scroll */
.scroll-smooth {
  scroll-behavior: smooth;
}
</style>
