<template>
  <section class="p-6">
    <h1 class="text-3xl font-bold mb-6">Administrador de Artículos</h1>

    <!-- Botón para agregar nuevo -->
    <button class="btn btn-primary mb-6" @click="openNewArticleModal">
      ➕ Agregar Artículo
    </button>

    <!-- Grid de Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      <div
        v-for="articulo in sortedArticulos"
        :key="articulo._id"
        class="card bg-base-100 shadow-xl"
      >
        <div class="card-body">
          <h2 class="card-title">{{ articulo.titulo }}</h2>
          <p class="text-sm text-gray-500">Tipo: {{ articulo.tipo }}</p>
          <p class="text-sm">Autores: {{ articulo.autores?.join(', ') }}</p>
          <p class="text-sm">Páginas: {{ articulo.paginas }}</p>
          <p class="text-sm">Publicado: {{ formatDate(articulo.fecha_publicacion) }}</p>
          <p class="text-sm text-gray-600">
            Creado por: {{ articulo.metadata?.subido_por }} |
            {{ articulo.metadata?.fecha_creacion }}
          </p>

          <div class="card-actions justify-end mt-4">
            <a
              v-if="articulo.pdf_url"
              :href="articulo.pdf_url"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn-sm btn-outline"
            >
              📄 Ver PDF
            </a>
            <button
              class="btn btn-sm btn-outline btn-primary"
              @click="openEditModal(articulo)"
            >
              Editar
            </button>
            <!-- Ahora abre modal de confirmación en vez de confirm() nativo -->
            <button
              class="btn btn-sm btn-outline btn-error"
              @click="requestDelete(articulo)"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para Editar / Crear -->
    <dialog ref="editModal" class="modal">
      <form
        method="dialog"
        class="modal-box w-11/12 max-w-2xl"
        @submit.prevent="guardarArticulo"
      >
        <h3 class="font-bold text-lg mb-4">
          {{ articuloEdit._id ? "Editar Artículo" : "Nuevo Artículo" }}
        </h3>

        <div class="flex flex-col gap-3">
          <label class="label">Título</label>
          <input
            v-model="articuloEdit.titulo"
            type="text"
            placeholder="Título"
            class="input input-bordered w-full"
            required
          />

          <label class="label">Autores (separados por coma)</label>
          <textarea
            v-model="autoresInput"
            placeholder="Autor1, Autor2, ..."
            class="textarea textarea-bordered w-full"
            required
          ></textarea>

          <label class="label">Tipo</label>
          <select
            v-model="articuloEdit.tipo"
            class="select select-bordered w-full"
            required
          >
            <option value="" disabled>Selecciona el tipo</option>
            <option value="Articulo Original">Artículo Original</option>
            <option value="Articulos de revision">Artículo de Revisión</option>
          </select>

          <label class="label">Páginas</label>
          <input
            v-model="articuloEdit.paginas"
            type="text"
            placeholder="Ej. 28-54"
            class="input input-bordered w-full"
            required
          />

          <label class="label">Fecha de publicación</label>
          <input
            v-model="articuloEdit.fecha_publicacion"
            type="date"
            class="input input-bordered w-full"
            required
          />

          <label class="label">URL del PDF (opcional si subes archivo)</label>
          <input
            v-model="articuloEdit.pdf_url"
            type="url"
            placeholder="https://..."
            class="input input-bordered w-full"
            :required="!fileSelected"
          />

          <label class="label">Subir PDF (si subes archivo la URL no es necesaria)</label>
          <input
            ref="fileInput"
            type="file"
            accept="application/pdf"
            class="file-input file-input-bordered w-full"
            @change="handleFile"
            :required="!articuloEdit.pdf_url && !articuloEdit._id"
          />

          <p class="text-xs text-gray-500">
            Nota: debes proporcionar una URL o subir un PDF. Si subes un PDF se almacenará de forma segura en el servidor.
          </p>
        </div>

        <div class="modal-action">
          <button type="submit" class="btn">Guardar</button>
          <button type="button" class="btn btn-outline" @click="closeModal">
            Cancelar
          </button>
        </div>
      </form>
    </dialog>

    <!-- Modal de confirmación de eliminación (DaisyUI) -->
    <dialog ref="deleteModal" class="modal">
      <form method="dialog" class="modal-box w-11/12 max-w-lg">
        <h3 class="font-bold text-lg mb-2">Confirmar eliminación</h3>
        <p class="mb-4">¿Deseas eliminar el artículo <strong>{{ pendingDelete.title }}</strong>?</p>
        <p class="text-sm text-gray-500 mb-4">Esta acción es irreversible.</p>
        <div class="flex justify-end gap-3">
          <button type="button" class="btn btn-outline" @click="cancelDelete">Cancelar</button>
          <button type="button" class="btn btn-error" @click="eliminarArticuloConfirmed">Eliminar</button>
        </div>
      </form>
    </dialog>

    <!-- Toasts container (bottom-right) -->
    <div class="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
      <div
        v-for="t in toasts"
        :key="t.id"
        class="toast"
        role="status"
        :aria-live="t.type === 'error' ? 'assertive' : 'polite'"
      >
        <div :class="['alert', 'shadow-lg', toastVariant(t.type)]">
          <div class="flex-1">
            <svg v-if="t.type === 'success'" xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
            <svg v-if="t.type === 'error'" xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            <svg v-if="t.type === 'info'" xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" /></svg>
            <div class="ml-3">
              <div class="font-medium">{{ t.title }}</div>
              <div class="text-sm opacity-80">{{ t.message }}</div>
            </div>
          </div>
          <div class="flex-none">
            <button class="btn btn-ghost btn-sm" @click="removeToast(t.id)" aria-label="Cerrar">✕</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";

/* ---------- estado ---------- */
const articulos = ref([]);
const articuloEdit = ref({});
const autoresInput = ref("");
const editModal = ref(null);
const deleteModal = ref(null);
const fileInput = ref(null);
const fileSelected = ref(null);

/* ---------- para confirmar eliminación ---------- */
const pendingDelete = ref({ id: null, rev: null, title: "" });

/* ---------- Toasts ---------- */
const toasts = ref([]);
const showToast = (message, type = "info", title = "", timeout = 4000) => {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  toasts.value.push({ id, type, title: title || (type === "success" ? "Éxito" : type === "error" ? "Error" : "Info"), message });
  setTimeout(() => removeToast(id), timeout);
};
const removeToast = (id) => {
  const idx = toasts.value.findIndex((t) => t.id === id);
  if (idx !== -1) toasts.value.splice(idx, 1);
};
const toastVariant = (type) => {
  if (type === "success") return "alert-success";
  if (type === "error") return "alert-error";
  if (type === "warning") return "alert-warning";
  return "alert-info";
};

/* ---------- API config ---------- */
const API_URL = "/api/articulos";

/* ---------- cargar artículos ---------- */
const cargarArticulos = async () => {
  try {
    const { data } = await axios.get(API_URL);
    articulos.value = data;
  } catch (err) {
    console.error("Error cargando artículos:", err);
    showToast("Error cargando artículos. Revisa la consola.", "error", "Carga fallida", 6000);
  }
};

/* ---------- orden (recientes primero) ---------- */
const sortedArticulos = computed(() => {
  return [...articulos.value].sort((a, b) => {
    const da = a.fecha_publicacion || "0000-01-01";
    const db = b.fecha_publicacion || "0000-01-01";
    return db.localeCompare(da);
  });
});

/* ---------- formularios / modales ---------- */
const openEditModal = (articulo) => {
  articuloEdit.value = { ...articulo };
  autoresInput.value = articulo.autores ? articulo.autores.join(", ") : "";
  fileSelected.value = null;
  if (fileInput.value) fileInput.value.value = null;
  editModal.value.showModal();
};

const openNewArticleModal = () => {
  articuloEdit.value = {
    titulo: "",
    autores: [],
    tipo: "",
    paginas: "",
    fecha_publicacion: "",
    pdf_url: "",
    metadata: null,
  };
  autoresInput.value = "";
  fileSelected.value = null;
  if (fileInput.value) fileInput.value.value = null;
  editModal.value.showModal();
};

const closeModal = () => {
  editModal.value.close();
};

/* ---------- manejo de archivo ---------- */
const handleFile = (e) => {
  const f = e.target.files[0];
  if (f && f.type === "application/pdf") {
    fileSelected.value = f;
  } else {
    fileSelected.value = null;
    if (f) showToast("El archivo debe ser un PDF (.pdf)", "error");
  }
};

/* ---------- validación ---------- */
const validarFormulario = () => {
  if (!articuloEdit.value.titulo?.trim()) {
    showToast("Título es obligatorio", "error");
    return false;
  }
  if (!autoresInput.value.trim()) {
    showToast("Autores es obligatorio (separados por coma)", "error");
    return false;
  }
  if (!articuloEdit.value.tipo) {
    showToast("Tipo de artículo es obligatorio", "error");
    return false;
  }
  if (!articuloEdit.value.paginas?.trim()) {
    showToast("Páginas es obligatorio", "error");
    return false;
  }
  if (!articuloEdit.value.fecha_publicacion) {
    showToast("Fecha de publicación es obligatoria", "error");
    return false;
  }
  const hasPdfUrl = !!(articuloEdit.value.pdf_url && articuloEdit.value.pdf_url.trim());
  if (!hasPdfUrl && !fileSelected.value && !articuloEdit.value._id) {
    showToast("Debes proporcionar una URL de PDF o subir un archivo PDF", "error");
    return false;
  }
  if (!hasPdfUrl && !fileSelected.value && articuloEdit.value._id) {
    if (!articuloEdit.value.pdf_url) {
      showToast("Debes proporcionar una URL de PDF o subir un archivo PDF", "error");
      return false;
    }
  }
  return true;
};

/* ---------- guardar (crear / editar) con attachments ---------- */
const guardarArticulo = async () => {
  try {
    if (!validarFormulario()) return;

    // preparar autores
    articuloEdit.value.autores = autoresInput.value
      .split(",")
      .map((a) => a.trim())
      .filter((a) => a);

    // metadata
    const fechaHoy = new Date().toISOString().split("T")[0];
    if (!articuloEdit.value.metadata) {
      articuloEdit.value.metadata = {
        subido_por: "admin",
        fecha_creacion: fechaHoy,
        ultima_actualizacion: fechaHoy,
      };
    } else {
      articuloEdit.value.metadata.ultima_actualizacion = fechaHoy;
      if (!articuloEdit.value.metadata.subido_por) articuloEdit.value.metadata.subido_por = "admin";
      if (!articuloEdit.value.metadata.fecha_creacion) articuloEdit.value.metadata.fecha_creacion = fechaHoy;
    }

    if (articuloEdit.value._id) {
      // EDITAR
      const id = articuloEdit.value._id;
      const putResp = await axios.put(`${API_URL}?id=${encodeURIComponent(id)}`, articuloEdit.value);
      let currentRev = putResp.data.rev;

      if (fileSelected.value) {
        const filename = fileSelected.value.name;
        const attachUrl = `${API_URL}?id=${encodeURIComponent(id)}&filename=${encodeURIComponent(filename)}&rev=${currentRev}`;
        const attachResp = await axios.put(attachUrl, fileSelected.value, {
          headers: { "Content-Type": "application/pdf" },
        });
        currentRev = attachResp.data.rev;

        // Actualizar URL del PDF en el documento para que use el proxy
        articuloEdit.value.pdf_url = `${API_URL}?id=${encodeURIComponent(id)}&filename=${encodeURIComponent(filename)}`;
        articuloEdit.value._rev = currentRev; // Actualizar rev para el siguiente put
        await axios.put(`${API_URL}?id=${encodeURIComponent(id)}`, articuloEdit.value);
      }

      showToast("Artículo actualizado correctamente", "success");
    } else {
      // CREAR
      const postResp = await axios.post(API_URL, articuloEdit.value);
      const id = postResp.data.id;
      let currentRev = postResp.data.rev;

      if (fileSelected.value) {
        const filename = fileSelected.value.name;
        const attachUrl = `${API_URL}?id=${encodeURIComponent(id)}&filename=${encodeURIComponent(filename)}&rev=${currentRev}`;
        const attachResp = await axios.put(attachUrl, fileSelected.value, {
          headers: { "Content-Type": "application/pdf" },
        });
        currentRev = attachResp.data.rev;

        const updatedDoc = { 
          ...(articuloEdit.value), 
          _id: id, 
          _rev: currentRev, 
          pdf_url: `${API_URL}?id=${encodeURIComponent(id)}&filename=${encodeURIComponent(filename)}` 
        };
        await axios.put(`${API_URL}?id=${encodeURIComponent(id)}`, updatedDoc);
      }

      showToast("Artículo creado correctamente", "success");
    }

    await cargarArticulos();
    closeModal();
  } catch (err) {
    console.error("Error guardando artículo:", err);
    showToast("Error guardando artículo. Revisa la consola.", "error", "Guardado fallido", 6000);
  }
};

/* ---------- eliminación usando modal ---------- */
/**
 * requestDelete: prepara y abre modal de confirmación
 * recibe el documento (artículo)
 */
const requestDelete = (articulo) => {
  pendingDelete.value = { id: articulo._id, rev: articulo._rev, title: articulo.titulo || "(sin título)" };
  deleteModal.value.showModal();
};

/**
 * cancelar eliminación (cierra modal y limpia pendiente)
 */
const cancelDelete = () => {
  pendingDelete.value = { id: null, rev: null, title: "" };
  deleteModal.value.close();
};

/**
 * eliminarArticuloConfirmed: ejecuta la eliminación real
 */
const eliminarArticuloConfirmed = async () => {
  const { id, rev } = pendingDelete.value;
  if (!id) {
    showToast("No hay artículo seleccionado para eliminar", "error");
    cancelDelete();
    return;
  }
  try {
    await axios.delete(`${API_URL}?id=${encodeURIComponent(id)}&rev=${rev}`);
    await cargarArticulos();
    showToast("Artículo eliminado", "success");
  } catch (err) {
    console.error("Error eliminando artículo:", err);
    showToast("Error eliminando artículo. Revisa la consola.", "error", "Eliminación fallida", 6000);
  } finally {
    cancelDelete();
  }
};

/* ---------- util ---------- */
const formatDate = (d) => (d ? d : "");

/* ---------- init ---------- */
onMounted(() => {
  cargarArticulos();
});
</script>

<style scoped>
/* Ajustes mínimos para el modal dialog en navegadores */
.modal::backdrop {
  background: rgba(0, 0, 0, 0.5);
}

/* Ajustes para el toast (si quieres cambiar tamaño/posición) */
.toast {
  min-width: 320px;
}
</style>
