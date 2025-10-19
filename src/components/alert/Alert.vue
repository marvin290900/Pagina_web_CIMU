<template>
  <Transition name="slide-fade">
    <div v-if="visible" class="fixed top-4 right-4 z-50 max-w-md shadow-lg">
      <div role="alert" :class="`alert alert-${props.type}`">
        <span
          v-if="props.type === 'success'"
          class="mdi mdi-check-circle-outline text-2xl text-white"
        ></span>
        <span
          v-if="props.type === 'warning'"
          class="mdi mdi-alert-outline text-2xl text-white"
        ></span>
        <span
          v-if="props.type === 'error'"
          class="mdi mdi-close-circle-outline text-2xl text-white"
        ></span>
        <span class="text-white">{{ props.mensaje }}</span>
        <button @click="cerrar" class="btn btn-sm btn-ghost btn-circle">
          ✕
        </button>
      </div>

      <!-- Barra de progreso -->
      <div
        v-if="props.duracion && props.duracion > 0"
        class="w-full h-1 bg-base-300 rounded-b overflow-hidden"
      >
        <div
          class="h-full bg-base-content opacity-30 transition-all ease-linear"
          :style="{
            width: `${progreso}%`,
            transitionDuration: `${props.duracion}ms`,
          }"
        ></div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const props = defineProps({
  type: {
    type: String,
    default: "success", // success, warning, error
  },
  mensaje: {
    type: String,
    required: true,
  },
  duracion: {
    type: Number,
    default: 5000, // 3 segundos por defecto
  },
  autoCerrar: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["cerrar"]);

const visible = ref(false);
const progreso = ref(100);
let timer = null;

const cerrar = () => {
  visible.value = false;
  setTimeout(() => {
    emit("cerrar");
  }, 300); // Esperar a que termine la animación
};

onMounted(() => {
  // Mostrar la alerta con un pequeño delay para la animación
  setTimeout(() => {
    visible.value = true;
  }, 10);

  // Auto-cerrar si está habilitado
  if (props.autoCerrar && props.duracion > 0) {
    // Iniciar barra de progreso
    setTimeout(() => {
      progreso.value = 0;
    }, 50);

    // Timer para cerrar
    timer = setTimeout(() => {
      cerrar();
    }, props.duracion);
  }
});

onUnmounted(() => {
  if (timer) {
    clearTimeout(timer);
  }
});
</script>

<style scoped>
/* Animación de entrada/salida */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s ease-in;
}

.slide-fade-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* Opcional: Animación de rebote */
.slide-fade-enter-active {
  animation: bounce-in 0.5s;
}

@keyframes bounce-in {
  0% {
    transform: translateX(100%);
    opacity: 0;
  }
  50% {
    transform: translateX(-10px);
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
