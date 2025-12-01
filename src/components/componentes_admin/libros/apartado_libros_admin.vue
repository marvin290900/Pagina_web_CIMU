<template>
  <section class="w-11/12 sm:w-[80%] mx-auto">
    <div class="flex justify-between py-4">
      <h2 class="text-3xl font-bold">Gestión de Libros</h2>
      <div class="flex gap-3">
        <button
          class="btn btn-ghost text-primary"
          @click="abrirModalColecciones"
        >
          <span class="mdi mdi-text-box-edit text-xl"></span>
          Editar Colecciones
        </button>

        <button class="btn btn-primary" @click="abrirModalNuevo">
          <span class="mdi mdi-plus text-xl"></span>
          Agregar Libro
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="cargando" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <!-- Tabla de libros -->
    <div
      v-else
      class="overflow-x-auto rounded-box border border-base-content/5 bg-base-100"
    >
      <table class="table">
        <thead>
          <tr>
            <th>Portada</th>
            <th>Título</th>
            <th>Fecha publicación</th>
            <th>Editorial</th>
            <th>Colección</th>
            <th>Páginas</th>
            <th>Autores</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="libro in librosPaginados" :key="libro._id">
            <td>
              <img
                v-if="libro.portada"
                :src="libro.portada"
                :alt="libro.titulo"
                class="w-12 h-16 object-cover rounded"
              />
              <div
                v-else
                class="w-12 h-16 bg-base-300 rounded flex items-center justify-center"
              >
                <span class="mdi mdi-book text-2xl text-base-content/30"></span>
              </div>
            </td>
            <td>
              <div class="font-bold">{{ libro.titulo }}</div>
              <div class="text-sm text-gray-500">{{ libro.tipo }}</div>
            </td>
            <td>
              {{
                libro.fecha_publicacion
                  ? new Date(libro.fecha_publicacion).toLocaleDateString(
                      "es-ES"
                    )
                  : "-"
              }}
            </td>
            <td>{{ libro.editorial || "-" }}</td>
            <td>{{ libro.coleccion || "-" }}</td>
            <td>{{ libro.paginas || "-" }}</td>
            <td>
              <div class="flex -space-x-2">
                <div
                  v-for="(autor, index) in libro.autores?.slice(0, 3)"
                  :key="index"
                  class="avatar tooltip"
                  :data-tip="autor.nombre"
                >
                  <div class="w-8 rounded-full ring ring-base-100">
                    <img
                      v-if="autor.foto"
                      :src="autor.foto"
                      :alt="autor.nombre"
                    />
                    <div
                      v-else
                      class="w-8 h-8 bg-primary text-white flex items-center justify-center text-xs"
                    >
                      {{ autor.nombre.charAt(0) }}
                    </div>
                  </div>
                </div>
                <div
                  v-if="libro.autores?.length > 3"
                  class="avatar placeholder"
                >
                  <div
                    class="w-8 rounded-full bg-base-300 text-base-content ring ring-base-100"
                  >
                    <span class="text-xs">+{{ libro.autores.length - 3 }}</span>
                  </div>
                </div>
              </div>
            </td>
            <td class="flex gap-2">
              <a
                v-if="libro.pdf_url"
                :href="libro.pdf_url"
                target="_blank"
                class="btn btn-soft btn-success btn-sm"
                title="Ver PDF"
              >
                <span class="mdi mdi-file-pdf-box"></span>
              </a>
              <button
                class="btn btn-soft btn-primary btn-sm"
                @click="editarLibro(libro)"
              >
                <span class="mdi mdi-pencil"></span>
              </button>
              <button
                class="btn btn-soft btn-error btn-sm"
                @click="eliminarLibro(libro._id)"
              >
                <span class="mdi mdi-delete"></span>
              </button>
            </td>
          </tr>

          <tr v-if="libros.length === 0">
            <td colspan="8" class="text-center py-8 text-gray-500">
              No hay libros registrados
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginación -->
    <div
      v-if="libros.length > 0"
      class="flex items-center justify-between py-4"
    >
      <div class="text-sm text-gray-600">
        Mostrando {{ rangoInicio }} - {{ rangoFin }} de {{ totalLibros }} libros
      </div>

      <div class="join">
        <button
          class="join-item btn btn-sm"
          :disabled="paginaActual === 1"
          @click="irAPagina(1)"
        >
          «
        </button>
        <button
          class="join-item btn btn-sm"
          :disabled="paginaActual === 1"
          @click="irAPagina(paginaActual - 1)"
        >
          ‹
        </button>

        <button
          v-for="pagina in paginasVisibles"
          :key="pagina"
          class="join-item btn btn-sm"
          :class="{ 'btn-active': pagina === paginaActual }"
          @click="irAPagina(pagina)"
        >
          {{ pagina }}
        </button>

        <button
          class="join-item btn btn-sm"
          :disabled="paginaActual === totalPaginas"
          @click="irAPagina(paginaActual + 1)"
        >
          ›
        </button>
        <button
          class="join-item btn btn-sm"
          :disabled="paginaActual === totalPaginas"
          @click="irAPagina(totalPaginas)"
        >
          »
        </button>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-600">Mostrar:</span>
        <select
          v-model="librosPorPagina"
          class="select select-sm select-bordered"
          @change="paginaActual = 1"
        >
          <option :value="5">5</option>
          <option :value="10">10</option>
          <option :value="25">25</option>
          <option :value="50">50</option>
        </select>
      </div>
    </div>

    <!-- Modal de libros -->
    <dialog ref="modalLibrosRef" id="modal_libros" class="modal">
      <ModalLibros
        :libro="dataLibro"
        :modo="modoModal"
        @cerrar="cerrarModalLibros"
        @guardar="guardarLibro"
      />
    </dialog>

    <!-- Modal de colecciones -->
    <dialog ref="modalColeccionesRef" id="modal_colecciones" class="modal">
      <div class="modal-box w-2/3">
        <div class="flex items-center justify-between">
          <h3 class="font-bold text-lg">Editar Colecciones</h3>
          <button
            class="btn btn-sm btn-circle btn-ghost"
            @click="cerrarModalColecciones"
          >
            ✕
          </button>
        </div>

        <div>
          <form class="flex gap-3 my-4">
            <input
              type="text"
              class="input input-bordered w-full"
              placeholder="Nombre de la colección"
              v-model="nuevaColeccion"
              @keyup.enter="agregarColeccion"
              required
            />
            <button
              class="btn btn-info"
              @click.prevent="agregarColeccion"
              type="button"
            >
              <span class="mdi mdi-plus text-xl"></span>
              Agregar
            </button>
          </form>
        </div>

        <div class="overflow-x-auto h-96 w-full">
          <table class="table table-md table-pin-rows table-pin-cols">
            <thead>
              <tr>
                <td>Colección</td>
                <td>Acciones</td>
              </tr>
            </thead>
            <tbody>
              <tr v-for="coleccion in coleccionesOptions" :key="coleccion">
                <td>{{ coleccion }}</td>
                <td>
                  <button
                    class="btn btn-soft btn-error btn-sm"
                    @click="eliminarColeccion(coleccion)"
                  >
                    <span class="mdi mdi-delete"></span>
                    Eliminar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex justify-end">
          <button class="btn btn-primary mt-4" @click="guardarColecciones">
            Guardar cambios
          </button>
        </div>
      </div>
    </dialog>

    <!-- Alerta -->
    <Alert v-if="alert" :type="alertData.type" :mensaje="alertData.mensaje" />
  </section>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import ModalLibros from "./componentes_libros/ModalLibros.vue";
import Alert from "../../alert/Alert.vue";

const libros = ref([]);
const dataLibro = ref({});
const modalLibrosRef = ref(null);
const modalColeccionesRef = ref(null);
const modoModal = ref("crear");
const cargando = ref(true);

// Paginación
const paginaActual = ref(1);
const librosPorPagina = ref(10);

// Colecciones
const coleccionesOptions = ref([]);
const nuevaColeccion = ref("");

// Alertas
const alertData = ref({});
const alert = ref(false);

// Computed para paginación
const librosPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * librosPorPagina.value;
  const fin = inicio + librosPorPagina.value;
  return libros.value.slice(inicio, fin);
});

const totalPaginas = computed(() => {
  return Math.ceil(libros.value.length / librosPorPagina.value);
});

const totalLibros = computed(() => libros.value.length);

const rangoInicio = computed(() => {
  if (libros.value.length === 0) return 0;
  return (paginaActual.value - 1) * librosPorPagina.value + 1;
});

const rangoFin = computed(() => {
  const fin = paginaActual.value * librosPorPagina.value;
  return Math.min(fin, libros.value.length);
});

const paginasVisibles = computed(() => {
  const total = totalPaginas.value;
  const actual = paginaActual.value;
  const paginas = [];

  let inicio = Math.max(1, actual - 2);
  let fin = Math.min(total, actual + 2);

  if (actual <= 3) {
    fin = Math.min(5, total);
  } else if (actual >= total - 2) {
    inicio = Math.max(1, total - 4);
  }

  for (let i = inicio; i <= fin; i++) {
    paginas.push(i);
  }

  return paginas;
});

const irAPagina = (pagina) => {
  if (pagina >= 1 && pagina <= totalPaginas.value) {
    paginaActual.value = pagina;
  }
};

// Funciones de libros
const obtenerLibros = async () => {
  try {
    cargando.value = true;
    const response = await fetch("/api/libros/obtener-filtrados");
    if (!response.ok) {
      throw new Error("Error al obtener los libros");
    }
    const data = await response.json();

    libros.value = data || [];
    console.log("Libros obtenidos:", libros.value.length);
  } catch (error) {
    console.error(error);
    mostrarAlerta("error", "Error al cargar los libros");
  } finally {
    cargando.value = false;
  }
};

const abrirModalNuevo = () => {
  modoModal.value = "crear";
  dataLibro.value = {};
  modalLibrosRef.value?.showModal();
};

const editarLibro = (libro) => {
  console.log("Editar libro:", libro);
  modoModal.value = "editar";
  dataLibro.value = { ...libro };
  modalLibrosRef.value?.showModal();
};

const cerrarModalLibros = () => {
  modalLibrosRef.value?.close();
  dataLibro.value = {};
};

const guardarLibro = async (libroData) => {
  console.log("=== GUARDAR LIBRO ===");
  console.log("Modo:", modoModal.value);
  console.log("Datos:", libroData);

  try {
    let response;

    if (modoModal.value === "crear") {
      // Usar API específica de libros
      response = await fetch("/api/libros/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(libroData),
      });
    } else {
      // Usar API específica de actualización de libros
      response = await fetch(`/api/libros/actualizar?id=${libroData._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(libroData),
      });
    }

    console.log("Respuesta status:", response.status);

    if (!response.ok) {
      const errorData = await response.json();
      mostrarAlerta(
        "error",
        modoModal.value === "crear"
          ? `Error al crear libro: ${errorData.error || response.statusText}`
          : `Error al actualizar libro: ${
              errorData.error || response.statusText
            }`
      );
    }

    const resultado = await response.json();
    console.log("Resultado:", resultado);

    await obtenerLibros();
    cerrarModalLibros();

    mostrarAlerta(
      "success",
      modoModal.value === "crear"
        ? "Libro creado exitosamente"
        : "Libro actualizado exitosamente"
    );

    console.log("=== LIBRO GUARDADO EXITOSAMENTE ===");
  } catch (error) {
    console.error("❌ Error al guardar libro:", error);
    mostrarAlerta("error", `Error al guardar: ${error.message}`);
  }
};

const eliminarLibro = async (id) => {
  if (confirm("¿Estás seguro de eliminar este libro?")) {
    try {
      console.log("Eliminando libro:", id);
      const response = await fetch(`/api/libros/eliminar?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        mostrarAlerta(
          "error",
          `Error al eliminar libro: ${errorData.error || response.statusText}`
        );
        throw new Error(errorData.error || "Error al eliminar libro");
      }

      const resultado = await response.json();
      console.log("Libro eliminado:", resultado);

      await obtenerLibros();

      mostrarAlerta("success", "Libro eliminado exitosamente");
    } catch (error) {
      console.error("Error al eliminar libro:", error);
      mostrarAlerta("error", `Error al eliminar: ${error.message}`);
    }
  }
};

// Funciones de colecciones
const abrirModalColecciones = () => {
  modalColeccionesRef.value?.showModal();
};

const cerrarModalColecciones = () => {
  modalColeccionesRef.value?.close();
};

const agregarColeccion = () => {
  if (
    nuevaColeccion.value &&
    nuevaColeccion.value.trim() &&
    !coleccionesOptions.value.includes(nuevaColeccion.value.trim())
  ) {
    coleccionesOptions.value.push(nuevaColeccion.value.trim());
    nuevaColeccion.value = "";
  } else {
    mostrarAlerta("error", "La colección ya existe o el campo está vacío");
  }
};

const eliminarColeccion = (coleccion) => {
  coleccionesOptions.value = coleccionesOptions.value.filter(
    (c) => c !== coleccion
  );
  mostrarAlerta("success", "Colección eliminada");
};

const guardarColecciones = async () => {
  try {
    const response = await fetch("/api/libros/actualizar?id=colecciones", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ colecciones: coleccionesOptions.value }),
    });

    if (!response.ok) {
      mostrarAlerta("error", "Error al guardar las colecciones");
      throw new Error("Error al guardar las colecciones");
    }

    const data = await response.json();
    console.log("Colecciones guardadas:", data);

    cerrarModalColecciones();
    mostrarAlerta("success", "Colecciones guardadas exitosamente");
  } catch (error) {
    console.error(error);
    mostrarAlerta("error", "Error al guardar las colecciones");
  }
};

const obtenerColecciones = async () => {
  try {
    const response = await fetch("/api/libros/obtener?id=colecciones");
    if (!response.ok) {
      throw new Error("Error al obtener las colecciones");
    }
    const data = await response.json();
    coleccionesOptions.value = data.colecciones || [];
    console.log("Colecciones obtenidas:", coleccionesOptions.value.length);
  } catch (error) {
    console.error(error);
  }
};

// Función para mostrar alertas
const mostrarAlerta = (tipo, mensaje) => {
  alertData.value = { type: tipo, mensaje: mensaje };
  alert.value = true;
  setTimeout(() => {
    alert.value = false;
  }, 3000);
};

// Lifecycle
onMounted(() => {
  obtenerLibros();
  obtenerColecciones();
});
</script>
