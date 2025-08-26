<template>
  <section class="w-11/12 sm:w-[80%] mx-auto">
    <div
      v-if="cargando"
      class="w-full flex justify-center items-center h-[45vh]"
    >
      <div>
        <span class="loading loading-spinner loading-xl"></span>
        Cargando
      </div>
    </div>
    <div v-else class="grid gap-3 md:grid-cols-2">
      <div
        class="w-full aspect-[3/4] rounded-lg overflow-hidden relative md:w-3/4"
      >
        <img
          :src="data.portada_libro"
          alt=""
          class="w-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-75"
        />
      </div>

      <div class="flex flex-col gap-4">
        <div class="flex gap-3 flex-wrap md:flex-row">
          <div
            v-for="(palabraClave, index) in data.palabras_clave"
            :key="index"
            class="badge badge-soft badge-primary"
          >
            {{ palabraClave }}
          </div>
        </div>

        <h2 class="text-3xl font-black">
          {{ data.titulo }}
        </h2>

        <p>
          {{ data.resumen }}
        </p>

        <div class="grid gap-5 md:grid-cols-2">
          <div class="bg-white p-2 rounded-md shadow flex flex-col gap-2">
            <h3 class="text-gray-500">Editorial</h3>
            <h4 class="font-semibold">{{ data.editorial }}</h4>
          </div>
          <div class="bg-white p-2 rounded-md shadow flex flex-col gap-2">
            <h3 class="text-gray-500">Fecha de publicación</h3>
            <h4 class="font-semibold">
              {{ fechaPublicacion }}
            </h4>
          </div>
          <div class="bg-white p-2 rounded-md shadow flex flex-col gap-2">
            <h3 class="text-gray-500">Paginas</h3>
            <h4 class="font-semibold">{{ data.paginas }}</h4>
          </div>
          <div class="bg-white p-2 rounded-md shadow flex flex-col gap-2">
            <h3 class="text-gray-500">Coleccion</h3>
            <h4 class="font-semibold">{{ data.coleccion }}</h4>
          </div>
        </div>

        <div class="grid gap-3 md:grid-cols-2 md:w-3/4">
          <a :href="data.archivo_pdf_url" class="w-full">
            <button class="btn btn-primary w-full">
              <span
                class="mdi mdi-tray-arrow-down text-xl flex items-center"
              ></span>
              Descargar
            </button>
          </a>

          <button class="btn btn-outline btn-primary">
            <span
              class="mdi mdi-share-variant text-xl flex items-center"
            ></span>
            Compartir
          </button>
        </div>
        <!-- name of each tab group should be unique -->
        <div class="tabs tabs-border">
          <input
            type="radio"
            name="my_tabs_2"
            class="tab text-primary"
            aria-label="Autores"
            checked="checked"
          />
          <div class="tab-content border-base-300 bg-base-100">
            <ul class="list bg-base-100 rounded-box shadow-md">
              <li
                v-for="(autor, index) in data.autores"
                :key="index"
                class="list-row"
              >
                <div>
                  <img
                    class="size-10 rounded-full"
                    :src="autor.foto"
                    alt="foto de perfil de investigador"
                  />
                </div>
                <div>
                  <div>{{ autor.nombre }}</div>
                  <div class="text-xs uppercase font-semibold opacity-60">
                    {{ autor.nivel_academico }}
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from "vue";

const data = ref([]);
const cargando = ref(true);

const fechaPublicacion = ref(null);

// Props
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
});
``;

onMounted(() => {
  fetch(`/api/libros/buscar?id=${props.id}`)
    .then((response) => response.json()) // <-- importante
    .then((dataResponse) => {
      console.log(dataResponse); // ahora sí: la data ya parseada
      data.value = dataResponse;
      fechaPublicacion.value = new Date(data.value.fecha_publicacion);
      fechaPublicacion.value =
        fechaPublicacion.value.toLocaleDateString("es-ES");
      cargando.value = false;
    })
    .catch((error) => {
      console.error("Error al obtener la publicación:", error);
    });
});
</script>
