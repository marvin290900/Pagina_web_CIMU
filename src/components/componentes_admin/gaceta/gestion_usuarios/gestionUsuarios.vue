<template>
  <section class="w-11/12 sm:w-[80%] mx-auto">
    <div class="flex justify-between py-4">
      <h2 class="text-3xl font-bold">Agregar nuevo libro</h2>
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
          <!-- row 1 -->
          <tr v-for="usuario in usuarios" :key="usuario._id">
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
                class="mask mask-circle w-8 h-8 object-cover"
                :src="usuario.foto"
                :alt="`foto de ${usuario.nombre}`"
              />
            </td>
            <td>{{ usuario.nombre }}</td>
            <td>{{ usuario.correo }}</td>
            <td class="flex gap-3">
              <button
                class="btn btn-soft btn-primary btn-sm"
                @click="editarUsuario(usuario)"
              >
                <span class="mdi mdi-pencil"></span>
                Editar
              </button>
              <button
                class="btn btn-soft btn-error btn-sm"
                @click="eliminarUsuario(usuario._id)"
              >
                <span class="mdi mdi-delete"></span>
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <dialog ref="modalRef" id="modal_libros" class="modal">
      <modal-usuarios
        :usuario="dataUsuario"
        :modo="modoModal"
        @cerrar="cerrarModal"
        @guardar="guardarUsuario"
      />
    </dialog>
  </section>
</template>

<script setup>
import { onMounted, ref } from "vue";
import modalUsuarios from "./componentes/modalUsuarios.vue";

const usuarios = ref([]);
const dataUsuario = ref({});
const modalRef = ref(null);
const modoModal = ref("crear"); // 'crear' o 'editar'

const obtenerUsuarios = async () => {
  try {
    const response = await fetch("/api/gaceta/obtener?categoria=autores");
    if (!response.ok) {
      throw new Error("Error al obtener los usuarios");
    }
    const data = await response.json();
    usuarios.value = data.rows.map((row) => row.doc);

    console.log(usuarios.value);
  } catch (error) {
    console.error(error);
  }
};

// Función para abrir modal en modo crear
const abrirModalNuevo = () => {
  modoModal.value = "crear";
  dataUsuario.value = {}; // Datos vacíos para nuevo usuario
  modalRef.value?.showModal();
};

// Función para abrir modal en modo editar
const editarUsuario = (usuario) => {
  console.log("Editar usuario:", usuario);
  modoModal.value = "editar";
  dataUsuario.value = { ...usuario }; // Copia del usuario para editar
  modalRef.value?.showModal();
};

// Función para cerrar el modal
const cerrarModal = () => {
  modalRef.value?.close();
  dataUsuario.value = {};
};

// Función para guardar (crear o editar)
// En tu función guardarUsuario del componente padre
// const guardarUsuario = async (usuarioData) => {
//   try {
//     const metodo = modoModal.value === "crear" ? "POST" : "PUT";
//     const url =
//       modoModal.value === "crear"
//         ? "/api/gaceta/crear?coleccion=autores"
//         : `/api/gaceta/actualizar?coleccion=autores&id=${usuarioData._id}`;

//     const response = await fetch(url, {
//       method: metodo,
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(usuarioData),
//     });

//     if (!response.ok) {
//       const error = await response.json();
//       throw new Error(error.error || "Error al guardar");
//     }

//     const resultado = await response.json();
//     console.log("Usuario guardado:", resultado);

//     // Recargar lista
//     await obtenerUsuarios();

//     // Cerrar modal
//     cerrarModal();

//     // Mostrar mensaje de éxito
//     alert(
//       modoModal.value === "crear"
//         ? "Usuario creado exitosamente"
//         : "Usuario actualizado exitosamente"
//     );
//   } catch (error) {
//     console.error("Error al guardar usuario:", error);
//     alert(`Error: ${error.message}`);
//   }
// };

// Función para guardar (crear o editar)
const guardarUsuario = async (usuarioData) => {
  console.log("=== GUARDAR USUARIO ===");
  console.log("Modo:", modoModal.value);
  console.log("Datos:", usuarioData);

  try {
    let response;

    if (modoModal.value === "crear") {
      // CREAR nuevo usuario
      console.log("Creando nuevo usuario...");

      // Limpiar el _id si viene vacío
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
      // ACTUALIZAR usuario existente
      console.log("Actualizando usuario existente...");

      if (!usuarioData._id) {
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
      throw new Error(
        errorData.error || errorData.mensaje || "Error al guardar"
      );
    }

    const resultado = await response.json();
    console.log("Resultado:", resultado);

    // Recargar lista
    await obtenerUsuarios();

    // Cerrar modal
    cerrarModal();

    // Mostrar mensaje de éxito
    alert(
      modoModal.value === "crear"
        ? "Usuario creado exitosamente"
        : "Usuario actualizado exitosamente"
    );

    console.log("=== USUARIO GUARDADO EXITOSAMENTE ===");
  } catch (error) {
    console.error("❌ Error al guardar usuario:", error);
    console.error("❌ Mensaje:", error.message);
    alert(`Error al guardar: ${error.message}`);
  }
};

// Función para eliminar
const eliminarUsuario = async (id) => {
  if (confirm("¿Estás seguro de eliminar este usuario?")) {
    try {
      console.log("Eliminando usuario:", id);

      // Aquí harías tu petición DELETE a la API
      // await fetch(`/api/gaceta/usuarios/${id}`, { method: 'DELETE' });

      // Recargar la lista
      await obtenerUsuarios();
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
    }
  }
};

onMounted(() => {
  obtenerUsuarios();
});
</script>
