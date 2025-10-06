<template>
  <div
    class="w-11/12 py-6 mx-auto grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8"
  >
    <card-publicacion :publicaciones="publicaciones" />
  </div>
  <div></div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import CardPublicacion from "./components/CardPublicacion.vue";

const publicaciones = ref([]);

// Props
const props = defineProps({
  coleccion: {
    type: String,
    required: true,
  },
});

const obtenerPublicaciones = () => {
  fetch(`/api/gaceta/obtener?categoria=${props.coleccion}`)
    .then((res) => res.json())
    .then((json) => {
      publicaciones.value = json.rows.map((i) => i.doc);
    })
    .catch((error) => {
      console.log("error al obtener datos", error);
    });
};

onMounted(() => {
  obtenerPublicaciones();
});
</script>

<style lang="scss" scoped></style>
