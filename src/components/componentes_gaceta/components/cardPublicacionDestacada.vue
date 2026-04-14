<template>
  
  <article
    class="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer h-full min-h-[140px] flex group"
  >
   
    <a
      :href="`/gaceta/${publicacion._id}?categoria=${publicacion.tipo}`"
      class="flex w-full items-center p-6 gap-6"
    >
      <!-- Número a la izquierda -->
      <div class="flex-shrink-0 w-14 flex justify-center items-center">
        <span
          class="text-5xl md:text-6xl font-black text-red-950/20 group-hover:text-red-800 transition-colors duration-300 select-none"
        >
          {{ index }}
        </span>
      </div>

      <!-- Contenido (80%) -->
      <div class="flex-grow">
        <h3
          class="text-md md:text-xl font-black text-red-950 leading-tight mb-3 line-clamp-2 group-hover:text-red-800 transition-colors duration-200"
          style="width: 100%"
        >
          {{ publicacion.titulo }}
        </h3>
        
        <div class="flex items-center gap-4 text-xs md:text-xs" >
          <span class="font-bold text-black/45 ">
            {{ publicacion.categoria }}
          </span>
         <span>{{
            new Date(publicacion.fecha_publicacion).toLocaleDateString("es-ES")
          }}</span>
        </div>
      </div>
    </a>
  </article>
</template>

<script setup>
const props = defineProps({
  publicacion: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
});

const formatearFecha = (fecha) => {
  if (!fecha) return "";
  return new Date(fecha).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
