<template>
  <h3 class="text-xl mb-4 flex items-center">
    <span class="mdi mdi-image-multiple text-blue-500 pr-2"></span>
    Galería de Imágenes
  </h3>
  <div
    class="gallery-container bg-white rounded-lg shadow-lg overflow-hidden relative"
  >
    <div
      class="gallery-track flex transition-transform duration-500"
      :style="
        'transform: translateX(-' + getGalleryPosition('main') * 100 + '%)'
      "
    >
      <div
        v-for="(img, index) in galeria"
        :key="index"
        class="gallery-item min-w-full"
      >
        <img
          :src="img.url"
          :alt="img.descripcion || 'Imagen ' + (index + 1)"
          class="w-full h-full max-h-[400px] object-contain"
        />
      </div>
    </div>

    <!-- Botones -->
    <button
      @click="prevImage('main')"
      class="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-10 text-white p-2 rounded-full hover:bg-opacity-70 transition"
    >
      <span class="mdi mdi-chevron-left"></span>
    </button>
    <button
      @click="nextImage('main')"
      class="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition"
    >
      <span class="mdi mdi-chevron-right"></span>
    </button>

    <!-- Indicadores -->
    <div
      class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2"
    >
      <button
        v-for="(img, index) in galeria"
        :key="index"
        @click="goToImage('main', index)"
        :class="
          'w-3 h-3 rounded-full ' +
          (getGalleryPosition('main') === index
            ? 'bg-opacity-100'
            : 'bg-opacity-50') +
          ' bg-white hover:bg-opacity-100 transition'
        "
      ></button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const galleryPositions = ref({});

// Props
const props = defineProps({
  galeria: {
    type: Array,
    required: true,
  },
});

// Funciones galería
const prevImage = (newsId) => {
  const galeria = props.galeria;
  if (!galeria) return;
  if (!galleryPositions.value[newsId]) galleryPositions.value[newsId] = 0;
  galleryPositions.value[newsId] =
    (galleryPositions.value[newsId] - 1 + galeria.length) % galeria.length;
};

const nextImage = (newsId) => {
  const galeria = props.galeria;
  if (!galeria) return;
  if (!galleryPositions.value[newsId]) galleryPositions.value[newsId] = 0;
  galleryPositions.value[newsId] =
    (galleryPositions.value[newsId] + 1) % galeria.length;
};

const goToImage = (newsId, index) => {
  galleryPositions.value[newsId] = index;
};

const getGalleryPosition = (newsId) => {
  return galleryPositions.value[newsId] || 0;
};
</script>

<style lang="scss" scoped></style>
