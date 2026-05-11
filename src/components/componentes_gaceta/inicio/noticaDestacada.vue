<template>
  <div class="w-11/12 pt-6 mx-auto">
    <div v-if="cargando" class="flex justify-center">
      <div class="relative rounded-xl overflow-hidden shadow-lg mb-10 text-white lg:w-9/12 mx-auto w-full">

        <div class="skeleton w-full h-64 md:h-150 ">
        </div>
      </div>
    </div>

    <div
      v-else
      class="relative rounded-xl overflow-hidden shadow-lg mb-10 text-white lg:w-9/12 mx-auto w-full"
    >
      <!-- Imagen -->
      <img
        :src="
          publicaciones[0]?.imagenes.portada.url ||
          'https://cdn.pixabay.com/photo/2020/07/24/03/18/pencil-5432830_640.jpg'
        "
        alt="Noticia destacada"
        class="w-full h-64 md:h-150 object-cover"
      />

      <!-- Filtro de color -->
      <div class="absolute inset-0 bg-black/50"></div>

      <!-- Texto sobre la imagen -->
      <div class="absolute bottom-4 left-4 md:bottom-12 md:left-12 md:w-3/4">
        <h2 class="text-2xl md:text-5xl font-extrabold">
          {{ publicaciones[0].titulo || "Título de la noticia" }}
        </h2>

        <a
          :href="`/gaceta/${publicaciones[0]._id}?categoria=${publicaciones[0].tipo}`"
          ><button class="btn btn-outline btn-sm md:btn-md my-2 md:my-4">
            Leer más
          </button></a
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
const publicaciones = ref([]);
const cargando = ref(true);

const obtenerPublicaciones = async () => {
  try {
    const res = await fetch(
      `/api/gaceta/obtener_destacados?id=publicacion_del_dia`
    );

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const json = await res.json();
    publicaciones.value = json;
    cargando.value = false;
    console.log("Datos obtenidos destacada:", json);
  } catch (error) {
    console.error("Error al obtener datos:", error);
  }
};

onMounted(() => {
  obtenerPublicaciones();
});
</script>

<style scoped></style>
