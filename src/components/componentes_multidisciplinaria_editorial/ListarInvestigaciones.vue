<template>
  <div>
    <p class="text-5xl">INVESTIGACIONES</p>

    <p v-for="(investigacion, index) in data" :key="index">
      {{ investigacion.portada_libro }}
      <img :src="investigacion.portada_libro" alt="" />
    </p>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const data = ref([]);

onMounted(() => {
  fetch("/api/getInvestigacionesAll")
    .then((res) => res.json())
    .then((json) => {
      data.value = json.rows.map((i) => i.doc);
      console.log("data cargada", data.value);
    })
    .catch((error) => {
      console.log("error al obtener datos", error);
    });
});
</script>

<style lang="scss" scoped></style>
