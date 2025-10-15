<template>
  <article
    class="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer fade-in flex flex-col"
  >
    <a
      :href="`/gaceta/${publicacion._id}?categoria=${publicacion.tipo}`"
      class="flex flex-col h-full"
    >
      <!-- Contenedor de imagen con posición relativa -->
      <div class="relative flex-shrink-0">
        <img
          :src="publicacion.imagenes.portada.url"
          :alt="publicacion.imagenes.portada.descripcion"
          class="w-full md:h-54 object-cover"
        />
        <!-- Icono de estrella posicionado absolutamente -->
        <span
          class="absolute top-2 right-2 mdi mdi-star text-2xl text-yellow-300"
        ></span>
      </div>

      <div class="py-6 px-3 flex flex-col flex-grow justify-between">
        <!-- Contenido superior -->
        <div>
          <h3
            class="text-lg font-bold mb-3 hover:text-red-600 transition line-clamp-3"
          >
            {{ publicacion.titulo }}
          </h3>
        </div>
      </div>
    </a>
  </article>
</template>

<script setup>
// Props - IMPORTANTE: recibe UNA publicacion (objeto), NO publicaciones (array)
const props = defineProps({
  publicacion: {
    type: Object,
    required: true,
  },
});
</script>

<style lang="scss" scoped></style>
