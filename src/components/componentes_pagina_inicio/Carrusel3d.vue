<script setup>
import { ref, onMounted } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { EffectCoverflow, Navigation, Pagination } from 'swiper/modules';

// Importa tus imágenes
import img1 from '../../assets/temp/1.jpg';
import img2 from '../../assets/temp/2.jpg';
import img3 from '../../assets/temp/3.jpg';
import img4 from '../../assets/temp/4.jpg';
import img5 from '../../assets/temp/5.jpg';
import img6 from '../../assets/temp/6.jpg';
import img7 from '../../assets/temp/7.jpg';
import img8 from '../../assets/temp/8.jpg';

// ... importa todas las imágenes necesarias

const images = [img1, img2, img3,img4,img5,img6,img7,img8];

// Configuración de Swiper
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
</script>

<template>
  <div class="container">
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
      <swiper-slide v-for="(image, index) in images" :key="index">
        <a href="#"><img :src="image.src" :alt="`Slide ${index + 1}`" /></a>
      </swiper-slide>
    </swiper>
  </div>
</template>

<style scoped>
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

}
.swiper-slide img {
  display: block;
  width: 100%;
  
}
</style>

<style>
/* Estilos globales para los controles de Swiper */
.swiper-button-next,
.swiper-button-prev {
  color: white;
  background: rgba(0, 0, 0, 0.5);
  padding: 30px;
  border-radius: 50%;
}
</style>