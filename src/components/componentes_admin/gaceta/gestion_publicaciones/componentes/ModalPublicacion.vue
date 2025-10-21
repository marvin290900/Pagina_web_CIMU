<template>
  <div class="modal-box w-11/12 max-w-5xl max-h-[90vh] overflow-y-auto">
    <form method="dialog">
      <button
        class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 z-10"
        @click="cerrar"
      >
        ✕
      </button>
    </form>

    <h3 class="text-lg font-bold mb-4">
      {{
        modo === "crear" ? "Agregar nueva publicación" : "Editar publicación"
      }}
    </h3>

    <form @submit.prevent="guardar" class="py-4 flex flex-col gap-4">
      <!-- Título -->
      <div class="form-control">
        <label class="label">
          <span class="label-text font-semibold">Título *</span>
        </label>
        <input
          type="text"
          v-model="formData.titulo"
          class="input input-bordered w-full"
          placeholder="Título de la publicación"
          required
        />
      </div>

      <!-- Tipo y Categoría -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-control">
          <label class="label">
            <span class="label-text font-semibold">Tipo *</span>
          </label>
          <select
            v-model="formData.tipo"
            class="select select-bordered w-full"
            required
          >
            <option disabled value="">Seleccionar tipo</option>
            <option value="opinion">Opinión</option>
            <option value="actualidad">Actualidad</option>
            <option value="audiovisuales">Audiovisuales</option>
            <option value="vida_universitaria">Vida Universitaria</option>
            <option value="memoria">Memoria colectiva</option>
          </select>
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text font-semibold">Categoría *</span>
          </label>
          <select
            v-model="formData.categoria"
            class="select select-bordered w-full"
            required
          >
            <option disabled value="">Seleccionar categoría</option>
            <option value="Opinion">Opinión</option>
            <option value="Actualidad">Actualidad</option>
            <option value="Audiovisuales">Audiovisuales</option>
            <option value="Vida Universitaria">Vida Universitaria</option>
            <option value="Memoria colectiva">Memoria colectiva</option>
          </select>
        </div>
      </div>

      <!-- Fecha de publicación y Estado -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-control">
          <label class="label">
            <span class="label-text font-semibold">Fecha de publicación *</span>
          </label>
          <input
            type="datetime-local"
            v-model="fechaLocal"
            class="input input-bordered w-full"
            required
          />
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text font-semibold">Estado *</span>
          </label>
          <select
            v-model="formData.estado"
            class="select select-bordered w-full"
            required
          >
            <option disabled value="">Estado</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>
      </div>

      <!-- Autor -->
      <div class="form-control">
        <label class="label">
          <span class="label-text font-semibold">Autor *</span>
        </label>
        <select
          v-model="autorSeleccionado"
          class="select select-bordered w-full"
          required
        >
          <option disabled value="">Seleccionar autor</option>
          <option v-for="autor in autores" :key="autor._id" :value="autor">
            {{ autor.nombre }}
          </option>
        </select>
      </div>

      <!-- Etiquetas -->
      <div class="form-control">
        <label class="label">
          <span class="label-text font-semibold">Etiquetas</span>
          <span class="label-text-alt">Separar con comas</span>
        </label>
        <input
          type="text"
          v-model="etiquetasTexto"
          class="input input-bordered w-full"
          placeholder="tecnología, innovación, desarrollo"
        />
      </div>

      <!-- Link de YouTube -->
      <div class="form-control">
        <label class="label">
          <span class="label-text font-semibold"
            >Link de YouTube (opcional)</span
          >
        </label>
        <input
          type="url"
          v-model="formData.imagenes.link_yt"
          class="input input-bordered w-full"
          placeholder="https://www.youtube.com/watch?v=..."
        />
      </div>

      <!-- Contenido con Markdown Editor -->
      <div class="form-control">
        <label class="label">
          <span class="label-text font-semibold">Contenido *</span>
        </label>
        <div
          class="border rounded-lg overflow-hidden"
          style="min-height: 400px"
        >
          <!-- <VMarkdownEditor
            v-model="formData.contenido"
            :upload-action="handleUploadMarkdown"
            height="400px"
          /> -->
          <MdEditor v-model="formData.contenido" language="es-ES" />
        </div>
      </div>

      <!-- Imagen de portada -->
      <div class="form-control">
        <label class="label">
          <span class="label-text font-semibold">Imagen de portada *</span>
        </label>
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-4">
          <!-- Preview de portada -->
          <div v-if="formData.imagenes.portada.url" class="mb-4">
            <img
              :src="formData.imagenes.portada.url"
              alt="Portada"
              class="w-full h-48 object-cover rounded-lg"
            />
            <input
              type="text"
              v-model="formData.imagenes.portada.descripcion"
              class="input input-bordered w-full mt-2"
              placeholder="Descripción de la imagen"
            />
          </div>

          <input
            ref="portadaInput"
            type="file"
            @change="handlePortadaSelect"
            accept="image/*"
            class="file-input file-input-bordered w-full"
          />

          <div
            v-if="subiendoPortada"
            class="flex items-center gap-2 mt-2 text-sm text-blue-500"
          >
            <span class="loading loading-spinner loading-sm"></span>
            Subiendo imagen de portada...
          </div>
        </div>
      </div>

      <!-- Galería de imágenes (hasta 10) -->
      <div class="form-control">
        <label class="label">
          <span class="label-text font-semibold">Galería de imágenes</span>
          <span class="label-text-alt">Máximo 10 imágenes</span>
        </label>

        <div class="border-2 border-dashed border-gray-300 rounded-lg p-4">
          <!-- Grid de imágenes existentes -->
          <div
            v-if="formData.imagenes.galeria.length > 0"
            class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4"
          >
            <div
              v-for="(imagen, index) in formData.imagenes.galeria"
              :key="index"
              class="relative group"
            >
              <img
                :src="imagen.url"
                :alt="imagen.descripcion || `Imagen ${index + 1}`"
                class="w-full h-32 object-cover rounded-lg"
              />
              <button
                type="button"
                @click="eliminarImagenGaleria(index)"
                class="absolute top-2 right-2 btn btn-circle btn-sm btn-error opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <span class="mdi mdi-delete"></span>
              </button>
              <input
                type="text"
                v-model="imagen.descripcion"
                class="input input-bordered input-sm w-full mt-2"
                placeholder="Descripción"
              />
            </div>
          </div>

          <!-- Input para agregar más imágenes -->
          <input
            v-if="formData.imagenes.galeria.length < 10"
            ref="galeriaInput"
            type="file"
            @change="handleGaleriaSelect"
            accept="image/*"
            multiple
            class="file-input file-input-bordered w-full"
          />

          <p v-else class="text-sm text-gray-500 text-center py-4">
            Has alcanzado el máximo de 10 imágenes
          </p>

          <div
            v-if="subiendoGaleria"
            class="flex items-center gap-2 mt-2 text-sm text-blue-500"
          >
            <span class="loading loading-spinner loading-sm"></span>
            Subiendo imágenes... ({{ imagenesCargadas }} /
            {{ totalImagenesSubir }})
          </div>
        </div>
      </div>

      <!-- Botones de acción -->
      <div class="modal-action bg-base-100">
        <button
          type="button"
          class="btn"
          @click="cerrar"
          :disabled="guardando || subiendoPortada || subiendoGaleria"
        >
          Cancelar
        </button>
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="
            guardando ||
            subiendoPortada ||
            subiendoGaleria ||
            !formData.imagenes.portada.url
          "
        >
          <span
            v-if="guardando || subiendoPortada || subiendoGaleria"
            class="loading loading-spinner loading-sm"
          ></span>
          {{
            subiendoPortada || subiendoGaleria
              ? "Subiendo imágenes..."
              : guardando
              ? "Guardando..."
              : modo === "crear"
              ? "Crear publicación"
              : "Guardar cambios"
          }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from "vue";
//import { VMarkdownEditor } from "vue3-markdown";
//import "vue3-markdown/dist/vue3-markdown.css";
import { MdEditor, config } from "md-editor-v3";
import "md-editor-v3/lib/style.css";
import ES_ES from "@vavt/cm-extension/dist/locale/es-ES";

const props = defineProps({
  publicacion: {
    type: Object,
    default: () => ({}),
  },
  modo: {
    type: String,
    default: "crear",
  },
});

//configurar idioma del editor
config({
  editorConfig: {
    languageUserDefined: {
      "es-ES": ES_ES,
    },
  },
});

const emit = defineEmits(["cerrar", "guardar"]);

// Referencias
const portadaInput = ref(null);
const galeriaInput = ref(null);

// Estados
const guardando = ref(false);
const subiendoPortada = ref(false);
const subiendoGaleria = ref(false);
const imagenesCargadas = ref(0);
const totalImagenesSubir = ref(0);

// Datos
const autores = ref([]);
const autorSeleccionado = ref(null);
const etiquetasTexto = ref("");

// Fecha local para el input datetime-local
const fechaLocal = ref("");

// Datos del formulario
const formData = ref({
  _id: "",
  titulo: "",
  tipo: "",
  contenido: "",
  fecha_publicacion: new Date().toISOString(),
  categoria: "",
  autor: {
    id: "",
    nombre: "",
  },
  etiquetas: [],
  imagenes: {
    portada: {
      url: "",
      descripcion: "",
    },
    galeria: [],
    link_yt: "",
  },
  estado: "activo",
  visitas: 0,
});

// Cargar autores
const cargarAutores = async () => {
  try {
    const response = await fetch("/api/gaceta/obtener?categoria=autores");
    if (!response.ok) throw new Error("Error al cargar autores");

    const data = await response.json();
    autores.value = data.rows.map((row) => row.doc);
    console.log("Autores cargados:", autores.value.length);
  } catch (error) {
    console.error("Error al cargar autores:", error);
  }
};

// Convertir fecha ISO a formato datetime-local
const isoToLocal = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
};

// Convertir fecha local a ISO
const localToIso = (localString) => {
  if (!localString) return "";
  return new Date(localString).toISOString();
};

// Watch para actualizar fecha ISO cuando cambia fecha local
watch(fechaLocal, (newVal) => {
  formData.value.fecha_publicacion = localToIso(newVal);
});

// Watch para autor seleccionado
watch(autorSeleccionado, (newAutor) => {
  if (newAutor) {
    formData.value.autor = {
      id: newAutor._id,
      nombre: newAutor.nombre,
    };
  }
});

// Watch para etiquetas
watch(etiquetasTexto, (newVal) => {
  formData.value.etiquetas = newVal
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
});

// Resetear formulario
const resetearFormulario = () => {
  formData.value = {
    _id: "",
    titulo: "",
    tipo: "",
    contenido: "",
    fecha_publicacion: "",
    categoria: "",
    autor: {
      id: "",
      nombre: "",
    },
    etiquetas: [],
    imagenes: {
      portada: {
        url: "",
        descripcion: "",
      },
      galeria: [],
      link_yt: "",
    },
    estado: "",
    visitas: 0,
  };
  autorSeleccionado.value = null;
  etiquetasTexto.value = "";
  fechaLocal.value = "";

  if (portadaInput.value) portadaInput.value.value = "";
  if (galeriaInput.value) galeriaInput.value.value = "";
};

// Observar cambios en la prop publicacion
watch(
  () => props.publicacion,
  (nuevaPublicacion) => {
    if (nuevaPublicacion && Object.keys(nuevaPublicacion).length > 0) {
      formData.value = {
        _id: nuevaPublicacion._id || "",
        titulo: nuevaPublicacion.titulo || "",
        tipo: nuevaPublicacion.tipo || "",
        contenido: nuevaPublicacion.contenido || "",
        fecha_publicacion: nuevaPublicacion.fecha_publicacion || "",
        categoria: nuevaPublicacion.categoria || "",
        autor: nuevaPublicacion.autor || { id: "", nombre: "" },
        etiquetas: nuevaPublicacion.etiquetas || [],
        imagenes: {
          portada: nuevaPublicacion.imagenes?.portada || {
            url: "",
            descripcion: "",
          },
          galeria: nuevaPublicacion.imagenes?.galeria || [],
          link_yt: nuevaPublicacion.imagenes?.link_yt || "",
        },
        estado: nuevaPublicacion.estado || "",
        visitas: nuevaPublicacion.visitas || 0,
      };

      // Convertir fecha a formato local
      fechaLocal.value = isoToLocal(nuevaPublicacion.fecha_publicacion);

      // Establecer autor seleccionado
      if (nuevaPublicacion.autor?.id) {
        autorSeleccionado.value = autores.value.find(
          (a) => a._id === nuevaPublicacion.autor.id
        );
      }

      // Establecer etiquetas como texto
      etiquetasTexto.value = nuevaPublicacion.etiquetas?.join(", ") || "";

      console.log("Datos cargados para editar:", formData.value);
    } else {
      resetearFormulario();
    }
  },
  { immediate: true, deep: true }
);

// Subir imagen de portada
const handlePortadaSelect = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    subiendoPortada.value = true;

    const formDataImagen = new FormData();
    formDataImagen.append("foto", file);
    formDataImagen.append("carpeta", "publicaciones/portadas");

    const response = await fetch("/api/subir_imagen", {
      method: "POST",
      body: formDataImagen,
    });

    if (!response.ok) throw new Error("Error al subir la imagen");

    const data = await response.json();
    if (!data.ok) throw new Error(data.error || "Error en subida");

    formData.value.imagenes.portada.url = data.url;
    console.log("Portada subida:", data.url);
  } catch (error) {
    console.error("Error al subir portada:", error);
    alert(`Error al subir la imagen: ${error.message}`);
  } finally {
    subiendoPortada.value = false;
  }
};

// Subir imágenes de galería
const handleGaleriaSelect = async (event) => {
  const files = Array.from(event.target.files || []);
  if (files.length === 0) return;

  // Validar que no exceda el límite
  const espacioDisponible = 10 - formData.value.imagenes.galeria.length;
  const archivosASubir = files.slice(0, espacioDisponible);

  if (files.length > espacioDisponible) {
    alert(
      `Solo puedes subir ${espacioDisponible} imágenes más. Se subirán las primeras ${espacioDisponible}.`
    );
  }

  try {
    subiendoGaleria.value = true;
    imagenesCargadas.value = 0;
    totalImagenesSubir.value = archivosASubir.length;

    for (const file of archivosASubir) {
      const formDataImagen = new FormData();
      formDataImagen.append("foto", file);
      formDataImagen.append("carpeta", "publicaciones/galeria");

      const response = await fetch("/api/subir_imagen", {
        method: "POST",
        body: formDataImagen,
      });

      if (!response.ok) {
        console.error(`Error al subir ${file.name}`);
        continue;
      }

      const data = await response.json();
      if (data.ok) {
        formData.value.imagenes.galeria.push({
          url: data.url,
          descripcion: "",
        });
        imagenesCargadas.value++;
      }
    }

    console.log("Imágenes de galería subidas:", imagenesCargadas.value);

    // Limpiar input
    if (galeriaInput.value) galeriaInput.value.value = "";
  } catch (error) {
    console.error("Error al subir galería:", error);
    alert(`Error al subir imágenes: ${error.message}`);
  } finally {
    subiendoGaleria.value = false;
  }
};

// Eliminar imagen de galería
const eliminarImagenGaleria = (index) => {
  formData.value.imagenes.galeria.splice(index, 1);
};

// Handle upload para el markdown editor
const handleUploadMarkdown = async (file) => {
  try {
    const formDataImagen = new FormData();
    formDataImagen.append("foto", file);
    formDataImagen.append("carpeta", "publicaciones/contenido");

    const response = await fetch("/api/subir_imagen", {
      method: "POST",
      body: formDataImagen,
    });

    if (!response.ok) throw new Error("Error al subir imagen");

    const data = await response.json();
    if (!data.ok) throw new Error(data.error);

    return data.url;
  } catch (error) {
    console.error("Error al subir imagen del editor:", error);
    throw error;
  }
};

// Cerrar modal
const cerrar = () => {
  resetearFormulario();
  emit("cerrar");
};

// Guardar publicación
const guardar = async () => {
  try {
    guardando.value = true;

    // Validar campos requeridos
    if (
      !formData.value.titulo ||
      !formData.value.tipo ||
      !formData.value.categoria
    ) {
      alert("Por favor completa todos los campos obligatorios");
      guardando.value = false;
      return;
    }

    if (!formData.value.contenido) {
      alert("El contenido de la publicación es obligatorio");
      guardando.value = false;
      return;
    }

    if (!formData.value.imagenes.portada.url) {
      alert("La imagen de portada es obligatoria");
      guardando.value = false;
      return;
    }

    if (!formData.value.autor.id) {
      alert("Debes seleccionar un autor");
      guardando.value = false;
      return;
    }

    console.log("Guardando publicación:", formData.value);

    // Emitir evento con los datos
    emit("guardar", { ...formData.value });
  } catch (error) {
    console.error("Error al guardar:", error);
    alert(`Error al guardar la publicación: ${error.message}`);
  } finally {
    guardando.value = false;
  }
};

// Lifecycle
onMounted(() => {
  cargarAutores();
});
</script>

<style scoped>
/* Asegurar que el markdown editor tenga altura adecuada */
:deep(.v-md-editor) {
  min-height: 400px;
}

/* Scroll suave para el modal */
.modal-box {
  scrollbar-width: thin;
}
</style>
