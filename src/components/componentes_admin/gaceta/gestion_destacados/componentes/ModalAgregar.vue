<template>
  <div class="modal-box max-w-6xl">
    <div class="flex justify-between items-center">
      <h3 class="text-lg font-bold">
        Agregar
        {{
          props.modo === "destacada"
            ? "publicación destacada"
            : "publicaciones destacadas"
        }}
      </h3>
      <button
        class="btn btn-ghost rounded-full"
        @click="emit('cerrarModalAgregar')"
      >
        <span class="mdi mdi-close text-lg"></span>
      </button>
    </div>

    <div
      v-if="cargando"
      class="w-full flex justify-center h-full py-12 items-center gap-3"
    >
      <span class="loading loading-spinner text-primary"></span>
      Cargando informacion...
    </div>
    <div v-else class="py-4">
      <select class="select" v-model="coleccion">
        <option disabled :value="coleccion">{{ coleccion.label }}</option>
        <option
          v-for="categoria in categoriasOptions"
          :key="categoria"
          :value="categoria"
        >
          {{ categoria.label }}
        </option>
      </select>

      <div class="divider"></div>

      <div
        v-if="publicaciones.length == 0"
        class="flex w-full justify-center text-2xl text-gray-500 gap-3"
      >
        <span class="mdi mdi-alert-circle"></span>
        <h3>Seleccionar Publicaciones</h3>
      </div>
      <div
        v-if="publicaciones.length > 0"
        class="overflow-x-auto rounded-box border border-base-content/5 bg-base-100 my-8"
      >
        <div class="flex w-full p-6 text-2xl justify-center">
          <h2>{{ coleccion.label }}</h2>
        </div>
        <table class="table">
          <thead>
            <tr>
              <th>Fecha publicación</th>
              <th>Título</th>
              <th>Vistas</th>
              <th>Usuario</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <!-- Mostrar solo usuarios de la página actual -->
            <tr v-for="publicacion in publicaciones" :key="publicacion._id">
              <td>
                {{
                  new Date(publicacion.fecha_publicacion).toLocaleDateString()
                }}
              </td>
              <td>{{ publicacion.titulo }}</td>
              <td>{{ publicacion.visitas }}</td>
              <td>{{ publicacion.autor.nombre }}</td>

              <td class="flex gap-3">
                <div
                  class="tooltip tooltip-bottom"
                  data-tip="Agregar a destacados"
                >
                  <button
                    class="btn btn-soft btn-primary btn-sm"
                    @click="guardar(publicacion)"
                  >
                    <span class="mdi mdi-check text-lg"></span>
                  </button>
                </div>

                <a
                  :href="`/gaceta/${publicacion._id}?categoria=${publicacion.tipo}`"
                  target="_blank"
                >
                  <div class="tooltip tooltip-bottom" data-tip="Ver perfil">
                    <button class="btn btn-soft btn-info btn-sm">
                      <span class="mdi mdi-eye-outline text-lg"></span>
                    </button>
                  </div>
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="flex gap-4 justify-end">
      <button class="btn btn-ghost" @click="emit('cerrarModalAgregar')">
        Cancelar
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

const anioSelected = ref(null);
const cargando = ref(false);
const publicaciones = ref([]);

const coleccion = ref({
  value: "Seleccionar Sección",
  label: "Seleccionar Sección",
});
const categoriasOptions = [
  { value: "opinion", label: "Opinion Multidisciplinaria" },
  { value: "actualidad", label: "Actualidad" },
  { value: "audiovisuales", label: "Audio visuales" },
  { value: "vida_universitaria", label: "Vida universitaria" },
  { value: "memoria", label: "Memoria colectiva" },
];

const props = defineProps({
  modo: {
    type: String,
    required: true,
  },
});
const emit = defineEmits(["cerrarModalAgregar", "guardarCambios"]);

watch(coleccion, () => {
  if (coleccion.value !== "Seleccionar Sección") {
    obtenerPublicaciones();
    cargando.value = true;
  } else {
    publicaciones.value = [];
  }
});

// Inicializar con el año actual
anioSelected.value = new Date().getFullYear();

const guardar = (publicacion) => {
  emit("guardarCambios", publicacion, props.modo);
};

// Función para obtener publicaciones
const obtenerPublicaciones = async () => {
  try {
    cargando.value = true;

    const url = `/api/gaceta/obtener?categoria=${coleccion.value.value}&anio=${anioSelected.value}`;

    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const json = await res.json();
    publicaciones.value = json.rows.map((i) => i.doc);
  } catch (error) {
    console.error("Error al obtener datos:", error);
  } finally {
    cargando.value = false;
  }
};
</script>

<style></style>
