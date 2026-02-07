<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue';
import { EffectCoverflow, Navigation } from 'swiper/modules';

// Importar imágenes locales
import img1 from '../../assets/temp/1.png';
import img2 from '../../assets/temp/2.png';
import img3 from '../../assets/temp/3.png';
import img4 from '../../assets/temp/4.jpg';
import img5 from '../../assets/temp/5.png';
import img6 from '../../assets/temp/6.jpg';
import img7 from '../../assets/temp/7.png';
import img8 from '../../assets/temp/8.png';

// Array de imágenes
const images = [img1, img2, img3, img4, img5, img6, img7, img8];

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

</script>

<template>
  <div class="container">
    <swiper v-if="props.libros.length > 0" :modules="modules" :effect="swiperOptions.effect"
      :grab-cursor="swiperOptions.grabCursor" :centered-slides="swiperOptions.centeredSlides"
      :slides-per-view="swiperOptions.slidesPerView" :coverflow-effect="swiperOptions.coverflowEffect"
      :loop="swiperOptions.loop" :navigation="true" class="mySwiper">
      <swiper-slide v-for="(libro, index) in props.libros" :key="libro._id || index">
        <img :src="libro.portada || libro.portada_libro" :alt="libro.titulo || `Libro ${index + 1}`"
          class="portada-img" />
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
