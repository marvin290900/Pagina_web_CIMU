<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue';
import { EffectCoverflow, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

const modules = [EffectCoverflow];

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
      :cover-flow-effect="swiperOptions.coverFlowEffect"
      :loop="swiperOptions.loop"
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
            <p class="text-sm lg:text-sm text-gray-600 mt-2 flex-1 line-clamp-5">
              {{ card.descripcion }}
            </p>
            <button
              class="mt-4 bg-blue-700 text-white text-sm px-4 py-1 rounded hover:bg-blue-900 w-fit"
            >
              Leer más
            </button>
          </div>
        </div>
      </swiper-slide>
    </swiper>
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

</style>
