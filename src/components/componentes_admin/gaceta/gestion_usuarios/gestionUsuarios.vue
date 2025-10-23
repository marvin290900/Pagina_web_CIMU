<template>
  <section class="w-4/5 mx-auto">
    <div v-if="cargandoUsuarios" class="w-full flex justify-center h-[100vh]">
      <span class="loading loading-spinner text-primary"></span>
    </div>
    <div v-else class="flex justify-between py-4">
      <h2 class="text-3xl font-bold">
        <a href="/admin/gaceta"
          ><button class="btn mr-3 btn-ghost">
            <span class="mdi mdi-arrow-left"></span>Regresar
          </button></a
        >Gestion de usuarios
      </h2>
      <div>
        <label class="input">
          <span class="mdi mdi-magnify text-2xl text-gray-500"></span>
          <input
            v-model="busquedaUsuario"
            type="search"
            class="grow"
            placeholder="Buscar"
          />
        </label>
      </div>
      <button class="btn btn-primary" @click="abrirModalNuevo">
        <span class="mdi mdi-plus text-xl"></span>
        Agregar
      </button>
    </div>

    <div
      class="overflow-x-auto rounded-box border border-base-content/5 bg-base-100"
    >
      <table class="table">
        <!-- head -->
        <thead>
          <tr>
            <th>Estado</th>
            <th>Foto</th>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <!-- Mostrar solo usuarios de la página actual -->
          <tr v-for="usuario in usuariosPaginados" :key="usuario._id">
            <td>
              <div
                v-if="usuario.estado && usuario.estado === 'activo'"
                class="status status-success"
              ></div>
              <div
                v-else-if="usuario.estado && usuario.estado === 'inactivo'"
                class="status status-error"
              ></div>
            </td>
            <td>
              <img
                v-if="usuario.foto"
                class="mask mask-circle w-8 h-8 object-cover"
                :src="usuario.foto"
                :alt="`foto de ${usuario.nombre}`"
              />
              <div v-else class="avatar avatar-placeholder">
                <div class="bg-primary text-neutral-content w-8 rounded-full">
                  <span class="uppercase">{{ usuario.nombre.charAt(0) }}</span>
                </div>
              </div>
            </td>
            <td>{{ usuario.nombre }}</td>
            <td>{{ usuario.correo }}</td>
            <td class="flex gap-3">
              <div class="tooltip tooltip-bottom" data-tip="Editar">
                <button
                  class="btn btn-soft btn-primary btn-sm"
                  @click="editarUsuario(usuario)"
                >
                  <span class="mdi mdi-pencil text-lg"></span>
                </button>
              </div>
              <div
                v-if="usuario.estado === 'inactivo'"
                class="tooltip tooltip-bottom"
                data-tip="Activar usuario"
              >
                <button
                  class="btn btn-soft btn-error btn-sm"
                  @click="desactivarUsuario(usuario._id, usuario.estado)"
                >
                  <span class="mdi mdi-account-cancel text-lg"></span>
                </button>
              </div>
              <div
                v-if="usuario.estado === 'activo'"
                class="tooltip tooltip-bottom"
                data-tip="Desactivar usuario"
              >
                <button
                  class="btn btn-soft btn-success btn-sm"
                  @click="desactivarUsuario(usuario._id, usuario.estado)"
                >
                  <span class="mdi mdi-account-check text-lg"></span>
                </button>
              </div>
              <a :href="`/gaceta/perfil/${usuario._id}`" target="_blank">
                <div class="tooltip tooltip-bottom" data-tip="Ver perfil">
                  <button class="btn btn-soft btn-info btn-sm">
                    <span class="mdi mdi-eye-outline text-lg"></span>
                  </button>
                </div>
              </a>
              <div class="tooltip tooltip-bottom" data-tip="Eliminar">
                <button
                  class="btn btn-soft btn-error btn-sm"
                  @click="abrirModalEliminar(usuario)"
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
    <div class="flex items-center justify-between py-4">
      <!-- Información de registros -->
      <div class="text-sm text-gray-600">
        Mostrando {{ rangoInicio }} - {{ rangoFin }} de
        {{ totalUsuarios }} usuarios
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
          v-model="usuariosPorPagina"
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

    <!-- Modal agregar usuario -->
    <dialog ref="modalRef" id="modal_libros" class="modal">
      <modal-usuarios
        :usuario="dataUsuario"
        :modo="modoModal"
        @cerrar="cerrarModal"
        @guardar="guardarUsuario"
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
          ¿Estás seguro de que deseas eliminar al usuario
          <strong>{{ dataUsuario.nombre }}</strong
          >? Esta acción no se puede deshacer.
        </p>

        <div class="flex gap-4 justify-end">
          <button class="btn btn-ghost" @click="cerrarModalEliminar">
            Cancelar
          </button>
          <button
            class="btn btn-error text-white"
            @click="eliminarUsuario(dataUsuario._id)"
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
import { onMounted, ref, computed } from "vue";
import modalUsuarios from "./componentes/modalUsuarios.vue";
import Alert from "../../../alert/Alert.vue";

const usuarios = ref([]);
const dataUsuario = ref({});
const modalRef = ref(null);
const modalEliminarRef = ref(null);
const modalGuardandoRef = ref(null);
const modoModal = ref("crear");
const alert = ref(false);
const alertData = ref({});
const busquedaUsuario = ref("");
const cargandoUsuarios = ref(true);
const guardando = ref(false);

// Variables de paginación
const paginaActual = ref(1);
const usuariosPorPagina = ref(10);

// Computed para usuarios paginados
const usuariosPaginados = computed(() => {
  if (busquedaUsuario.value) {
    //filtrar por nombre o correo
    const filtro = busquedaUsuario.value.toLowerCase();
    return usuarios.value.filter(
      (u) =>
        u.nombre.toLowerCase().includes(filtro) ||
        u.correo.toLowerCase().includes(filtro)
    );
  }
  const inicio = (paginaActual.value - 1) * usuariosPorPagina.value;
  const fin = inicio + usuariosPorPagina.value;
  return usuarios.value.slice(inicio, fin);
});

// Computed para total de páginas
const totalPaginas = computed(() => {
  return Math.ceil(usuarios.value.length / usuariosPorPagina.value);
});

// Computed para total de usuarios
const totalUsuarios = computed(() => usuarios.value.length);

// Computed para rango de registros mostrados
const rangoInicio = computed(() => {
  if (usuarios.value.length === 0) return 0;
  return (paginaActual.value - 1) * usuariosPorPagina.value + 1;
});

const rangoFin = computed(() => {
  const fin = paginaActual.value * usuariosPorPagina.value;
  return Math.min(fin, usuarios.value.length);
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

const obtenerUsuarios = async () => {
  try {
    const response = await fetch("/api/gaceta/obtener?categoria=autores");
    if (!response.ok) {
      throw new Error("Error al obtener los usuarios");
    }
    const data = await response.json();
    usuarios.value = data.rows.map((row) => row.doc);

    // Resetear a página 1 cuando se recargan los datos
    paginaActual.value = 1;
    cargandoUsuarios.value = false;
    console.log("Usuarios obtenidos:", usuarios.value.length);
  } catch (error) {
    console.error(error);
  }
};

const abrirModalNuevo = () => {
  modoModal.value = "crear";
  dataUsuario.value = {};
  modalRef.value?.showModal();
};

const abrirModalEliminar = (usuario) => {
  dataUsuario.value = { ...usuario };
  modalEliminarRef.value?.showModal();
};

const cerrarModalEliminar = () => {
  modalEliminarRef.value?.close();
  dataUsuario.value = {};
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

const editarUsuario = (usuario) => {
  console.log("Editar usuario:", usuario);
  modoModal.value = "editar";
  dataUsuario.value = { ...usuario };
  modalRef.value?.showModal();
};

const cerrarModal = () => {
  modalRef.value?.close();
  dataUsuario.value = {};
};

const guardarUsuario = async (usuarioData) => {
  console.log("=== GUARDAR USUARIO ===");
  console.log("Modo:", modoModal.value);
  console.log("Datos:", usuarioData);
  abrirModalGuardando();

  try {
    let response;

    if (modoModal.value === "crear") {
      console.log("Creando nuevo usuario...");
      const datosLimpios = { ...usuarioData };
      if (!datosLimpios._id) {
        delete datosLimpios._id;
      }

      response = await fetch("/api/gaceta/crear?coleccion=autores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datosLimpios),
      });
    } else {
      console.log("Actualizando usuario existente...");

      if (!usuarioData._id) {
        alertData.value = {
          type: "warning",
          mensaje: "No se puede actualizar: falta el ID del usuario",
        };
        alert.value = true;
        setTimeout(() => (alert.value = false), 5000);
        throw new Error("No se puede actualizar: falta el ID del usuario");
      }

      response = await fetch(
        `/api/gaceta/actualizar?coleccion=autores&id=${usuarioData._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(usuarioData),
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
          errorData.error || errorData.mensaje || "Error al guardar usuario",
      };
      alert.value = true;
      setTimeout(() => (alert.value = false), 5000);
      throw new Error(
        errorData.error || errorData.mensaje || "Error al guardar"
      );
    }

    const resultado = await response.json();
    console.log("Resultado:", resultado);

    await obtenerUsuarios();
    cerrarModal();
    cerrarModalGuardando();

    alertData.value = {
      type: "success",
      mensaje:
        modoModal.value === "crear"
          ? "Usuario creado exitosamente"
          : "Usuario actualizado exitosamente",
    };
    alert.value = true;
    setTimeout(() => (alert.value = false), 5000);

    console.log("=== USUARIO GUARDADO EXITOSAMENTE ===");
  } catch (error) {
    console.error("❌ Error al guardar usuario:", error);
    console.error("❌ Mensaje:", error.message);
  }
};

const eliminarUsuario = async (id) => {
  try {
    console.log("Eliminando usuario:", id);
    abrirModalGuardando();

    const response = await fetch(
      `/api/gaceta/eliminar?coleccion=autores&id=${id}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al eliminar usuario");
    }

    const resultado = await response.json();
    console.log("Usuario eliminado:", resultado);

    // Recargar la lista
    await obtenerUsuarios();

    // Mostrar alerta de éxito
    alertData.value = {
      type: "success",
      mensaje: "Usuario eliminado exitosamente",
    };
    alert.value = true;
    cerrarModalGuardando();
    modalEliminarRef.value?.close();
    setTimeout(() => (alert.value = false), 5000);
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    alertData.value = {
      type: "error",
      mensaje: `Error al eliminar: ${error.message}`,
    };
    alert.value = true;
    setTimeout(() => (alert.value = false), 5000);
  }
};

//desactivar usuario (cambiar estado a inactivo o activo)
const desactivarUsuario = async (id, estado) => {
  try {
    console.log("Cambiando estado de usuario:", id, "a", estado);
    abrirModalGuardando();

    const response = await fetch(
      `/api/gaceta/desactivar_autor?id=${id}&estado=${estado}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al cambiar estado del usuario");
    }

    const resultado = await response.json();
    console.log("Estado de usuario cambiado:", resultado);

    // Recargar la lista
    await obtenerUsuarios();

    // Mostrar alerta de éxito
    alertData.value = {
      type: "success",
      mensaje: `Usuario ${
        estado === "activo" ? "desactivado" : "activado"
      } exitosamente`,
    };
    alert.value = true;
    cerrarModalGuardando();
    setTimeout(() => (alert.value = false), 5000);
  } catch (error) {
    console.error("Error al cambiar estado del usuario:", error);
    alertData.value = {
      type: "error",
      mensaje: `Error al cambiar estado: ${error.message}`,
    };
    alert.value = true;
    setTimeout(() => (alert.value = false), 5000);
  }
};

onMounted(() => {
  obtenerUsuarios();
});
</script>
