<template>
  <div class="w-11/12 sm:w-[80%] mx-auto">
    <!-- input de busqueda -->
    <div class="px-4 py-6">
      <label class="flex flex-col min-w-40 h-12 w-full">
        <div class="flex w-full flex-1 items-stretch rounded-lg h-full">
          <div
            class="text-[#637488] flex border-none bg-[#f0f2f4] items-center justify-center pl-4 rounded-l-lg border-r-0"
            data-icon="MagnifyingGlass"
            data-size="24px"
            data-weight="regular"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24px"
              height="24px"
              fill="currentColor"
              viewBox="0 0 256 256"
            >
              <path
                d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"
              ></path>
            </svg>
          </div>
          <input
            placeholder="Buscar libros por título, autor o tema..."
            class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] focus:outline-0 focus:ring-0 border-none bg-[#f0f2f4] focus:border-none h-full placeholder:text-[#637488] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
            value=""
          />
        </div>
      </label>
    </div>
    <!-- Filtros botones -->
    <!-- <div class="flex gap-3 p-3 flex-wrap pr-4">
      <button
        class="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-[#f0f2f4] pl-4 pr-2"
      >
        <p class="text-[#111418] text-sm font-medium leading-normal">Género</p>
        <div
          class="text-[#111418]"
          data-icon="CaretDown"
          data-size="20px"
          data-weight="regular"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20px"
            height="20px"
            fill="currentColor"
            viewBox="0 0 256 256"
          >
            <path
              d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"
            ></path>
          </svg>
        </div>
      </button>
      <button
        class="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-[#f0f2f4] pl-4 pr-2"
      >
        <p class="text-[#111418] text-sm font-medium leading-normal">Autor</p>
        <div
          class="text-[#111418]"
          data-icon="CaretDown"
          data-size="20px"
          data-weight="regular"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20px"
            height="20px"
            fill="currentColor"
            viewBox="0 0 256 256"
          >
            <path
              d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"
            ></path>
          </svg>
        </div>
      </button>
      <button
        class="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-[#f0f2f4] pl-4 pr-2"
      >
        <p class="text-[#111418] text-sm font-medium leading-normal">
          Año de Publicación
        </p>
        <div
          class="text-[#111418]"
          data-icon="CaretDown"
          data-size="20px"
          data-weight="regular"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20px"
            height="20px"
            fill="currentColor"
            viewBox="0 0 256 256"
          >
            <path
              d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"
            ></path>
          </svg>
        </div>
      </button>
      <button
        class="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-[#f0f2f4] pl-4 pr-2"
      >
        <p class="text-[#111418] text-sm font-medium leading-normal">Idioma</p>
        <div
          class="text-[#111418]"
          data-icon="CaretDown"
          data-size="20px"
          data-weight="regular"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20px"
            height="20px"
            fill="currentColor"
            viewBox="0 0 256 256"
          >
            <path
              d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"
            ></path>
          </svg>
        </div>
      </button>
    </div> -->

    <div
      v-if="cargando"
      class="w-full flex justify-center items-center h-[45vh]"
    >
      <div>
        <span class="loading loading-spinner loading-xl"></span>
        Cargando
      </div>
    </div>
    <!-- Grid de libros -->
    <div v-else>
      <h2
        class="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5"
      >
        Nuestras investigaciones
      </h2>

      <div
        class="grid grid-cols-[repeat(auto-fit,minmax(175px,300px))] gap-16 p-4 cursor-pointer justify-between"
      >
        <div
          v-for="(investigacion, index) in datosPaginados"
          :key="index"
          class="flex flex-col gap-3 pb-3 group"
        >
          <div class="w-full aspect-[3/4] rounded-lg overflow-hidden relative">
            <a :href="`/publicaciones/multidisciplinaria/${investigacion._id}`">
              <img
                :src="investigacion.portada_libro"
                alt=""
                class="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-75"
              />
              <div
                class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              ></div>
            </a>
          </div>
          <div>
            <p class="text-[#111418] text-base font-medium leading-normal">
              {{ investigacion.titulo }}
            </p>
            <p class="text-[#637488] text-sm font-normal leading-normal">
              {{ investigacion.institucion }}
            </p>
          </div>
        </div>
      </div>
    </div>
    <div class="flex justify-center mt-8 mb-12">
      <div class="btn-group">
        <button
          class="btn btn-soft btn-primary mx-3"
          :disabled="paginaActual === 1"
          @click="cambiarPagina(paginaActual - 1)"
        >
          <span class="mdi mdi-chevron-left"></span>
        </button>

        <button
          v-for="pagina in totalPaginas"
          :key="pagina"
          class="btn btn-soft btn-primary mx-0.5"
          :class="{ 'btn-active': pagina === paginaActual }"
          @click="cambiarPagina(pagina)"
        >
          {{ pagina }}
        </button>

        <button
          class="btn btn-soft btn-primary mx-3"
          :disabled="paginaActual === totalPaginas"
          @click="cambiarPagina(paginaActual + 1)"
        >
          <span class="mdi mdi-chevron-right"></span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";

const data = ref([]);
const cargando = ref(true);
const paginaActual = ref(1);
const itemsPorPagina = ref(8); // ajustar el numero de items que se muestran

// Computed para los datos paginados
const datosPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * itemsPorPagina.value;
  const fin = inicio + itemsPorPagina.value;
  return data.value.slice(inicio, fin);
});

// Computed para el número total de páginas
const totalPaginas = computed(() => {
  return Math.ceil(data.value.length / itemsPorPagina.value);
});

// Función para cambiar de página
const cambiarPagina = (pagina) => {
  paginaActual.value = pagina;
};

onMounted(() => {
  fetch("/api/publicaciones/obtener")
    .then((res) => res.json())
    .then((json) => {
      data.value = json.rows.map((i) => i.doc);
      cargando.value = false;
    })
    .catch((error) => {
      console.log("error al obtener datos", error);
    });
});
</script>

<style scoped></style>
