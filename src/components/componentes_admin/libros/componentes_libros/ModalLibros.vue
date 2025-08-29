<template>
  <div class="modal-box w-2/3">
    <h3 class="text-lg font-bold">Agregar nuevo libro</h3>
    <form action="" class="py-6 flex flex-col gap-3">
      <input
        type="text"
        class="input w-full"
        placeholder="Titulo"
        list="browsers"
        required
      />
      <input
        type="text"
        class="input w-full"
        placeholder="Tipo"
        list="browsers"
        required
      />
      <input type="date" class="input w-full" />

      <select class="select w-full">
        <option disabled selected>Editorial</option>
        <option>Editorial 1</option>
        <option>Editorial 2</option>
        <option>Editorial 3</option>
      </select>

      <select class="select w-full">
        <option disabled selected>Coleccion</option>
        <option>Coleccion 1</option>
        <option>Coleccion 2</option>
        <option>Coleccion 3</option>
      </select>

      <input
        type="number"
        class="input validator w-full"
        required
        placeholder="Cantidad de paginas"
        min="1"
        max="10000"
      />

      <input
        type="text"
        class="input w-full"
        placeholder="ISBN"
        list="browsers"
        required
      />
      <input
        type="text"
        class="input w-full"
        placeholder="URI"
        list="browsers"
        required
      />
      <textarea class="textarea w-full" placeholder="Descripcion"></textarea>
      <div
        class="w-full gap-4 py-4 border-1 border-dashed border-gray-500/25 rounded-xl"
      >
        <h3 class="px-4 pb-3">Subir portada de libro</h3>
        <input type="file" class="file-input file-input-primary mx-4" />
      </div>
      <div
        class="w-full gap-4 py-4 border-1 border-dashed border-gray-500/25 rounded-xl"
      >
        <h3 class="px-4 pb-3">Subir libro formato</h3>
        <input type="file" class="file-input file-input-primary mx-4" />
      </div>
      <div class="w-full gap-4 py-4 border-1 border-gray-500/25 rounded-xl">
        <h3 class="px-4 pb-3">Agregar palabras clave</h3>
        <div class="flex gap-3 justify-between mx-auto px-4">
          <input
            type="text"
            class="input"
            placeholder="Palabra clave"
            list="browsers"
            required
            v-model="palabraClave"
          />
          <button class="btn btn-soft btn-info" @click="agregarPalabraClave()">
            Agregar
          </button>
        </div>
        <div class="px-4 flex flex-wrap py-6 gap-3">
          <div
            v-for="(palabra, index) in palabrasClave"
            :key="index"
            class="badge badge-soft badge-info"
          >
            {{ palabra }}
            <button
              class="btn btn-xs btn-soft btn-error rounded-full"
              @click="eliminarPalabra(palabra)"
            >
              <span class="mdi mdi-delete"></span>
            </button>
          </div>
        </div>
      </div>
    </form>
    <div class="modal-action">
      <form method="dialog">
        <!-- if there is a button, it will close the modal -->
        <button class="btn">Close</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
const palabrasClave = ref([]);
const palabraClave = ref("");

const agregarPalabraClave = () => {
  if (palabraClave.value) {
    if (palabrasClave.value.includes(palabraClave.value)) {
      palabraClave.value = "";
      alert("Ya se agrego la palabra clave");
    } else {
      palabrasClave.value.push(palabraClave.value);
      palabraClave.value = "";
    }
  } else {
    alert("Ingrese una palabra clave");
  }
};

const eliminarPalabra = (texto) => {
  palabrasClave.value = palabrasClave.value.filter(
    (palabra) => palabra != texto
  );
  console.log(palabrasClave.value);
};
</script>
