<template>
  <article
    class="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer fade-in flex flex-col min-h-[300px]"
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
          class="w-full h-32 object-cover"
        />
        <!-- Icono de estrella posicionado absolutamente -->
        <span
          class="absolute top-2 right-2 mdi mdi-star text-2xl text-yellow-300"
        ></span>
      </div>

      <div class="py-6 px-3 flex flex-col flex-grow justify-between">
        <!-- Contenido superior -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <div class="badge badge-soft badge-error">
              {{ publicacion.categoria }}
            </div>

            <h4 class="text-black/50">
              <span class="mdi mdi-eye"></span>
              {{
                publicacion.visitas >= 1000
                  ? (publicacion.visitas / 1000).toFixed(1) + "K"
                  : publicacion.visitas
              }}
            </h4>
          </div>
          <h3
            class="text-md font-bold mb-3 hover:text-red-600 transition line-clamp-3"
          >
            {{ publicacion.titulo }}
          </h3>
        </div>

        <!-- Contenido inferior (siempre al final) -->
        <div class="flex items-center text-gray-500 text-sm mt-auto">
          <i class="far fa-clock mr-2"></i>
          <!-- <span>{{
            new Date(publicacion.fecha_publicacion).toLocaleDateString("es-ES")
          }}</span> -->
          <span class="mx-2">•</span>
          <span>Por {{ publicacion.autor.nombre }}</span>
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
