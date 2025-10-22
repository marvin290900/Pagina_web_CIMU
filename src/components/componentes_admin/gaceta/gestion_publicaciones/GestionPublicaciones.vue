<template>
  <section class="w-4/5 mx-auto">
    <div
      v-if="cargandoPublicaciones"
      class="w-full flex justify-center h-[100vh]"
    >
      <span class="loading loading-spinner text-primary"></span>
    </div>
    <div class="grid md:grid-cols-4 py-4 gap-4">
      <h2 class="text-3xl font-bold">
        <a href="/admin/gaceta"
          ><button class="btn mr-3 btn-ghost">
            <span class="mdi mdi-arrow-left"></span>Regresar
          </button></a
        >Publicaciones
      </h2>

      <select class="select" v-model="coleccion">
        <option disabled :value="coleccion">{{ coleccion }}</option>
        <option v-for="categoria in categoriasOptions" :key="categoria.value">
          {{ categoria.label }}
        </option>
      </select>

      <div>
        <label class="input">
          <span class="mdi mdi-magnify text-2xl text-gray-500"></span>
          <input
            v-model="busquedaPublicacion"
            type="search"
            class="grow"
            placeholder="Buscar publicación por título o usuario"
          />
        </label>
      </div>
      <button class="btn btn-primary" @click="abrirModalNuevo">
        <span class="mdi mdi-plus text-xl"></span>
        Publicar
      </button>
    </div>
    <!-- Mensaje cuando no ha datos que mostrar -->
    <div
      v-if="!cargandoPublicaciones && publicacionesPaginadas.length === 0"
      class="text-center py-20 flex flex-col items-center gap-4"
    >
      <span class="mdi mdi-alert-circle text-5xl text-gray-500"></span>
      <p class="text-gray-500">No hay publicaciones para mostrar.</p>
    </div>

    <!-- Tabla de publicaciones -->
    <div
      v-if="publicacionesPaginadas.length > 0"
      class="overflow-x-auto rounded-box border border-base-content/5 bg-base-100 my-8"
    >
      <div class="flex w-full p-6 text-2xl justify-center">
        <h2>{{ coleccion }}</h2>
      </div>
      <table class="table">
        <thead>
          <tr>
            <th>Estado</th>
            <th>Fecha publicación</th>
            <th>Título</th>
            <th>Vistas</th>
            <th>Usuario</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <!-- Mostrar solo usuarios de la página actual -->
          <tr
            v-for="publicacion in publicacionesPaginadas"
            :key="publicacion._id"
          >
            <td>
              <div
                v-if="publicacion.estado && publicacion.estado === 'activo'"
                class="status status-success"
              ></div>
              <div
                v-else-if="
                  publicacion.estado && publicacion.estado === 'inactivo'
                "
                class="status status-error"
              ></div>
            </td>
            <td>
              {{ new Date(publicacion.fecha_publicacion).toLocaleDateString() }}
            </td>
            <td>{{ publicacion.titulo }}</td>
            <td>{{ publicacion.visitas }}</td>
            <td>{{ publicacion.autor.nombre }}</td>

            <td class="flex gap-3">
              <div class="tooltip tooltip-bottom" data-tip="Editar">
                <button
                  class="btn btn-soft btn-primary btn-sm"
                  @click="editarPublicacion(publicacion)"
                >
                  <span class="mdi mdi-pencil text-lg"></span>
                </button>
              </div>
              <!-- Desactivar publicacion -->
              <div
                class="tooltip tooltip-bottom"
                data-tip="Desactivar publicacion"
                v-if="publicacion.estado === 'activo'"
              >
                <button
                  v-if="publicacion.estado === 'activo'"
                  class="btn btn-soft btn-success g btn-sm"
                  @click="desactivarPublicacion(publicacion, 'inactivo')"
                >
                  <span class="mdi mdi-file-document-check text-lg"></span>
                </button>
              </div>
              <!-- Activar publicacion -->
              <div
                v-if="publicacion.estado === 'inactivo'"
                class="tooltip tooltip-bottom"
                data-tip="Activar publicacion"
              >
                <button
                  class="btn btn-soft btn-error btn-sm"
                  @click="desactivarPublicacion(publicacion, 'activo')"
                >
                  <span class="mdi mdi-file-document-remove text-lg"></span>
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
              <div class="tooltip tooltip-bottom" data-tip="Eliminar">
                <button
                  class="btn btn-soft btn-error btn-sm"
                  @click="abrirModalEliminar(publicacion)"
                >
                  <span class="mdi mdi-delete text-lg"></span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginación -->
    <div
      v-if="publicacionesPaginadas.length > 0"
      class="flex items-center justify-between py-4"
    >
      <!-- Información de registros -->
      <div class="text-sm text-gray-600">
        Mostrando {{ rangoInicio }} - {{ rangoFin }} de
        {{ totalPublicaciones }} publicaciones
      </div>

      <!-- Controles de paginación -->
      <div class="join">
        <button
          class="join-item btn btn-sm btn-soft btn-primary"
          :disabled="paginaActual === 1"
          @click="irAPagina(1)"
        >
          «
        </button>
        <button
          class="join-item btn btn-sm btn-soft btn-primary"
          :disabled="paginaActual === 1"
          @click="irAPagina(paginaActual - 1)"
        >
          ‹
        </button>

        <button
          v-for="pagina in paginasVisibles"
          :key="pagina"
          class="join-item btn btn-sm btn-soft btn-primary"
          :class="{ 'btn-active': pagina === paginaActual }"
          @click="irAPagina(pagina)"
        >
          {{ pagina }}
        </button>

        <button
          class="join-item btn btn-sm btn-soft btn-primary"
          :disabled="paginaActual === totalPaginas"
          @click="irAPagina(paginaActual + 1)"
        >
          ›
        </button>
        <button
          class="join-item btn btn-sm btn-soft btn-primary"
          :disabled="paginaActual === totalPaginas"
          @click="irAPagina(totalPaginas)"
        >
          »
        </button>
      </div>

      <!-- Selector de registros por página -->
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-600">Mostrar:</span>
        <select
          v-model="publicacionesPorPagina"
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

    <!-- Modal agregar publicacion -->
    <dialog ref="modalRef" id="modal_publicacion" class="modal">
      <modal-usuarios
        :publicacion="dataPublicacion"
        :modo="modoModal"
        @cerrar="cerrarModal"
        @guardar="guardarPublicacion"
      />
    </dialog>

    <!-- Modal eliminar usuario -->
    <dialog ref="modalEliminarRef" id="modal_eliminar" class="modal">
      <div class="modal-box w-11/12 max-w-3xl">
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-bold">Confirmar eliminación</h3>
          <button
            class="btn btn-ghost rounded-full"
            @click="cerrarModalEliminar"
          >
            <span class="mdi mdi-close text-lg"></span>
          </button>
        </div>
        <div class="flex justify-center">
          <span class="mdi mdi-alert-circle text-6xl text-red-500"></span>
        </div>
        <p class="pt-4 pb-8 text-center">
          ¿Estás seguro de que deseas eliminar la publicación
          <strong>{{ dataPublicacion.titulo }}</strong
          >? Esta acción no se puede deshacer.
        </p>

        <div class="flex gap-4 justify-end">
          <button class="btn btn-ghost" @click="cerrarModalEliminar">
            Cancelar
          </button>
          <button
            class="btn btn-error text-white"
            @click="eliminarPublicacion(dataPublicacion)"
          >
            Eliminar
          </button>
        </div>
      </div>
    </dialog>

    <!-- Modal eliminar usuario -->
    <dialog ref="modalGuardandoRef" id="modal_guardando" class="modal">
      <div class="modal-box w-2/3">
        <span class="loading loading-spinner text-primary"></span> Guardando...
      </div>
    </dialog>

    <Alert v-if="alert" :type="alertData.type" :mensaje="alertData.mensaje" />
  </section>
</template>

<script setup>
import { onMounted, ref, computed, watch } from "vue";
import modalUsuarios from "./componentes/ModalPublicacion.vue";
import Alert from "../../../alert/Alert.vue";
import mod from "astro/zod";

const publicaciones = ref([]);
const dataPublicacion = ref({});
const modalRef = ref(null);
const modalEliminarRef = ref(null);
const modalGuardandoRef = ref(null);
const modoModal = ref("crear");
const alert = ref(false);
const alertData = ref({});
const busquedaPublicacion = ref(""); // Búsqueda por nombre
const cargandoPublicaciones = ref(true);
const guardando = ref(false);

const coleccion = ref("Seleccionar Sección");
const categoriasOptions = [
  { value: "opinion", label: "Opinion Multidisciplinaria" },
  { value: "actualidad", label: "Actualidad" },
  { value: "audiovisuales", label: "Audio visuales" },
  { value: "vida_universitaria", label: "Vida universitaria" },
  { value: "memoria", label: "Memoria colectiva" },
];

// Variables de paginación
const paginaActual = ref(1);
const publicacionesPorPagina = ref(10);

// Computed para publicaciones paginadas
const publicacionesPaginadas = computed(() => {
  if (busquedaPublicacion.value) {
    //filtrar por nombre o autor
    const filtro = busquedaPublicacion.value.toLowerCase();
    return publicaciones.value.filter(
      (publicacion) =>
        publicacion.titulo.toLowerCase().includes(filtro) ||
        publicacion.autor.nombre.toLowerCase().includes(filtro)
    );
  }
  const inicio = (paginaActual.value - 1) * publicacionesPorPagina.value;
  const fin = inicio + publicacionesPorPagina.value;
  return publicaciones.value.slice(inicio, fin);
});

// Computed para total de páginas
const totalPaginas = computed(() => {
  return Math.ceil(publicaciones.value.length / publicacionesPorPagina.value);
});

// Computed para total de publicaciones
const totalPublicaciones = computed(() => publicaciones.value.length);

// Computed para rango de registros mostrados
const rangoInicio = computed(() => {
  if (publicaciones.value.length === 0) return 0;
  return (paginaActual.value - 1) * publicacionesPorPagina.value + 1;
});

const rangoFin = computed(() => {
  const fin = paginaActual.value * publicacionesPorPagina.value;
  return Math.min(fin, publicaciones.value.length);
});

// Computed para páginas visibles (máximo 5 botones)
const paginasVisibles = computed(() => {
  const total = totalPaginas.value;
  const actual = paginaActual.value;
  const paginas = [];

  let inicio = Math.max(1, actual - 2);
  let fin = Math.min(total, actual + 2);

  // Ajustar si estamos cerca del inicio
  if (actual <= 3) {
    fin = Math.min(5, total);
  }
  // Ajustar si estamos cerca del final
  else if (actual >= total - 2) {
    inicio = Math.max(1, total - 4);
  }

  for (let i = inicio; i <= fin; i++) {
    paginas.push(i);
  }

  return paginas;
});

// Función para ir a una página específica
const irAPagina = (pagina) => {
  if (pagina >= 1 && pagina <= totalPaginas.value) {
    paginaActual.value = pagina;
  }
};

watch(coleccion, async () => {
  cargandoPublicaciones.value = true;
  await obtenerPublicaciones();
});

const obtenerPublicaciones = async () => {
  if (coleccion.value === "Seleccionar Sección") {
    cargandoPublicaciones.value = false;
    publicaciones.value = [];
    return;
  }

  let coleccionBusqueda = categoriasOptions.find(
    (cat) => cat.label === coleccion.value
  );

  console.log("Obteniendo publicaciones de la colección:", coleccionBusqueda);

  try {
    const response = await fetch(
      `/api/gaceta/obtener?categoria=${coleccionBusqueda.value}`
    );
    if (!response.ok) {
      throw new Error("Error al obtener la coleccion");
    }
    const data = await response.json();
    console.log("Datos obtenidos:", data);

    publicaciones.value = data.rows.map((row) => row.doc);

    // Resetear a página 1 cuando se recargan los datos
    paginaActual.value = 1;
    cargandoPublicaciones.value = false;
    console.log("Publicaciones obtenidas:", publicaciones.value.length);
  } catch (error) {
    console.error(error);
  }
};

const abrirModalNuevo = () => {
  modoModal.value = "crear";
  dataPublicacion.value = {};
  modalRef.value?.showModal();
};

const abrirModalEliminar = (publicacion) => {
  dataPublicacion.value = { ...publicacion };
  modalEliminarRef.value?.showModal();
};

const cerrarModalEliminar = () => {
  modalEliminarRef.value?.close();
  dataPublicacion.value = {};
};

const abrirModalGuardando = () => {
  guardando.value = true;
  if (guardando.value) {
    modalGuardandoRef.value.showModal();
  }
};

const cerrarModalGuardando = () => {
  guardando.value = false;
  if (!guardando.value) {
    modalGuardandoRef.value.close();
  }
};

const editarPublicacion = (publicacion) => {
  console.log("Editar publicación:", publicacion);
  modoModal.value = "editar";
  dataPublicacion.value = { ...publicacion };
  modalRef.value?.showModal();
};

const cerrarModal = () => {
  modalRef.value?.close();
  dataPublicacion.value = {};
};

const guardarPublicacion = async (publicacionData) => {
  console.log("=== GUARDAR PUBLICACIÓN ===");
  console.log("Modo:", modoModal.value);
  console.log("Datos:", publicacionData);
  abrirModalGuardando();

  try {
    let response;

    if (modoModal.value === "crear") {
      console.log("Creando nueva publicación...");
      const datosLimpios = { ...publicacionData };
      if (!datosLimpios._id) {
        delete datosLimpios._id;
      }

      response = await fetch(
        `/api/gaceta/crear?coleccion=${datosLimpios.tipo}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(datosLimpios),
        }
      );
    } else {
      console.log("Actualizando publicación existente...");

      if (!publicacionData._id) {
        alertData.value = {
          type: "warning",
          mensaje: "No se puede actualizar: falta el ID de la publicación",
        };
        alert.value = true;
        setTimeout(() => (alert.value = false), 5000);
        throw new Error(
          "No se puede actualizar: falta el ID de la publicación"
        );
      }

      response = await fetch(
        `/api/gaceta/actualizar?coleccion=${publicacionData.tipo}&id=${publicacionData._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(publicacionData),
        }
      );
    }

    console.log("Respuesta status:", response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error en respuesta:", errorData);
      alertData.value = {
        type: "error",
        mensaje:
          errorData.error ||
          errorData.mensaje ||
          "Error al guardar publicación",
      };
      alert.value = true;
      setTimeout(() => (alert.value = false), 5000);
      throw new Error(
        errorData.error || errorData.mensaje || "Error al guardar"
      );
    }

    const resultado = await response.json();
    console.log("Resultado:", resultado);

    await obtenerPublicaciones();
    cerrarModal();
    cerrarModalGuardando();

    alertData.value = {
      type: "success",
      mensaje:
        modoModal.value === "crear"
          ? "Publicación creada exitosamente"
          : "Publicación actualizada exitosamente",
    };
    alert.value = true;
    setTimeout(() => (alert.value = false), 5000);
  } catch (error) {
    console.error("❌ Error al guardar publicación:", error);
    console.error("❌ Mensaje:", error.message);
  }
};

const eliminarPublicacion = async (publicacion) => {
  try {
    console.log("Eliminando publicación:", publicacion);
    abrirModalGuardando();

    const response = await fetch(
      `/api/gaceta/eliminar?coleccion=${publicacion.tipo}&id=${publicacion._id}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al eliminar usuario");
    }

    const resultado = await response.json();
    console.log("Publicación eliminada:", resultado);

    // Recargar la lista
    await obtenerPublicaciones();

    // Mostrar alerta de éxito
    alertData.value = {
      type: "success",
      mensaje: "Publicación eliminada exitosamente",
    };
    alert.value = true;
    cerrarModalGuardando();
    modalEliminarRef.value?.close();
    setTimeout(() => (alert.value = false), 5000);
  } catch (error) {
    console.error("Error al eliminar publicación:", error);
    alertData.value = {
      type: "error",
      mensaje: `Error al eliminar: ${error.message}`,
    };
    alert.value = true;
    setTimeout(() => (alert.value = false), 5000);
  }
};

const desactivarPublicacion = async (publicacionData, nuevoEstado) => {
  // Lógica para desactivar la publicación
  console.log("Desactivando publicación:", publicacionData);
  abrirModalGuardando();
  // hacer una llamada a la API para desactivar

  publicacionData.estado = nuevoEstado;
  const response = await fetch(
    `/api/gaceta/actualizar?coleccion=${publicacionData.tipo}&id=${publicacionData._id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(publicacionData),
    }
  );

  console.log("Respuesta status:", response.status);

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Error en respuesta:", errorData);
    alertData.value = {
      type: "error",
      mensaje:
        errorData.error ||
        errorData.mensaje ||
        "Error al desactivar publicación",
    };
    alert.value = true;
    setTimeout(() => (alert.value = false), 5000);

    throw new Error(
      errorData.error || errorData.mensaje || "Error al desactivar publicación"
    );
  }

  const resultado = await response.json();
  console.log("Resultado:", resultado);

  await obtenerPublicaciones();
  cerrarModalGuardando();
  alertData.value = {
    type: "success",
    mensaje:
      nuevoEstado === "inactivo"
        ? "Publicación desactivada exitosamente"
        : "Publicación activada exitosamente",
  };
  alert.value = true;
  setTimeout(() => (alert.value = false), 5000);

  console.log("=== PUBLICACIÓN DESACTIVADA EXITOSAMENTE ===");
};

onMounted(() => {
  obtenerPublicaciones();
});
</script>
