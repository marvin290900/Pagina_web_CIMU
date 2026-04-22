<template>
  <article
    class="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-full"
  >
    <div class="flex flex-col h-full">
      <!-- Skeleton para la Imagen de Portada -->
      <div class="skeleton w-full h-48 rounded-none"></div>
      
      <div class="p-6 flex flex-col flex-grow">
        <!-- Skeleton para Categoría y Visitas -->
        <div class="flex items-center justify-between mb-4">
          <div class="skeleton h-6 w-20 rounded-full"></div>
          <div class="skeleton h-5 w-12"></div>
        </div>
        
        <!-- Skeleton para Título -->
        <div class="mb-4 min-h-[3.5rem]">
          <div class="skeleton h-6 w-full mb-2"></div>
          <div class="skeleton h-6 w-3/4"></div>
        </div>
        
        <!-- Skeleton para Contenido -->
        <div class="mb-4 min-h-[4.5rem]">
          <div class="skeleton h-4 w-full mb-2"></div>
          <div class="skeleton h-4 w-full mb-2"></div>
          <div class="skeleton h-4 w-2/3"></div>
        </div>
        
        <!-- Skeleton para Footer (Fecha y Autor) -->
        <div class="flex items-center mt-auto gap-2">
          <div class="skeleton h-4 w-24"></div>
          <span class="text-gray-200 mx-1">•</span>
          <div class="skeleton h-4 w-28"></div>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup>
// Componente Skeleton para imitar el diseño de CardPublicacion
</script>
