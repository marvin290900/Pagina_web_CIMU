<template>
  <div v-if="cargando" class="w-full mx-auto flex justify-center">
    <span class="loading loading-spinner text-primary"></span>
  </div>
  <div
    v-else
    class="w-11/12 xl:w-3/5 mx-auto my-12 pb-4 bg-white rounded-lg shadow-lg overflow-hidden"
  >
    <!-- Imagen de portada -->
    <img
      :src="data.imagenes.portada.url"
      :alt="data.imagenes.portada.descripcion"
      class="w-full max-h-[500px] min-h-[300px] object-cover"
    />
    <!-- contenido -->
    <div class="w-11/12 mx-auto grid gap-4">
      <!-- Autor y fecha de publicacion -->
      <div class="flex flex-col items-center w-full justify-center pt-4">
        <div v-if="autor.foto" class="avatar">
          <div class="w-16 rounded-full border-2 border-white shadow">
            <a :href="`/gaceta/perfil/${data.autor.id}`">
              <img :src="autor.foto" alt="Foto del autor de la publicacion" />
            </a>
          </div>
        </div>

        <div v-else class="avatar avatar-placeholder w-full">
          <a :href="`/gaceta/perfil/${data.autor.id}`">
            <div class="bg-black/50 text-neutral-content w-24 rounded-full">
              <span class="text-3xl">{{ autor.nombre[0] }}</span>
            </div>
          </a>
        </div>

        <div class="text-center">
          <a :href="`/gaceta/perfil/${data.autor.id}`">
            <h3 class="text-black/60 font-black">{{ autor.nombre }}</h3>
          </a>

          <h3 class="text-black/60">
            {{
              new Date(data.fecha_publicacion).toLocaleString("es-ES", {
                dateStyle: "full",
                timeStyle: "short",
              })
            }}
          </h3>
          <!-- Cantidad de vistas -->
          <h4 class="text-black/50">
            <span class="mdi mdi-eye"></span>
            {{
              data.visitas >= 1000
                ? (data.visitas / 1000).toFixed(1) + "K"
                : data.visitas
            }}
            Visualizaciones
          </h4>
        </div>
      </div>

      <!-- Etiquetas y cantidad de vistas -->
      <!-- 
      <div class="w-11/12 flex flex-wrap gap-3">
        <div
          v-for="(etiqueta, index) in data.etiquetas"
          :key="index"
          class="badge badge-soft badge-error badge-md capitalize"
        >
          {{ etiqueta }}
        </div>
      </div> -->

      <div class="divider"></div>

      <!-- Titulo -->
      <h1 class="text-2xl md:text-4xl font-black">{{ data.titulo }}</h1>

      <!-- Contenido principal en texto -->
      <!-- <p class="whitespace-pre-line">{{ data.contenido }}</p> -->
      <MdPreview editorId="preview-only" :modelValue="data.contenido" />

      <!-- Galería de imágenes -->
      <div
        v-if="data.imagenes.galeria && data.imagenes.galeria.length > 0"
        class="my-8 relative"
      >
        <galeria :galeria="data.imagenes.galeria" />
      </div>
      <!-- Video -->
      <div v-if="data.link_yt">
        <h3 class="text-xl mb-4 flex items-center">
          <span class="mdi mdi-youtube text-red-500 pr-2"></span>
          Video Relacionado
        </h3>
        <div class="bg-white rounded-lg shadow-lg overflow-hidden">
          <div class="relative" style="padding-bottom: 56.25%">
            <iframe
              :src="data.link_yt"
              class="absolute top-0 left-0 w-full h-full"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            >
            </iframe>
          </div>
          <div class="p-4">
            <p class="text-gray-600">Video complementario sobre esta noticia</p>
          </div>
        </div>
      </div>
      <div class="divider"></div>
      <div class="flex justify-end">
        <a :href="`/gaceta/${data.tipo}`"
          ><button
            class="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition"
          >
            <span class="mdi mdi-chevron-left"></span>Volver
          </button></a
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Galeria from "./components/Galeria.vue";
import { MdPreview } from "md-editor-v3";
import "md-editor-v3/lib/style.css";

const data = ref({});
const autor = ref(null);
const cargando = ref(true);

const url = new URL(window.location.href); // Convierte la URL en un objeto URL

// Acceder a parámetros con URLSearchParams
const params = new URLSearchParams(url.search);

// Props
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
});

const obtener = async (id, coleccion) => {
  try {
    const response = await fetch(
      `/api/gaceta/actualidad/buscar?id=${id}&coleccion=${coleccion}`
    );
    const dataResponse = await response.json();

    return dataResponse;
  } catch (error) {
    console.error("Error al obtener la publicación:", error);
    return null;
  }
};

onMounted(async () => {
  const coleccion = params.get("categoria"); //obtengo la categoria de la url
  const id = params.get("id"); // obtengo el id de la url
  if (id) {
    autor.value = await obtener(id, "autores");
    data.value = await obtener(id, coleccion);
  } else {
    data.value = await obtener(props.id, coleccion);
    autor.value = await obtener(data.value.autor.id, "autores");
  }

  if (autor.value) {
    cargando.value = false;
  }
});
</script>

<style lang="scss" scoped></style>
