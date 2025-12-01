<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue';
import { EffectCoverflow, Navigation } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';

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

const tarjetas = [
  {
    titulo: 'Título del tema 1',
    descripcion: 'Esta es una breve descripción del contenido.',
    imagen: 'https://img.daisyui.com/images/stock/photo-1559703248-dcaaec9fab78.webp',
  },
  {
    titulo: 'Título del tema 2',
    descripcion: 'Otro contenido relevante para mostrar.',
    imagen: 'https://img.daisyui.com/images/stock/photo-1559703248-dcaaec9fab78.webp',
  },
  {
    titulo: 'Título del tema 3',
    descripcion: 'Descripción corta para probar el diseño responsivo.',
    imagen: 'https://img.daisyui.com/images/stock/photo-1559703248-dcaaec9fab78.webp',
  },
  {
    titulo: 'Título del tema 4',
    descripcion: 'Más contenido para hacer pruebas.',
    imagen: 'https://img.daisyui.com/images/stock/photo-1559703248-dcaaec9fab78.webp',
  },
  {
    titulo: 'Título del tema 5',
    descripcion: 'Último contenido para hacer bucle.',
    imagen: 'https://img.daisyui.com/images/stock/photo-1559703248-dcaaec9fab78.webp',
  },
];
</script>

<template>
  <div class="max-w-7xl mx-auto py-10">
    <swiper
      :modules="modules"
      :effect="swiperOptions.effect"
      :grab-cursor="swiperOptions.grabCursor"
      :centered-slides="swiperOptions.centeredSlides"
      :slides-per-view="swiperOptions.slidesPerView"
      :cover-flow-effect="swiperOptions.coverflowEffect"
      :loop="swiperOptions.loop"
      :navigation="true"
      class="mySwiper"
    >
      <swiper-slide
        v-for="(card, index) in tarjetas"
        :key="index"
        class="w-full max-w-md flex justify-center items-center rounded-xl overflow-hidden"
      >
        <div class="w-full h-[248px] rounded-lg overflow-hidden bg-white shadow-lg flex">
          <div class="w-1/2 bg-[#CCCCCC] flex items-center justify-center">
            <img
              :src="card.imagen"
              alt="Imagen"
              class="max-h-[200px] object-cover"
            />
          </div>

          <div class="w-1/2 p-6 flex flex-col justify-between">
            <h2 class="text-md lg:text-2xl font-bold text-gray-800">
              {{ card.titulo }}
            </h2>
            <p class="text-sm text-gray-600 mt-2 flex-1 line-clamp-5">
              {{ card.descripcion }}
            </p>
            <button class="mt-4 bg-[#283886] text-white text-sm px-4 py-1 rounded hover:bg-[#1f2d6b] w-fit">
              Leer más
            </button>
          </div>
        </div>
      </swiper-slide>
    </swiper>

    <p class="text-center mt-3 text-gray-400 text-xs font-light">
      <span class="animate-pulse">⟵ Desliza ⟶</span>
    </p>
  </div>
</template>

<style scoped>
.mySwiper {
  padding-top: 30px;
  padding-bottom: 50px;
}

.mySwiper * {
  user-select: none;
  -webkit-user-drag: none;
}

/* Botones glassmorphism */
.swiper-button-next,
.swiper-button-prev {
  background: rgba(255, 255, 255, 0.2) !important;
  backdrop-filter: blur(4px);
  border-radius: 50%;
  padding: 25px;
  transition: 0.3s;
}

/* Hover oscuro */
.swiper-button-next:hover,
.swiper-button-prev:hover {
  background: rgba(0, 0, 0, 0.4) !important;
}

/* Flechas blancas */
:deep(.swiper-button-next::after),
:deep(.swiper-button-prev::after) {
  color: white !important;
  font-size: 20px !important;
}
</style>
