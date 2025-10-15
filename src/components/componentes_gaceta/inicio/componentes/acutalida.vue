<template>
  <div class="w-full mx-auto">
    <div v-if="cargando" class="flex justify-center">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <div v-else class="mx-auto w-full">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold">Actualidad</h2>

        <!-- Botones de navegación -->
        <div class="flex items-center gap-4">
          <button class="btn btn-soft btn-info">Ver más</button>
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
      </div>

      <!-- Scroll horizontal en todas las pantallas -->
      <div
        ref="scrollContainer"
        @scroll="checkScrollPosition"
        class="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x snap-mandatory scroll-smooth"
      >
        <card-publicacion
          v-for="publicacion in publicaciones"
          :key="publicacion._id"
          :publicacion="publicacion"
          class="flex-shrink-0 w-72 md:w-80 snap-start"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import CardPublicacion from "../../components/CardPublicacion.vue";

const publicaciones = ref([]);
const cargando = ref(true);
const scrollContainer = ref(null);
const isAtStart = ref(true);
const isAtEnd = ref(false);

const obtenerPublicaciones = async () => {
  try {
    cargando.value = true;

    //Colocar la categoria que se desea obtener
    const res = await fetch(
      "/api/gaceta/obtener_recientes?categoria=actualidad" // o la categoría que necesites
    );

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const json = await res.json();
    console.log("Respuesta de la API:", json); // Debug

    // CORRECCIÓN: Mapear correctamente la respuesta
    publicaciones.value = json.rows?.map((row) => row.doc) || [];

    console.log("Publicaciones cargadas:", publicaciones.value.length); // Debug

    // Verificar posición inicial después de cargar
    setTimeout(checkScrollPosition, 100);
  } catch (error) {
    console.error("Error al obtener datos:", error);
  } finally {
    cargando.value = false;
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
