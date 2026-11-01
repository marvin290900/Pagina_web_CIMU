<template>
  <div class="article-gallery">
    <div class="gallery-heading"><div><span>En imágenes</span><h2>Galería de la publicación</h2></div><span class="badge badge-ghost">{{ galeria.length }} {{ galeria.length === 1 ? 'imagen' : 'imágenes' }}</span></div>
    <figure v-if="currentImage" class="gallery-figure">
      <div class="gallery-stage">
        <img :src="currentImage.url" :alt="currentImage.descripcion || `Imagen ${position + 1} de la galería`" loading="lazy" />
        <div v-if="galeria.length > 1" class="gallery-controls">
          <button type="button" class="btn btn-circle btn-sm" aria-label="Imagen anterior" @click="move(-1)">←</button>
          <span aria-hidden="true">{{ position + 1 }} / {{ galeria.length }}</span>
          <button type="button" class="btn btn-circle btn-sm" aria-label="Imagen siguiente" @click="move(1)">→</button>
        </div>
      </div>
      <figcaption aria-live="polite" aria-atomic="true">{{ currentImage.descripcion || `Imagen ${position + 1} de ${galeria.length}` }}</figcaption>
    </figure>
    <div v-if="galeria.length > 1" class="gallery-thumbnails" aria-label="Seleccionar imagen">
      <button v-for="(image, index) in galeria" :key="index" type="button" :class="{ selected: position === index }" :aria-label="`Ver imagen ${index + 1}`" :aria-pressed="position === index" @click="position = index"><img :src="image.url" alt="" loading="lazy" /></button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
const props = defineProps({ galeria: { type: Array, required: true } });
const position = ref(0);
const currentImage = computed(() => props.galeria[position.value]);
const move = direction => { position.value = (position.value + direction + props.galeria.length) % props.galeria.length; };
watch(() => props.galeria, () => { position.value = 0; });
</script>

<style scoped>
.gallery-heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 20px; }
.gallery-heading > div > span { font-size: 10px; letter-spacing: .12em; text-transform: uppercase; color: #7a7d82; font-weight: 800; }
.gallery-heading h2 { font-family: Georgia, 'Times New Roman', serif; font-size: clamp(22px, 3vw, 27px); font-weight: 700; margin-top: 5px; line-height: 1.3; }
.gallery-heading .badge { flex-shrink: 0; font-size: 11px; }
.gallery-stage { position: relative; border-radius: 12px; overflow: hidden; background: #f3f2f0; }
.gallery-stage > img { display: block; width: 100%; height: clamp(220px, 45vw, 440px); object-fit: contain; }
.gallery-controls { position: absolute; bottom: 16px; right: 16px; display: flex; align-items: center; gap: 12px; padding: 6px; background: #fff; box-shadow: 0 2px 12px #0001; border-radius: 40px; }
.gallery-controls > span { font-size: 12px; font-weight: 700; font-variant-numeric: tabular-nums; color: #40444b; }
.gallery-controls .btn { background: #f4f2ef; border: 0; box-shadow: none; color: #313640; }
figcaption { margin-top: 12px; font-size: 12px; line-height: 1.7; color: #737980; overflow-wrap: anywhere; }
.gallery-thumbnails { display: flex; gap: 10px; overflow-x: auto; padding: 5px 3px; margin-top: 16px; }
.gallery-thumbnails button { flex-shrink: 0; width: 72px; height: 54px; border: 2px solid transparent; border-radius: 7px; padding: 3px; opacity: .6; cursor: pointer; }
.gallery-thumbnails button:hover, .gallery-thumbnails button.selected { opacity: 1; }
.gallery-thumbnails button.selected { border-color: #9b293c; }
.gallery-thumbnails img { width: 100%; height: 100%; object-fit: cover; border-radius: 3px; }
button:focus-visible { outline: 2px solid #9b293c; outline-offset: 3px; }
@media (max-width: 480px) { .gallery-heading { align-items: flex-start; } .gallery-controls { bottom: 12px; right: 12px; } }
</style>
