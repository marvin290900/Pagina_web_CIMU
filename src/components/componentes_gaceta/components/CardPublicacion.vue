<template>
  <article
    class="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer fade-in flex flex-col h-full"
  >
    <a
      :href="`/gaceta/${publicacion._id}?categoria=${publicacion.tipo}`"
      class="flex flex-col h-full"
    >
      <img
        :src="publicacion.imagenes.portada.url"
        :alt="publicacion.imagenes.portada.descripcion"
        class="w-full h-48 object-cover"
      />
      <div class="p-6 flex flex-col flex-grow">
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
        <h3 class="text-xl font-bold mb-3 hover:text-red-600 transition line-clamp-2 min-h-[3.5rem]">
          {{ publicacion.titulo }}
        </h3>
        <p class="text-gray-600 mb-4 line-clamp-3 min-h-[4.5rem]">
          {{ publicacion.contenido.slice(0, 100) }}...
        </p>
        <div class="flex items-center text-gray-500 text-sm mt-auto">
          <i class="far fa-clock mr-2"></i>
          <span>{{
            new Date(publicacion.fecha_publicacion).toLocaleDateString("es-ES")
          }}</span>
          <span class="mx-2">•</span>
          <span>Por {{ publicacion.autor.nombre }}</span>
        </div>
      </div>
    </a>
  </article>
</template>

<script setup>
// Props
const props = defineProps({
  publicacion: {
    type: Object,
    required: true,
  },
});

console.log(props.publicacion);
</script>

<style lang="scss" scoped></style>
