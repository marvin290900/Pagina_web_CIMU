<template>
  <section class="w-11/12 sm:w-[80%] mx-auto">
    <h1>id desde vue {{ props.id }}</h1>
  </section>
</template>

<script setup>
import { ref, onMounted } from "vue";

const data = ref([]);
const cargando = ref(true);

// Props
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
});

onMounted(() => {
  fetch(`/api/publicaciones/buscar?id=${props.id}`)
    .then((response) => response.json()) // <-- importante
    .then((data) => {
      console.log(data); // ahora sí: la data ya parseada
    })
    .catch((error) => {
      console.error("Error al obtener la publicación:", error);
    });
});
</script>
