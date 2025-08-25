<template>
  <section class="w-11/12 sm:w-[80%] mx-auto">
    <div class="grid gap-3 md:grid-cols-2">
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
          En las profundidades de los Pirineos se esconde un misterio que ha
          permanecido oculto durante siglos. Cuando la arqueóloga Elena Martínez
          descubre un antiguo manuscrito en una cueva olvidada, se embarca en
          una aventura que desafiará todo lo que creía saber sobre la historia y
          su propia identidad. Una narrativa cautivadora que combina historia,
          misterio y suspense en una trama que te mantendrá pegado a cada página
          hasta el final.
          {{ data.resumen }}
        </p>

        <div class="grid gap-5 md:grid-cols-2">
          <div class="bg-white p-2 rounded-md shadow flex flex-col gap-2">
            <h3 class="text-gray-500">Editorial</h3>
            <h4 class="font-semibold">Multidisciplinaria Editorial</h4>
          </div>
          <div class="bg-white p-2 rounded-md shadow flex flex-col gap-2">
            <h3 class="text-gray-500">Fecha de publicación</h3>
            <h4 class="font-semibold">
              {{ fechaPublicacion }}
            </h4>
          </div>
          <div class="bg-white p-2 rounded-md shadow flex flex-col gap-2">
            <h3 class="text-gray-500">Paginas</h3>
            <h4 class="font-semibold">330</h4>
          </div>
          <div class="bg-white p-2 rounded-md shadow flex flex-col gap-2">
            <h3 class="text-gray-500">Coleccion</h3>
            <h4 class="font-semibold">Multidisciplinaria Editorial</h4>
          </div>
        </div>

        <div class="grid gap-3 md:grid-cols-3">
          <button class="btn btn-primary">
            <span
              class="mdi mdi-tray-arrow-down text-xl flex items-center"
            ></span>
            Descargar
          </button>
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
            aria-label="Descripcion"
          />
          <div class="tab-content border-base-300 bg-base-100 p-10">
            <p>
              "El Secreto de la Montaña" es una obra maestra de la narrativa
              contemporánea que transporta al lector a los paisajes más
              impresionantes de los Pirineos. Ana García López combina con
              maestría elementos históricos con ficción para crear una trama
              intrigante que mantiene al lector en vilo hasta la última página.
              La protagonista, Elena Martínez, es una arqueóloga apasionada que
              se enfrenta al desafío más grande de su carrera cuando descubre un
              manuscrito que podría cambiar nuestra comprensión de la historia
              medieval. Acompañada por un equipo de expertos y un misterioso
              guía local, Elena deberá descifrar los códigos ocultos en el
              manuscrito mientras enfrenta peligros inesperados. Con una prosa
              elegante y detallada, García López crea una atmósfera envolvente
              que hace que el lector sienta que está caminando junto a Elena por
              antiguos senderos de montaña, explorando cuevas olvidadas y
              desvelando secretos que han permanecido ocultos durante siglos.
            </p>
          </div>

          <input
            type="radio"
            name="my_tabs_2"
            class="tab text-primary"
            aria-label="Autores"
            checked="checked"
          />
          <div class="tab-content border-base-300 bg-base-100">
            <ul class="list bg-base-100 rounded-box shadow-md">
              <li class="list-row">
                <div>
                  <img
                    class="size-10 rounded-full"
                    src="https://img.daisyui.com/images/profile/demo/1@94.webp"
                  />
                </div>
                <div>
                  <div>Dio Lupa</div>
                  <div class="text-xs uppercase font-semibold opacity-60">
                    Remaining Reason
                  </div>
                </div>
              </li>

              <li class="list-row">
                <div>
                  <img
                    class="size-10 rounded-full"
                    src="https://img.daisyui.com/images/profile/demo/4@94.webp"
                  />
                </div>
                <div>
                  <div>Ellie Beilish</div>
                  <div class="text-xs uppercase font-semibold opacity-60">
                    Bears of a fever
                  </div>
                </div>
              </li>

              <li class="list-row">
                <div>
                  <img
                    class="size-10 rounded-full"
                    src="https://img.daisyui.com/images/profile/demo/3@94.webp"
                  />
                </div>
                <div>
                  <div>Sabrino Gardener</div>
                  <div class="text-xs uppercase font-semibold opacity-60">
                    Cappuccino
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

onMounted(() => {
  fetch(`/api/libros/buscar?id=${props.id}`)
    .then((response) => response.json()) // <-- importante
    .then((dataResponse) => {
      console.log(dataResponse); // ahora sí: la data ya parseada
      data.value = dataResponse;
      fechaPublicacion.value = new Date(data.value.fecha_publicacion);
      fechaPublicacion.value =
        fechaPublicacion.value.toLocaleDateString("es-ES");
    })
    .catch((error) => {
      console.error("Error al obtener la publicación:", error);
    });
});
</script>
