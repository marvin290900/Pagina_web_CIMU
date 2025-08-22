<script setup>
// Simulación de datos (estos vendrían de CouchDB en el futuro)
const articulosOriginales = [
  {
    "_id": "articulo:2025-08-21:remi-001", 
  "titulo": "LA DANZA DE LOS CHAPETONES EN EL MUNICIPIO DE PANCHIMALCO",
  "autores": [
    "Jaime Ernesto Jiménez Hernández"
  ],
  "tipo": "Articulo Original", 
  "paginas": "28-54",
  "fecha_publicacion": "2025-08-21",
  "pdf_url": "/pdfs/danza-chapetones.pdf",
  "keywords": [
    "Danza",
    "Panchimalco",
    "Historia cultural"
  ],
  "estado": "publicado",  
  "metadata": {
    "subido_por": "admin",
    "fecha_creacion": "2025-08-15",
    "ultima_actualizacion": "2025-08-21"
  }
  },
  
];

const articulosRevision = [
  {
    tipo: "Artículos de revisión",
    titulo: "EDUCACIÓN AMBIENTAL Y USO SOSTENIBLE DEL AGUA EN REGIONES ÁRIDAS: UNA REVISIÓN BIBLIOMÉTRICA Y SISTEMÁTICA",
    autores: "Yvonne Cutipa, Delia Mamani",
    paginas: "93-120",
    pdf: "/pdfs/educacion-ambiental.pdf"
  },
  {
    tipo: "Artículos de revisión",
    titulo: "EL CURRÍCULUM, UNA REFLEXIÓN EDUCATIVA DESDE LOS MODELOS DE ENSEÑANZA",
    autores: "Ana Karla Zetino Escalante",
    paginas: "121-129",
    pdf: "/pdfs/curriculum.pdf"
  }
];

// FUTURO: Aquí iría la conexión a CouchDB
/*
import { onMounted, ref } from 'vue';
const articulosOriginales = ref([]);
const articulosRevision = ref([]);

onMounted(async () => {
  const resOriginales = await fetch('http://tu-couchdb/articulos?tipo=original');
  articulosOriginales.value = await resOriginales.json();

  const resRevision = await fetch('http://tu-couchdb/articulos?tipo=revision');
  articulosRevision.value = await resRevision.json();
});
*/
</script>

<template>
  <div class="max-w-4xl mx-auto p-4 space-y-8">
    <!-- Tarjeta Artículos Originales -->
    <div class="bg-white shadow-md rounded-lg p-6">
      <h2 class="text-lg font-bold border-b pb-2 mb-4">Artículos originales</h2>
      <div v-for="(art, index) in articulosOriginales" :key="index" class="mb-6">
        <h3 class="font-bold text-blue-700">{{ art.tipo }} {{ art.titulo }}</h3>
        <p class="text-gray-700">{{ art.autores }}</p>
        <div class="flex items-center justify-between mt-2">
          <a :href="art.pdf" target="_blank" class="btn btn-outline btn-sm">
            📄 Ver PDF
          </a>
          <span class="text-gray-500">{{ art.paginas }}</span>
        </div>
      </div>
    </div>

    <!-- Tarjeta Artículos de Revisión -->
    <div class="bg-white shadow-md rounded-lg p-6">
      <h2 class="text-lg font-bold border-b pb-2 mb-4">Artículos de revisión</h2>
      <div v-for="(art, index) in articulosRevision" :key="index" class="mb-6">
        <h3 class="font-bold text-blue-700">{{ art.tipo }} {{ art.titulo }}</h3>
        <p class="text-gray-700">{{ art.autores }}</p>
        <div class="flex items-center justify-between mt-2">
          <a :href="art.pdf" target="_blank" class="btn btn-outline btn-sm">
            📄 Ver PDF
          </a>

         
          <span class="text-gray-500">{{ art.paginas }}</span>
        </div>
      </div>
    </div>

    <div class="bg-white shadow-md rounded-lg p-6">
        <p>REMI es una revista de Acceso Abierto, semestral, gratuita, revisada por pares evaluadores, que acepta de forma continua manuscritos de carácter multidisciplinario sin costo de publicación para los autores.</p>
        <img src="/remi/creativecommon.png" alt="Descripción de la imagen" class="my-4"/>
        <p>Revista Multidisciplinaria de Investigación por Facultad Multidisciplinaria de Occidente, Universidad de El Salvador se distribuye bajo una Licencia Creative Commons Atribución-NoComercial 4.0 Internacional.</p>
    </div>

  </div>
</template>

<style scoped>
/* Puedes personalizar más el diseño aquí si quieres */
</style>
