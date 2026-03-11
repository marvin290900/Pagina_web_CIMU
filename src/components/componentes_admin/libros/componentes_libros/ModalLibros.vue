<template>
  <div class="modal-box w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto">
    <form method="dialog">
      <button
        class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 z-10"
        @click="cerrar"
      >
        ✕
      </button>
    </form>

    <h3 class="text-lg font-bold mb-4">
      {{ modo === "crear" ? "Agregar nuevo libro" : "Editar libro" }}
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
          placeholder="Título del libro"
          required
        />
      </div>

      <!-- Tipo y Fecha de publicación -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-control">
          <label class="label">
            <span class="label-text font-semibold">Tipo *</span>
          </label>
          <input
            type="text"
            v-model="formData.tipo"
            class="input input-bordered w-full"
            placeholder="Ej: Investigación, Ensayo..."
            required
          />
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text font-semibold">Fecha de publicación *</span>
          </label>
          <input
            type="date"
            v-model="formData.fecha_publicacion"
            class="input input-bordered w-full"
            required
          />
        </div>
      </div>

      <!-- Editorial y Colección -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-control">
          <label class="label">
            <span class="label-text font-semibold">Editorial *</span>
          </label>
          <select
            v-model="formData.editorial"
            class="select select-bordered w-full"
            required
          >
            <option disabled value="">Seleccionar editorial</option>
            <option value="Editorial Multidisciplinaria">
              Editorial Multidisciplinaria
            </option>
            <option value="Otra Editorial">Otra Editorial</option>
          </select>
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text font-semibold">Colección *</span>
          </label>
          <select
            v-model="formData.coleccion"
            class="select select-bordered w-full"
            required
          >
            <option disabled value="">Seleccionar colección</option>
            <option
              v-for="coleccion in coleccionesOptions"
              :key="coleccion"
              :value="coleccion"
            >
              {{ coleccion }}
            </option>
          </select>
        </div>
      </div>

      <!-- Páginas, ISBN y URI -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="form-control">
          <label class="label">
            <span class="label-text font-semibold">Páginas *</span>
          </label>
          <input
            type="number"
            v-model="formData.paginas"
            class="input input-bordered w-full"
            placeholder="Cantidad"
            min="1"
            max="10000"
            required
          />
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text font-semibold">ISBN</span>
          </label>
          <input
            type="text"
            v-model="formData.isbn"
            class="input input-bordered w-full"
            placeholder="ISBN"
          />
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text font-semibold">URI</span>
          </label>
          <input
            type="url"
            v-model="formData.uri"
            class="input input-bordered w-full"
            placeholder="https://..."
          />
        </div>
      </div>

      <!-- Descripción -->
      <div class="form-control">
        <label class="label">
          <span class="label-text font-semibold">Resumen</span>
        </label>
        <textarea
          v-model="formData.resumen"
          class="textarea textarea-bordered w-full"
          placeholder="Resumen del libro"
          rows="4"
        ></textarea>
      </div>

      <!-- Portada -->
      <div class="form-control">
        <label class="label">
          <span class="label-text font-semibold">Portada *</span>
        </label>
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-4">
          <!-- Preview portada existente -->
          <div v-if="formData.portada" class="mb-4">
            <div class="relative inline-block">
              <img
                :src="formData.portada"
                alt="Portada"
                class="w-32 h-48 object-cover rounded-lg"
              />
              <button
                v-if="modo === 'editar'"
                type="button"
                @click="eliminarPortada"
                class="absolute -top-2 -right-2 btn btn-circle btn-sm btn-error"
              >
                <span class="mdi mdi-delete"></span>
              </button>
            </div>
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
            Subiendo portada...
          </div>
        </div>
      </div>

      <!-- PDF del libro -->
      <div class="form-control">
        <label class="label">
          <span class="label-text font-semibold">Archivo PDF *</span>
        </label>
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-4">
          <!-- PDF existente -->
          <div v-if="formData.pdf_url" class="mb-4 flex items-center gap-3">
            <div class="flex-1 flex items-center gap-2">
              <span class="mdi mdi-file-pdf-box text-red-500 text-3xl"></span>
              <div>
                <p class="font-semibold">PDF cargado</p>
                <a
                  :href="formData.pdf_url"
                  target="_blank"
                  class="text-sm text-blue-500 hover:underline"
                >
                  Ver PDF
                </a>
              </div>
            </div>
            <button
              v-if="modo === 'editar'"
              type="button"
              @click="eliminarPDF"
              class="btn btn-circle btn-sm btn-error"
            >
              <span class="mdi mdi-delete"></span>
            </button>
          </div>

          <input
            ref="pdfInput"
            type="file"
            @change="handlePDFSelect"
            accept="application/pdf"
            class="file-input file-input-bordered w-full"
          />

          <div
            v-if="subiendoPDF"
            class="flex items-center gap-2 mt-2 text-sm text-blue-500"
          >
            <span class="loading loading-spinner loading-sm"></span>
            Subiendo PDF...
          </div>
        </div>
      </div>

      <!-- Palabras clave -->
      <div class="form-control">
        <label class="label">
          <span class="label-text font-semibold">Palabras clave</span>
        </label>
        <div class="border border-gray-300 rounded-lg p-4">
          <div class="flex gap-3 mb-3">
            <input
              type="text"
              v-model="palabraClave"
              @keyup.enter="agregarPalabraClave"
              class="input input-bordered flex-1"
              placeholder="Agregar palabra clave"
            />
            <button
              type="button"
              @click="agregarPalabraClave"
              class="btn btn-info"
            >
              <span class="mdi mdi-plus"></span>
              Agregar
            </button>
          </div>

          <div class="flex flex-wrap gap-2">
            <div
              v-for="(palabra, index) in formData.palabras_clave"
              :key="index"
              class="badge badge-info gap-2 py-3"
            >
              {{ palabra }}
              <button
                type="button"
                @click="eliminarPalabra(palabra)"
                class="btn btn-xs btn-circle btn-ghost"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Autores/Investigadores -->
      <div class="form-control">
        <label class="label">
          <span class="label-text font-semibold">Autores *</span>
        </label>
        <select
          v-model="autorSeleccionado"
          @change="agregarAutor"
          class="select select-bordered w-full"
        >
          <option disabled value="">Seleccionar autor</option>
          <option
            v-for="investigador in investigadores"
            :key="investigador._id"
            :value="investigador"
          >
            {{ investigador.nombre }}
          </option>
        </select>

        <!-- Lista de autores agregados -->
        <div v-if="formData.autores.length > 0" class="mt-3 space-y-2">
          <div
            v-for="(autor, index) in formData.autores"
            :key="index"
            class="flex items-center gap-3 p-2 bg-base-200 rounded-lg"
          >
            <img
              v-if="autor.foto"
              :src="autor.foto"
              :alt="autor.nombre"
              class="w-10 h-10 rounded-full object-cover"
            />
            <div
              v-else
              class="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center"
            >
              {{ autor.nombre.charAt(0) }}
            </div>
            <span class="flex-1">{{ autor.nombre }}</span>
            <button
              type="button"
              @click="eliminarAutor(index)"
              class="btn btn-sm btn-ghost btn-circle"
            >
              <span class="mdi mdi-delete"></span>
            </button>
          </div>
        </div>
      </div>

      <!-- Botones de acción -->
      <div class="modal-action sticky bottom-0 bg-base-100 pt-4 border-t">
        <button
          type="button"
          class="btn"
          @click="cerrar"
          :disabled="guardando || subiendoPortada || subiendoPDF"
        >
          Cancelar
        </button>
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="
            guardando ||
            subiendoPortada ||
            subiendoPDF ||
            !formData.portada ||
            !formData.pdf_url
          "
        >
          <span
            v-if="guardando || subiendoPortada || subiendoPDF"
            class="loading loading-spinner loading-sm"
          ></span>
          {{
            subiendoPortada || subiendoPDF
              ? "Subiendo archivos..."
              : guardando
                ? "Guardando..."
                : modo === "crear"
                  ? "Crear libro"
                  : "Guardar cambios"
          }}
        </button>
      </div>
    </form>
  </div>
  <!-- Alerta -->
  <Alert v-if="alert" :type="alertData.type" :mensaje="alertData.mensaje" />
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import Alert from "../../../alert/Alert.vue";
import { email } from "zod/v4";

const props = defineProps({
  libro: {
    type: Object,
    default: () => ({}),
  },
  modo: {
    type: String,
    default: "crear",
  },
});

const emit = defineEmits(["cerrar", "guardar"]);

// Referencias
const portadaInput = ref(null);
const pdfInput = ref(null);

// Estados
const guardando = ref(false);
const subiendoPortada = ref(false);
const subiendoPDF = ref(false);

// Datos
const investigadores = ref([]);
const coleccionesOptions = ref([]);
const palabraClave = ref("");
const autorSeleccionado = ref("");

// Alerta
const alert = ref(false);
const alertData = ref({ type: "", mensaje: "" });

// Archivos para eliminar (en caso de edición)
const archivosAEliminar = ref({
  portada: null,
  pdf: null,
  thumbnail: null,
});
// Datos del formulario
const formData = ref({
  _id: "",
  titulo: "",
  tipo: "",
  fecha_publicacion: new Date().toISOString(),
  editorial: "",
  coleccion: "",
  paginas: null,
  isbn: "",
  uri: "",
  resumen: "",
  portada: "",
  pdf_url: "",
  pdf_thumbnail: "",
  palabras_clave: [],
  autores: [],
});

const mostrarAlerta = (tipo, mensaje) => {
  alertData.value = { type: tipo, mensaje: mensaje };
  alert.value = true;
  setTimeout(() => {
    alert.value = false;
  }, 3000);
};

// Cargar investigadores
const cargarInvestigadores = async () => {
  try {
    const response = await fetch(
      "/api/libros/obtener?coleccion=investigadores",
    );
    if (!response.ok) throw new Error("Error al cargar investigadores");

    const data = await response.json();
    investigadores.value = data.rows.map((row) => row.doc);
    console.log("Investigadores cargados:", investigadores.value);
  } catch (error) {
    console.error("Error al cargar investigadores:", error);
  }
};

// Cargar colecciones de la editorial
const cargarColecciones = async () => {
  try {
    const response = await fetch("/api/libros/obtener?id=colecciones");
    if (!response.ok) throw new Error("Error al cargar colecciones");

    const data = await response.json();
    coleccionesOptions.value = data.colecciones || [];
    console.log("Colecciones cargadas:", coleccionesOptions.value);
  } catch (error) {
    console.error("Error al cargar colecciones:", error);
    mostrarAlerta("error", `Error al cargar colecciones: ${error.message}`);
  }
};

// Resetear formulario
const resetearFormulario = () => {
  formData.value = {
    _id: "",
    titulo: "",
    tipo: "",
    fecha_publicacion: "",
    editorial: "",
    coleccion: "",
    paginas: null,
    isbn: "",
    uri: "",
    resumen: "",
    portada: "",
    pdf_url: "",
    pdf_thumbnail: "",
    palabras_clave: [],
    autores: [],
  };
  palabraClave.value = "";
  autorSeleccionado.value = "";
  archivosAEliminar.value = { portada: null, pdf: null, thumbnail: null };

  if (portadaInput.value) portadaInput.value.value = "";
  if (pdfInput.value) pdfInput.value.value = "";
};

// Watch para cargar datos al editar
watch(
  () => props.libro,
  (nuevoLibro) => {
    if (nuevoLibro && Object.keys(nuevoLibro).length > 0) {
      formData.value = {
        _id: nuevoLibro._id || "",
        titulo: nuevoLibro.titulo || "",
        tipo: nuevoLibro.tipo || "",
        fecha_publicacion: nuevoLibro.fecha_publicacion || "",
        editorial: nuevoLibro.editorial || "",
        coleccion: nuevoLibro.coleccion || "",
        paginas: nuevoLibro.paginas || null,
        isbn: nuevoLibro.isbn || "",
        uri: nuevoLibro.uri || "",
        resumen: nuevoLibro.resumen || "",
        portada: nuevoLibro.portada || "",
        pdf_url: nuevoLibro.pdf_url || "",
        pdf_thumbnail: nuevoLibro.pdf_thumbnail || "",
        palabras_clave: nuevoLibro.palabras_clave || [],
        autores: nuevoLibro.autores || [],
      };
      console.log("Datos cargados para editar:", formData.value);
    } else {
      resetearFormulario();
    }
  },
  { immediate: true, deep: true },
);

// Subir portada
const handlePortadaSelect = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    subiendoPortada.value = true;

    // Si estamos editando y había una portada anterior, marcarla para eliminar
    if (props.modo === "editar" && formData.value.portada) {
      archivosAEliminar.value.portada = formData.value.portada;
    }

    const formDataImagen = new FormData();
    formDataImagen.append("foto", file);
    formDataImagen.append("carpeta", "libros/portadas");

    const response = await fetch("/api/subir_imagen", {
      method: "POST",
      body: formDataImagen,
    });

    if (!response.ok) {
      mostrarAlerta("error", "Error al subir la portada");
      throw new Error("Error al subir la portada");
    }

    const data = await response.json();
    if (!data.ok) {
      mostrarAlerta("error", data.error || "Error en subida");
      throw new Error(data.error || "Error en subida");
    }

    formData.value.portada = data.url;
    console.log("Portada subida:", data.url);
    mostrarAlerta("success", "Portada subida con éxito");
  } catch (error) {
    console.error("Error al subir portada:", error);
    mostrarAlerta("error", `Error al subir la portada: ${error.message}`);
  } finally {
    subiendoPortada.value = false;
  }
};

// Subir PDF
const handlePDFSelect = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    subiendoPDF.value = true;

    // Si estamos editando y había un PDF anterior, marcarlo para eliminar
    if (props.modo === "editar" && formData.value.pdf_url) {
      archivosAEliminar.value.pdf = formData.value.pdf_url;
      if (formData.value.pdf_thumbnail) {
        archivosAEliminar.value.thumbnail = formData.value.pdf_thumbnail;
      }
    }

    const formDataPDF = new FormData();
    formDataPDF.append("pdf", file);
    formDataPDF.append("carpeta", "libros");

    const response = await fetch("/api/subir_pdf", {
      method: "POST",
      body: formDataPDF,
    });

    if (!response.ok) {
      mostrarAlerta("error", "Error al subir el PDF");
      throw new Error("Error al subir el PDF");
    }

    const data = await response.json();
    if (!data.ok) {
      mostrarAlerta("error", data.error || "Error en subida del PDF");
      throw new Error(data.error || "Error en subida del PDF");
    }

    formData.value.pdf_url = data.pdfUrl;
    formData.value.pdf_thumbnail = data.thumbnailUrl || "";
    console.log("PDF subido:", data.pdfUrl);
    console.log("Thumbnail:", data.thumbnailUrl);
  } catch (error) {
    console.error("Error al subir PDF:", error);
    mostrarAlerta("error", `Error al subir el PDF: ${error.message}`);
  } finally {
    subiendoPDF.value = false;
  }
};

// Eliminar portada
const eliminarPortada = () => {
  if (confirm("¿Estás seguro de eliminar la portada?")) {
    archivosAEliminar.value.portada = formData.value.portada;
    formData.value.portada = "";
    if (portadaInput.value) portadaInput.value.value = "";
  }
};

// Eliminar PDF
const eliminarPDF = () => {
  if (confirm("¿Estás seguro de eliminar el PDF?")) {
    archivosAEliminar.value.pdf = formData.value.pdf_url;
    if (formData.value.pdf_thumbnail) {
      archivosAEliminar.value.thumbnail = formData.value.pdf_thumbnail;
    }
    formData.value.pdf_url = "";
    formData.value.pdf_thumbnail = "";
    if (pdfInput.value) pdfInput.value.value = "";
  }
};

// Palabras clave
const agregarPalabraClave = () => {
  if (palabraClave.value && palabraClave.value.trim()) {
    if (formData.value.palabras_clave.includes(palabraClave.value.trim())) {
      mostrarAlerta("warning", "La palabra clave ya ha sido agregada");
    } else {
      formData.value.palabras_clave.push(palabraClave.value.trim());
    }
    palabraClave.value = "";
  }
};

const eliminarPalabra = (palabra) => {
  formData.value.palabras_clave = formData.value.palabras_clave.filter(
    (p) => p !== palabra,
  );
};

// Autores
const agregarAutor = () => {
  if (autorSeleccionado.value) {
    const existe = formData.value.autores.some(
      (a) => a.id === autorSeleccionado.value._id,
    );

    if (!existe) {
      formData.value.autores.push({
        id: autorSeleccionado.value._id,
        nombre: autorSeleccionado.value.nombre,
        foto: autorSeleccionado.value.foto || "",
        email: autorSeleccionado.value.email || "",
      });
    } else {
      mostrarAlerta("warning", "El autor ya ha sido agregado");
    }

    autorSeleccionado.value = "";
  }
};

const eliminarAutor = (index) => {
  formData.value.autores.splice(index, 1);
};

// Eliminar archivos del servidor
// const eliminarArchivosDelServidor = async () => {
//   const archivos = archivosAEliminar.value;

//   if (archivos.portada || archivos.pdf || archivos.thumbnail) {
//     try {
//       // Aquí llamarías a una API para eliminar archivos
//       // Por ahora solo log
//       console.log("Archivos a eliminar:", archivos);

//       // TODO: Implementar API para eliminar archivos
//       // await fetch('/api/eliminar_archivos', {
//       //   method: 'POST',
//       //   headers: { 'Content-Type': 'application/json' },
//       //   body: JSON.stringify(archivos)
//       // });
//     } catch (error) {
//       console.error("Error al eliminar archivos:", error);
//     }
//   }
// };

// Cerrar modal
const cerrar = () => {
  resetearFormulario();
  emit("cerrar");
};

// Guardar
const guardar = async () => {
  try {
    guardando.value = true;

    // Validaciones
    if (!formData.value.titulo || !formData.value.tipo) {
      mostrarAlerta("error", "Título y tipo son obligatorios");
      guardando.value = false;
      return;
    }

    if (!formData.value.portada) {
      mostrarAlerta("error", "La portada es obligatoria");
      guardando.value = false;
      return;
    }

    if (!formData.value.pdf_url) {
      mostrarAlerta("error", "El archivo PDF es obligatorio");
      guardando.value = false;
      return;
    }

    if (formData.value.autores.length === 0) {
      mostrarAlerta("error", "Debes agregar al menos un autor");
      guardando.value = false;
      return;
    }

    console.log("Guardando libro:", formData.value);

    // // Si estamos editando, eliminar archivos antiguos
    // if (props.props.modo === "editar") {
    //   await eliminarArchivosDelServidor();
    // }

    // Emitir evento
    emit("guardar", { ...formData.value });
  } catch (error) {
    console.error("Error al guardar:", error);
    mostrarAlerta("error", `Error: ${error.message}`);
  } finally {
    guardando.value = false;
  }
};

// Lifecycle
onMounted(() => {
  cargarInvestigadores();
  cargarColecciones();
});
</script>

<style scoped>
.modal-box {
  scrollbar-width: thin;
}
</style>
