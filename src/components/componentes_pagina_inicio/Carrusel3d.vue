<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue';
import { EffectCoverflow, Navigation } from 'swiper/modules';

// Importar imágenes locales
import img1 from '../../assets/temp/respaldo.png';

// Array de imágenes
const imagesBackup = [img1, img1, img1, img1, img1, img1, img1, img1];

const modules = [EffectCoverflow, Navigation];

const swiperOptions = {
  effect: 'coverflow',
  grabCursor: true,
  centeredSlides: true,
  slidesPerView: 'auto',
  coverflowEffect: {
    rotate: 0,
    stretch: 0,
    depth: 500,
    modifier: 2,
    slideShadows: true,
  },
  loop: true,
};

const props = defineProps({
  libros: {
    type: Array,
    required: true,
    default: () => []
  }
});

import { computed } from 'vue';

const librosConRespaldo = computed(() => {
  const reales = props.libros.map(libro => ({
    src: libro.portada || libro.portada_libro || null,
    titulo: libro.titulo || 'Libro'
  }));

  const realesConPortada = reales.map(libro => ({
    src: libro.src || imagesBackup[0], // si no tiene portada, usar la primera de respaldo
    titulo: libro.titulo
  }));

  const faltantes = 8 - realesConPortada.length;

  if (faltantes > 0) {
    const complementos = imagesBackup.slice(0, faltantes).map((img, index) => ({
      src: img,
      titulo: `Libro de respaldo ${index + 1}`
    }));

    return [...realesConPortada, ...complementos];
  }

  return realesConPortada;
});





</script>

<template>
  <div class="container">
    <swiper v-if="librosConRespaldo.length > 0" :modules="modules" :effect="swiperOptions.effect"
      :grab-cursor="swiperOptions.grabCursor" :centered-slides="swiperOptions.centeredSlides"
      :slides-per-view="swiperOptions.slidesPerView" :coverflow-effect="swiperOptions.coverflowEffect"
      :loop="swiperOptions.loop" :navigation="true" class="mySwiper">
      <swiper-slide v-for="(libro, index) in librosConRespaldo" :key="index">
        <img :src="libro.src" :alt="libro.titulo" class="portada-img" />
      </swiper-slide>
    </swiper>
  </div>

  <p class="text-center mt-3 text-gray-400 text-xs font-light">
    <span class="animate-pulse">⟵ Desliza ⟶</span>
  </p>
</template>

<style
  scoped>
  .container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .swiper {
    width: 100%;
    padding-top: 50px;
    padding-bottom: 50px;
  }

  .swiper-slide {
    background-position: center;
    background-size: cover;
    width: 250px;
    margin: 0 20px;
  }

  .swiper-slide img {
    display: block;
    width: 100%;
  }

  /* Botones */
  .swiper-button-next,
  .swiper-button-prev {
    color: white !important;
    background: rgba(0, 0, 0, 0.4);
    padding: 25px;
    border-radius: 50%;
    backdrop-filter: blur(4px);
    transition: 0.3s;
  }

  .swiper-button-next:hover,
  .swiper-button-prev:hover {
    background: rgba(0, 0, 0, 0.7);
  }

  /* Flechas blancas */
  :deep(.swiper-button-next::after),
  :deep(.swiper-button-prev::after) {
    color: #ffffff !important;
    font-size: 20px !important;
  }

  /* Fondo de los botones */
  .swiper-button-next,
  .swiper-button-prev {
    background: rgba(255, 255, 255, 0.2) !important;
    backdrop-filter: blur(4px);
    border-radius: 50%;
  }
</style>
