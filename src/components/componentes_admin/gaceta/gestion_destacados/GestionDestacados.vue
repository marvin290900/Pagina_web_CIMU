<template>
  <section class="w-4/5 mx-auto">
    <div v-if="cargando" class="w-full flex justify-center h-[100vh]">
      <span class="loading loading-spinner text-primary"></span>
    </div>
    <!-- Publicación destacada -->
    <div class="pt-8 pb-12">
      <div class="flex justify-between">
        <a href="/admin/gaceta">
          <button class="btn mr-3 btn-ghost">
            <span class="mdi mdi-arrow-left"></span>Regresar
          </button>
        </a>

        <h2 class="text-2xl font-bold">Publicacion destacada</h2>
        <button
          @click="abrirModalAgregar('destacada')"
          :class="`btn ${
            publicacionDestacada.length > 0 ? 'btn-disabled' : 'btn-primary'
          } `"
        >
          {{
            publicacionDestacada.length > 0
              ? "Cambiar destacada"
              : "Agregar destacada"
          }}
        </button>
      </div>
      <div
        v-if="publicacionDestacada.length > 0"
        class="overflow-x-auto rounded-box border border-base-content/5 bg-base-100 my-8"
      >
        <div class="flex w-full p-6 text-2xl justify-center"></div>
        <table class="table h-full">
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
              v-for="publicacion in publicacionDestacada"
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
                {{
                  new Date(publicacion.fecha_publicacion).toLocaleDateString()
                }}
              </td>
              <td>{{ publicacion.titulo }}</td>
              <td>{{ publicacion.visitas }}</td>
              <td>{{ publicacion.autor.nombre }}</td>

              <td class="flex gap-3">
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
                    @click="eliminarDestacados(publicacion, 'destacada')"
                  >
                    <span class="mdi mdi-delete text-lg"></span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="divider"></div>

    <!-- Publicaciones destacadas -->
    <div class="py-12">
      <div class="flex justify-between">
        <h2 class="text-2xl font-bold">Publicaciones destacadas</h2>
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
        <button
          class="btn btn-primary"
          @click="abrirModalAgregar('destacadas')"
        >
          Agregar destacada
        </button>
      </div>
      <!-- Tabla de publicaciones destacadas -->
      <div
        v-if="publicacionesPaginadas.length > 0"
        class="overflow-x-auto rounded-box border border-base-content/5 bg-base-100 my-8"
      >
        <div class="flex w-full p-6 text-2xl justify-center"></div>
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
                {{
                  new Date(publicacion.fecha_publicacion).toLocaleDateString()
                }}
              </td>
              <td>{{ publicacion.titulo }}</td>
              <td>{{ publicacion.visitas }}</td>
              <td>{{ publicacion.autor.nombre }}</td>

              <td class="flex gap-3">
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
                    @click="eliminarDestacados(publicacion, 'destacadas')"
                  >
                    <span class="mdi mdi-delete text-lg"></span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
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
      </div>
    </div>

    <Alert v-if="alert" :type="alertData.type" :mensaje="alertData.mensaje" />
  </section>

  <dialog ref="modalAgregarRef" id="modal_agregar" class="modal w-full">
    <modal-agregar
      @cerrarModalAgregar="cerrarModalAgregar"
      :modo="modo"
      @guardarCambios="agregarAdestacados"
    />
  </dialog>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import Alert from "../../../alert/Alert.vue";
import ModalAgregar from "./componentes/ModalAgregar.vue";
import { set } from "zod/v4";
import { id } from "zod/v4/locales";

const alert = ref(false);
const alertData = ref({
  type: "",
  mensaje: "",
});

const publicacionDestacada = ref([]);
const cargando = ref(true);
const publicaciones = ref([]);
const modalAgregarRef = ref(null);
const modo = ref("");

// Variables de paginación
const paginaActual = ref(1);
const publicacionesPorPagina = ref(10);
const busquedaPublicacion = ref(""); // Búsqueda por nombre

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

const abrirModalAgregar = (modoParam) => {
  modo.value = modoParam;
  const modal = modalAgregarRef.value;
  if (modal) {
    modal.showModal();
  }
};

const cerrarModalAgregar = () => {
  const modal = modalAgregarRef.value;
  if (modal) {
    modal.close();
  }
};

const eliminarDestacados = (publicacion, coleccion) => {
  console.log("mod", coleccion);
  console.log("Publicación a eliminar de destacados:", publicacion);

  if (coleccion === "destacada") {
    const dataAgregar = {
      id: publicacion._id,
      coleccion: publicacion.tipo,
    };

    eliminarDestacada("publicacion_del_dia", dataAgregar);
    cerrarModalAgregar();
  }
  if (coleccion === "destacadas") {
    const dataAgregar = {
      id: publicacion._id,
      coleccion: publicacion.tipo,
    };

    eliminarDestacada("publicacion_destacadas", dataAgregar);
    cerrarModalAgregar();
  }
};

const agregarAdestacados = (publicacion, coleccion) => {
  console.log("mod", coleccion);
  console.log("Publicación a agregar como destacada:", publicacion);
  // Lógica para agregar la publicación como destacada

  if (coleccion === "destacada") {
    const dataAgregar = {
      id: publicacion._id,
      coleccion: publicacion.tipo,
    };

    actualizarDocumento("publicacion_del_dia", dataAgregar);
    cerrarModalAgregar();
  }
  if (coleccion === "destacadas") {
    const dataAgregar = {
      id: publicacion._id,
      coleccion: publicacion.tipo,
    };

    actualizarDocumento("publicacion_destacadas", dataAgregar);
    cerrarModalAgregar();
  }
};

const actualizarDocumento = async (id, datosActualizados) => {
  try {
    const response = await fetch(
      `/api/gaceta/agregar_destacada?id=${id}&accion=agregar`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datosActualizados),
      }
    );

    if (response.status === 409) {
      alertData.value = {
        type: "warning",
        mensaje: "La publicación ya está en destacados.",
      };
      alert.value = true;
      setTimeout(() => {
        alert.value = false;
      }, 5000);
      return;
    }

    if (!response.ok) {
      alertData.value = {
        type: "error",
        mensaje: "Error al agregar publicación a destacados.",
      };
      alert.value = true;
      setTimeout(() => {
        alert.value = false;
      }, 5000);
      // throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    obtenerPublicacionDestacada();
    obtenerPublicaciones();
    console.log("Documento actualizado:", json);
    alertData.value = {
      type: "success",
      mensaje: "Publicacion agregada a destacados.",
    };
    alert.value = true;
    setTimeout(() => {
      alert.value = false;
    }, 5000);
  } catch (error) {
    alertData.value = {
      type: "error",
      mensaje: "Error al agregar publicación a destacados.",
    };
    alert.value = true;
    setTimeout(() => {
      alert.value = false;
    }, 5000);
    console.error("Error al actualizar documento:", error);
  }
};

const eliminarDestacada = async (id, datosActualizados) => {
  try {
    const response = await fetch(
      `/api/gaceta/agregar_destacada?id=${id}&accion=eliminar`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datosActualizados),
      }
    );

    if (!response.ok) {
      alertData.value = {
        type: "error",
        mensaje: "Error al eliminar publicación de destacados.",
      };
      alert.value = true;
      setTimeout(() => {
        alert.value = false;
      }, 5000);
      // throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    obtenerPublicacionDestacada();
    obtenerPublicaciones();
    console.log("Documento actualizado:", json);
    alertData.value = {
      type: "success",
      mensaje: "Publicacion eliminada de destacados.",
    };
    alert.value = true;
    setTimeout(() => {
      alert.value = false;
    }, 5000);
  } catch (error) {
    alertData.value = {
      type: "error",
      mensaje: "Error al eliminar publicación de destacados.",
    };
    alert.value = true;
    setTimeout(() => {
      alert.value = false;
    }, 5000);
    console.error("Error al eliminar documento:", error);
  }
};

const obtenerPublicacionDestacada = async () => {
  try {
    const res = await fetch(
      `/api/gaceta/obtener_destacados?id=publicacion_del_dia`
    );

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const json = await res.json();
    publicacionDestacada.value = json;

    console.log("Datos obtenidos destacada:", json);
  } catch (error) {
    console.error("Error al obtener datos:", error);
  }
};

const obtenerPublicaciones = async () => {
  try {
    const res = await fetch(
      "/api/gaceta/obtener_destacados?id=publicacion_destacadas"
    );

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const json = await res.json();
    publicaciones.value = json;
    cargando.value = false;
  } catch (error) {
    console.error("Error al obtener datos:", error);
  }
};

onMounted(() => {
  obtenerPublicacionDestacada();
  obtenerPublicaciones();
});
</script>
