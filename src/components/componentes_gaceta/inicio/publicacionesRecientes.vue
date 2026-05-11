<template>
  <div class="w-11/12 mx-auto py-12">
    <h1 class="text-3xl font-extrabold text-center mb-4">
      Publicaciones Recientes
    </h1>
    <div class="lg:w-9/12 grid grid-cols-1 mx-auto gap-8">
      <Actualidad />
      <Audiovisuales />
      <Memoria />
      <Opinion />
      <VidaUniversitaria />
    </div>
  </div>
</template>

<script setup>
import Actualidad from "../../componentes_gaceta/inicio/componentes/acutalida.vue";
import Audiovisuales from "../../componentes_gaceta/inicio/componentes/audioVisuales.vue";
import Memoria from "../../componentes_gaceta/inicio/componentes/memoria.vue";
import Opinion from "../../componentes_gaceta/inicio/componentes/opinion.vue";
import VidaUniversitaria from "../../componentes_gaceta/inicio/componentes/vidaUniversitaria.vue";
</script>

<style lang="scss" scoped></style>
