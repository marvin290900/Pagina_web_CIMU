<template>
  <section class="w-11/12 sm:w-[80%] mx-auto">
    <div class="flex justify-between py-4">
      <h2 class="text-3xl font-bold">Agregar nuevo libro</h2>
      <button class="btn btn-primary" onclick="modal_libros.showModal()">
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
            <th>Titulo</th>
            <th>Fecha publicacion</th>
            <th>Editorial</th>
            <th>Coleccion</th>
            <th>Paginas</th>
            <th>Formato</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <!-- row 1 -->
          <tr>
            <th>La vida en el campo de los ciaudadanos de santa ana centro</th>
            <td>20-12-2024</td>
            <td>Editorial multidiscilinaria</td>
            <td>Conociendo mi cultura</td>
            <td>223</td>
            <td>Adobe Portable Document Format</td>
            <td class="flex gap-3">
              <button class="btn btn-soft btn-primary btn-sm">
                <span class="mdi mdi-pencil"></span>
                Editar
              </button>
              <button class="btn btn-soft btn-error btn-sm">
                <span class="mdi mdi-delete"></span>
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- You can open the modal using ID.showModal() method -->
    <dialog id="modal_libros" class="modal">
      <ModalLibros />
    </dialog>
  </section>
</template>

<script setup>
import ModalLibros from "./componentes_libros/ModalLibros.vue";
</script>
