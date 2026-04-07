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
    <div v-else class="grid gap-8 md:grid-cols-2 mt-8">
      <!-- PORTADA DEL LIBRO -->
      <div
        class="w-full aspect-[3/4] rounded-lg overflow-hidden relative md:w-3/4 shadow-xl"
      >
        <img
          :src="data.portada_libro"
          alt="Portada del libro"
          class="w-full h-full object-fill"
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
          <div class="bg-white p-2 rounded-md shadow flex flex-col gap-2">
            <h3 class="text-gray-500">Descargas</h3>
            <h4 class="font-semibold">{{ data.descargas }}</h4>
          </div>
          <div class="bg-white p-2 rounded-md shadow flex flex-col gap-2">
            <h3 class="text-gray-500">Vistas</h3>
            <h4 class="font-semibold">{{ data.vistas }}</h4>
          </div>
        </div>

        <div class="grid gap-3 md:grid-cols-2 md:w-3/4">
          <a
            :href="data.archivo_pdf_url"
            class="w-full"
            @click="actualizarEstadistica('descargas')"
          >
            <button class="btn btn-primary w-full">
              <span
                class="mdi mdi-tray-arrow-down text-xl flex items-center"
              ></span>
              Descargar
            </button>
          </a>

          <button class="btn btn-outline btn-primary" @click="compartir">
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
    <Alert v-if="mostrarAlerta" type="success" :mensaje="mensajeAlerta" />
  </section>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Alert from "../alert/Alert.vue";

const data = ref([]);
const cargando = ref(true);
const mostrarAlerta = ref(false);
const mensajeAlerta = ref("");

const fechaPublicacion = ref(null);

// Props
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
});

const compartir = async () => {
  try {
    if (navigator.share) {
      await navigator.share({
        title: data.value.titulo,
        text: data.value.resumen?.substring(0, 100) + "...",
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      activarAlerta("¡Enlace copiado al portapapeles!");
    }
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error("Error al compartir:", error);
    }
  }
};

const activarAlerta = (mensaje) => {
  mensajeAlerta.value = mensaje;
  mostrarAlerta.value = true;
  setTimeout(() => (mostrarAlerta.value = false), 3000);
};

const actualizarEstadistica = async (tipo) => {
  try {
    await fetch(`/api/libros/actualizar-vistas?id=${props.id}&tipo=${tipo}`);
  } catch (error) {
    console.error(`Error al actualizar ${tipo}:`, error);
  }
};



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

      // Actualizar vistas automáticamente al cargar los datos
      actualizarEstadistica("vistas");
    })
    .catch((error) => {
      console.error("Error al obtener la publicación:", error);
    });
});
</script>
