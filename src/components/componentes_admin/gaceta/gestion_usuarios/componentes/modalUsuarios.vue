<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  usuario: {
    type: Object,
    default: () => ({}),
  },
  modo: {
    type: String,
    default: "crear",
  },
});

const emit = defineEmits(["cerrar", "guardar"]);

// Estado del formulario
const guardando = ref(false);
const subiendoImagen = ref(false);
const previewImagen = ref(null);
const fileInput = ref(null);
const archivoSeleccionado = ref(null); // Guardar el archivo seleccionado

// Datos del formulario
const formData = ref({
  _id: "",
  nombre: "",
  correo: "",
  estado: "",
  biografia: "",
  foto: "",
  redes_sociales: {
    facebook: "",
    twitter: "",
    linkedin: "",
    youtube: "",
  },
});

// Función para resetear el formulario
const resetearFormulario = () => {
  formData.value = {
    _id: "",
    nombre: "",
    correo: "",
    estado: "",
    biografia: "",
    foto: "",
    redes_sociales: {
      facebook: "",
      twitter: "",
      linkedin: "",
      youtube: "",
    },
  };
  previewImagen.value = null;
  archivoSeleccionado.value = null;

  if (fileInput.value) {
    fileInput.value.value = "";
  }
};

// Observar cambios en la prop usuario
watch(
  () => props.usuario,
  (nuevoUsuario) => {
    if (nuevoUsuario && Object.keys(nuevoUsuario).length > 0) {
      formData.value = {
        _id: nuevoUsuario._id || "",
        nombre: nuevoUsuario.nombre || "",
        correo: nuevoUsuario.correo || "",
        estado: nuevoUsuario.estado || "",
        biografia: nuevoUsuario.biografia || "",
        foto: nuevoUsuario.foto || "",
        redes_sociales: {
          facebook: nuevoUsuario.redes_sociales?.facebook || "",
          twitter: nuevoUsuario.redes_sociales?.twitter || "",
          linkedin: nuevoUsuario.redes_sociales?.linkedin || "",
          youtube: nuevoUsuario.redes_sociales?.youtube || "",
        },
      };
      previewImagen.value = null;
      archivoSeleccionado.value = null;
      console.log("Datos cargados para editar:", formData.value);
    } else {
      resetearFormulario();
    }
  },
  { immediate: true, deep: true }
);

// Función para manejar la selección de archivo (solo preview, NO sube todavía)
const handleFileSelect = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  // Guardar el archivo para subirlo después
  archivoSeleccionado.value = file;

  // Crear preview local
  const reader = new FileReader();
  reader.onload = (e) => {
    previewImagen.value = e.target.result;
  };
  reader.readAsDataURL(file);

  console.log("Archivo seleccionado:", file.name);
};

// Función para subir la imagen (se llama al guardar)
const subirImagen = async () => {
  if (!archivoSeleccionado.value) {
    console.log("No hay archivo para subir");
    return null;
  }

  try {
    console.log("Iniciando subida de imagen:", archivoSeleccionado.value);
    subiendoImagen.value = true;
    console.log("Subiendo imagen...");

    const formDataImagen = new FormData();
    formDataImagen.append("foto", archivoSeleccionado.value);
    formDataImagen.append("carpeta", "autores");

    const resImagen = await fetch("/api/subir_imagen", {
      method: "POST",
      body: formDataImagen,
    });

    if (!resImagen.ok) {
      throw new Error("Error al subir la imagen");
    }

    const dataImagen = await resImagen.json();

    if (!dataImagen.ok) {
      throw new Error(dataImagen.error || "Error en subida de imagen");
    }

    console.log("Imagen subida correctamente:", dataImagen.url);
    return dataImagen.url;
  } catch (error) {
    console.error("Error al subir imagen:", error);
    throw error;
  } finally {
    subiendoImagen.value = false;
  }
};

// Función para cerrar el modal
const cerrar = () => {
  resetearFormulario();
  emit("cerrar");
};

const abrirModalGuardando = () => {
  if (modalGuardandoRef.value) {
    modalGuardandoRef.value.showModal();
  }
};

// Función para guardar
const guardar = async () => {
  try {
    guardando.value = true;

    // Validar datos básicos
    if (
      !formData.value.nombre ||
      !formData.value.correo ||
      !formData.value.estado
    ) {
      alert("Por favor completa los campos obligatorios");
      guardando.value = false;
      return;
    }

    // Si hay un archivo seleccionado, subirlo primero
    if (archivoSeleccionado.value) {
      console.log("Subiendo imagen antes de guardar...");
      const fotoUrl = await subirImagen();

      if (fotoUrl) {
        formData.value.foto = fotoUrl;
        console.log("URL de foto guardada:", fotoUrl);
      }
    }

    console.log("Guardando usuario con datos:", formData.value);

    // Emitir evento con los datos
    emit("guardar", { ...formData.value });
  } catch (error) {
    console.error("Error al guardar:", error);
    alert(`Error al guardar el usuario: ${error.message}`);
  } finally {
    guardando.value = false;
  }
};
</script>

<template>
  <div class="modal-box w-11/12 max-w-3xl">
    <form method="dialog">
      <button
        class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        @click="cerrar"
      >
        ✕
      </button>
    </form>

    <h3 class="text-lg font-bold">
      {{ modo === "crear" ? "Agregar nuevo usuario" : "Editar usuario" }}
    </h3>

    <form @submit.prevent="guardar" class="py-6 flex flex-col gap-3">
      <!-- Nombre -->
      <input
        type="text"
        v-model="formData.nombre"
        class="input w-full"
        placeholder="Nombre"
        required
      />

      <!-- Correo -->
      <input
        type="email"
        v-model="formData.correo"
        class="input w-full"
        placeholder="Correo"
        required
      />

      <!-- Estado -->
      <select v-model="formData.estado" class="select w-full" required>
        <option disabled value="">Estado</option>
        <option value="activo">Activo</option>
        <option value="inactivo">Inactivo</option>
      </select>

      <!-- Biografía -->
      <textarea
        v-model="formData.biografia"
        class="textarea w-full"
        placeholder="Biografia"
        rows="4"
      ></textarea>

      <!-- Foto de perfil -->
      <div
        class="w-full gap-4 py-4 border-1 border-dashed border-gray-500/25 rounded-xl"
      >
        <h3 class="px-4 pb-3">Foto de perfil</h3>

        <!-- Preview de la foto -->
        <div v-if="previewImagen || formData.foto" class="px-4 pb-3">
          <img
            :src="previewImagen || formData.foto"
            alt="Preview"
            class="w-20 h-20 rounded-full object-cover"
          />
        </div>

        <!-- Input de archivo -->
        <div class="px-4 flex flex-col gap-2">
          <input
            ref="fileInput"
            type="file"
            @change="handleFileSelect"
            accept="image/*"
            class="file-input file-input-primary w-full"
          />

          <!-- Indicador de archivo seleccionado -->
          <div v-if="archivoSeleccionado" class="text-sm text-green-600">
            ✓ Imagen seleccionada: {{ archivoSeleccionado.name }}
            <span class="text-gray-500">(se subirá al guardar)</span>
          </div>

          <!-- Indicador de carga al guardar -->
          <div
            v-if="subiendoImagen"
            class="flex items-center gap-2 text-sm text-blue-500"
          >
            <span class="loading loading-spinner loading-sm"></span>
            Subiendo imagen al servidor...
          </div>
        </div>
      </div>

      <!-- Redes sociales -->
      <div class="divider">Redes sociales (opcional)</div>

      <label class="input input-bordered flex items-center gap-2">
        <span class="mdi mdi-facebook text-xl"></span>
        <input
          type="url"
          v-model="formData.redes_sociales.facebook"
          placeholder="Facebook"
          class="grow"
        />
      </label>

      <label class="input input-bordered flex items-center gap-2">
        <span class="mdi mdi-twitter text-xl"></span>
        <input
          type="url"
          v-model="formData.redes_sociales.twitter"
          placeholder="Twitter"
          class="grow"
        />
      </label>

      <label class="input input-bordered flex items-center gap-2">
        <span class="mdi mdi-linkedin text-xl"></span>
        <input
          type="url"
          v-model="formData.redes_sociales.linkedin"
          placeholder="LinkedIn"
          class="grow"
        />
      </label>

      <label class="input input-bordered flex items-center gap-2">
        <span class="mdi mdi-youtube text-xl"></span>
        <input
          type="url"
          v-model="formData.redes_sociales.youtube"
          placeholder="YouTube"
          class="grow"
        />
      </label>

      <!-- Botones de acción -->
      <div class="modal-action">
        <button type="button" class="btn" @click="cerrar" :disabled="guardando">
          Cancelar
        </button>
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="guardando || subiendoImagen"
        >
          <span
            v-if="guardando || subiendoImagen"
            class="loading loading-spinner loading-sm"
          ></span>
          {{
            subiendoImagen
              ? "Subiendo imagen..."
              : guardando
              ? "Guardando..."
              : modo === "crear"
              ? "Crear"
              : "Guardar cambios"
          }}
        </button>
      </div>
    </form>
  </div>
</template>
