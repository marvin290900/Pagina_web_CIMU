<script setup>
import { computed } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { EffectCoverflow, Navigation } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';

import imgRespaldo from '../../assets/temp/respaldo2.png?url';

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
  investigaciones: {
    type: Array,
    required: true,
    default: () => []
  }
});

// Lógica para completar 5 elementos
const investigacionesCompletas = computed(() => {
  const minElementos = 5;
  
  // 1. Mapeamos las reales asegurando que tengan imagen
  const reales = props.investigaciones.map(item => ({
    titulo: item.titulo,
    resumen: item.resumen,
    imagenURL: item.imagenURL || imgRespaldo
  }));

  const resultado = [...reales];

  // 2. Rellenamos hasta llegar a 5
  while (resultado.length < minElementos) {
    resultado.push({
      titulo: "Próximamente",
      resumen: "Estamos trabajando en nuevas investigaciones para compartir contigo.",
      imagenURL: imgRespaldo
    });
  }

  return resultado;
});

</script>

<template>
  <div class="max-w-7xl mx-auto py-10">
    <swiper
    v-if="investigacionesCompletas.length > 0"
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
        v-for="(card, index) in investigacionesCompletas"
        :key="index"
        class="w-full max-w-md flex justify-center items-center rounded-xl overflow-hidden"
      >
        <div class="w-full h-[248px] rounded-lg overflow-hidden bg-white shadow-lg flex">
          <div class="w-1/2 bg-[#CCCCCC] flex items-center justify-center">
            <img
              :src="card.imagenURL"
              alt="Imagen"
              class="max-h-[200px] object-cover"
            />
          </div>

          <div class="w-1/2 p-6 flex flex-col justify-between">
            <h2 class="text-md lg:text-2xl font-bold text-gray-800 line-clamp-4">
              {{ card.titulo }}
            </h2>
            <p class="text-sm text-gray-600 mt-2 flex-1 line-clamp-4">
              {{ card.resumen }}
            </p>
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
