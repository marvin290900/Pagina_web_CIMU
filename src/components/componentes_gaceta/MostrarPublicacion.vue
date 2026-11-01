<template>
  <div class="publication-page">
    <div v-if="cargando" class="article-loading" role="status" aria-label="Cargando publicación" aria-busy="true">
      <div class="skeleton h-4 w-40"></div>
      <div class="skeleton h-12 w-full"></div>
      <div class="skeleton h-12 w-3/4"></div>
      <div class="skeleton h-14 w-64"></div>
      <div class="skeleton aspect-video w-full"></div>
      <span class="sr-only">Cargando publicación…</span>
    </div>

    <div v-else-if="error" class="article-empty">
      <span class="article-eyebrow">Gaceta Multidisciplinaria</span>
      <h1>Esta publicación no está disponible</h1>
      <p>Puedes seguir explorando las noticias y las historias de nuestra comunidad.</p>
      <a href="/gaceta" class="btn article-button">Explorar Gaceta <span aria-hidden="true">↗</span></a>
    </div>

    <article v-else class="publication">
      <header class="article-header">
        <nav aria-label="Ruta de navegación" class="article-breadcrumb">
          <a href="/gaceta">Gaceta</a><span aria-hidden="true">/</span>
          <a :href="sectionUrl" aria-current="location">{{ sectionLabel }}</a>
        </nav>
        <a :href="sectionUrl" class="badge article-category">{{ sectionLabel }}</a>
        <h1>{{ data.titulo }}</h1>
        <div class="article-meta-row">
          <div class="article-byline">
            <component :is="authorUrl ? 'a' : 'div'" :href="authorUrl || undefined" class="article-avatar" :aria-label="authorUrl ? `Ver perfil de ${authorName}` : undefined">
              <img v-if="autor.foto" :src="autor.foto" alt="" />
              <span v-else aria-hidden="true">{{ authorInitials }}</span>
            </component>
            <div>
              <component :is="authorUrl ? 'a' : 'span'" :href="authorUrl || undefined" class="article-author-name">{{ authorName }}</component>
              <div class="article-metadata">
                <time v-if="publicationDate" :datetime="data.fecha_publicacion">{{ publicationDate }}</time>
                <span>{{ readingMinutes }} min de lectura</span>
              </div>
            </div>
          </div>
          <button type="button" class="btn btn-ghost article-share" @click="sharePublication">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 16V3m-4 4 4-4 4 4M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" /></svg>
            Compartir
          </button>
        </div>
        <p class="article-share-status" role="status">{{ shareMessage }}</p>
      </header>

      <figure v-if="data.imagenes.portada.url" class="article-cover">
        <img :src="data.imagenes.portada.url" :alt="data.imagenes.portada.descripcion || data.titulo" fetchpriority="high" />
        <figcaption v-if="data.imagenes.portada.descripcion">{{ data.imagenes.portada.descripcion }}</figcaption>
      </figure>

      <div class="article-reading-layout">
        <aside class="article-rail" aria-label="Información de la publicación">
          <span class="article-eyebrow">En esta edición</span>
          <a :href="sectionUrl">{{ sectionLabel }}</a>
          <div class="article-rail-rule"></div>
          <span class="article-views"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>{{ formattedVisits }}</span>
          <span class="article-rail-caption">visualizaciones</span>
        </aside>
        <div class="article-main">
          <div class="article-body">
            <MdPreview :sanitize="sanitizeHtml" editorId="gaceta-article-preview" :modelValue="data.contenido || ''" />
          </div>

          <section v-if="data.imagenes.galeria.length" class="article-extra" aria-label="Galería de imágenes">
            <Galeria :galeria="data.imagenes.galeria" />
          </section>
          <section v-if="videoUrl" class="article-extra" aria-labelledby="article-video-title">
            <div class="article-section-heading"><span class="article-eyebrow">Para ver</span><h2 id="article-video-title">Una mirada más cercana</h2></div>
            <div class="article-video"><iframe :src="videoUrl" title="Video relacionado con la publicación" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>
          </section>

          <footer class="article-footer">
            <div v-if="tags.length" class="article-tags" aria-label="Temas de la publicación"><span class="article-eyebrow">Temas</span><span v-for="tag in tags" :key="tag" class="badge badge-outline">{{ tag }}</span></div>
            <div class="article-author-card">
              <div><span class="article-eyebrow">Una publicación de</span><h2>{{ authorName }}</h2><p>Historias, ideas y conocimiento de nuestra comunidad universitaria.</p></div>
              <a v-if="authorUrl" :href="authorUrl" class="btn btn-ghost">Ver perfil <span aria-hidden="true">↗</span></a>
            </div>
            <a :href="sectionUrl" class="article-back"><span aria-hidden="true">←</span> Más de {{ sectionLabel }}</a>
          </footer>
        </div>
      </div>
    </article>
  </div>
</template>

<script setup>
import { sanitizeHtml } from "../../lib/security/sanitize.js";
import { NEWS_SECTIONS, dateLabel, videoEmbedUrl } from "../../lib/publicationUi.js";
import { ref, computed, onMounted, onUnmounted } from "vue";
import Galeria from "./components/Galeria.vue";
import { MdPreview } from "md-editor-v3";
import "md-editor-v3/lib/style.css";

const props = defineProps({
  initialPublication: { type: Object, default: null },
  initialAuthor: { type: Object, default: null },
  id: { type: String, required: true },
});
const data = ref({});
const autor = ref({});
const error = ref(false);
const cargando = ref(true);
const shareMessage = ref('');
let shareTimer;
const section = computed(() => [data.value.tipo, data.value.sectionKey, data.value.categoria].find(value => Object.hasOwn(NEWS_SECTIONS, value)));
const sectionLabel = computed(() => NEWS_SECTIONS[section.value] || 'Publicaciones');
const sectionUrl = computed(() => section.value ? `/gaceta/${section.value}` : '/gaceta');
const authorName = computed(() => autor.value.nombre || data.value.autor?.nombre || 'Redacción Gaceta');
const authorUrl = computed(() => data.value.autor?.id ? `/gaceta/perfil/${encodeURIComponent(data.value.autor.id)}` : '');
const authorInitials = computed(() => authorName.value.split(/\s+/).filter(Boolean).slice(0, 2).map(word => word[0]).join('').toUpperCase());
const publicationDate = computed(() => dateLabel(data.value.fecha_publicacion) === '—' ? '' : dateLabel(data.value.fecha_publicacion));
const readingMinutes = computed(() => Math.max(1, Math.ceil((data.value.contenido || '').trim().split(/\s+/).filter(Boolean).length / 200)));
const formattedVisits = computed(() => new Intl.NumberFormat('es-SV', { notation: 'compact', maximumFractionDigits: 1 }).format(Math.max(0, Number(data.value.visitas) || 0)));
const tags = computed(() => [...new Set((Array.isArray(data.value.etiquetas) ? data.value.etiquetas : []).filter(tag => typeof tag === 'string' && tag.trim()))]);
const videoUrl = computed(() => videoEmbedUrl(data.value.link_yt || data.value.imagenes?.link_yt));

async function sharePublication() {
  try {
    if (navigator.share) {
      await navigator.share({ title: data.value.titulo, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      shareMessage.value = 'Enlace copiado. Ya puedes compartir la publicación.';
    }
  } catch (err) {
    if (err.name !== 'AbortError') shareMessage.value = 'Puedes copiar el enlace desde la barra de direcciones para compartirlo.';
  }
  clearTimeout(shareTimer);
  shareTimer = setTimeout(() => { shareMessage.value = ''; }, 6000);
}
async function obtener(id, coleccion) {
  if (!id || !coleccion) return null;
  try {
    const query = new URLSearchParams({ id, coleccion });
    const response = await fetch(`/api/gaceta/actualidad/buscar?${query}`);
    return response.ok ? await response.json() : null;
  } catch { return null; }
}
onMounted(async () => {
  try {
    const params = new URL(window.location.href).searchParams;
    const publication = props.initialPublication || await obtener(props.id, params.get('categoria'));
    if (!publication?._id) { error.value = true; return; }
    data.value = {
      ...publication,
      imagenes: { ...publication.imagenes, portada: { url: '', descripcion: '', ...publication.imagenes?.portada }, galeria: (publication.imagenes?.galeria || []).filter(image => image?.url) },
    };
    autor.value = props.initialAuthor || await obtener(publication.autor?.id, 'autores') || {};
  } catch { error.value = true; }
  finally { cargando.value = false; }
});
onUnmounted(() => clearTimeout(shareTimer));
</script>

<style scoped>
.publication-page { background: #fff; color: #202b36; padding: 36px 24px 88px; }
.publication { max-width: 1160px; margin: auto; }
.article-header { max-width: 880px; margin: 0 auto 28px; }
.article-breadcrumb { display: flex; gap: 12px; align-items: center; color: #727880; font-size: 13px; margin-bottom: 36px; }
.article-breadcrumb a:hover, .article-author-name:hover, .article-rail a:hover { color: #a02636; }
.article-category { background: #f6ecee; color: #912438; border: 0; font-size: 11px; font-weight: 800; letter-spacing: .09em; text-transform: uppercase; padding: 16px 13px; border-radius: 5px; }
h1 { font-family: Georgia, 'Times New Roman', serif; font-size: clamp(2.2rem, 4.2vw, 3.7rem); line-height: 1.12; letter-spacing: -.035em; font-weight: 700; margin: 22px 0 30px; text-wrap: balance; overflow-wrap: anywhere; }
.article-meta-row { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding-bottom: 22px; border-bottom: 1px solid #e8e9ea; }
.article-byline { display: flex; align-items: center; gap: 12px; min-width: 0; }
.article-avatar { display: flex; align-items: center; justify-content: center; width: 46px; height: 46px; border-radius: 50%; background: #f2e7e9; color: #912438; font-size: 14px; font-weight: 800; flex-shrink: 0; overflow: hidden; }
.article-avatar img { width: 100%; height: 100%; object-fit: cover; }
.article-author-name { font-size: 14px; font-weight: 800; overflow-wrap: anywhere; }
.article-metadata { display: flex; flex-wrap: wrap; gap: 4px 14px; font-size: 12px; color: #727880; margin-top: 3px; }
.article-share { font-size: 12px; border-radius: 8px; font-weight: 700; flex-shrink: 0; }
.article-share svg, .article-views svg { width: 19px; height: 19px; }
.article-share-status { font-size: 12px; color: #7d293a; margin-top: 10px; }
.article-share-status:empty { display: none; }
.article-cover { margin: 0 0 46px; }
.article-cover > img { width: 100%; max-height: 650px; object-fit: contain; background: #f6f5f3; border-radius: 12px; }
.article-cover figcaption { color: #737980; font-size: 12px; line-height: 1.6; margin-top: 12px; padding-left: 14px; border-left: 2px solid #dec4c9; }
.article-reading-layout { display: grid; grid-template-columns: 160px minmax(0, 740px); gap: 52px; justify-content: center; }
.article-rail { padding-top: 18px; display: flex; flex-direction: column; align-items: flex-start; gap: 10px; }
.article-eyebrow { font-size: 10px; letter-spacing: .12em; text-transform: uppercase; color: #7a7d82; font-weight: 800; }
.article-rail > a { font-size: 13px; font-weight: 700; }
.article-rail-rule { width: 28px; height: 1px; background: #d6d8da; margin: 12px 0; }
.article-views { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 700; }
.article-rail-caption { color: #7a7d82; font-size: 11px; }
.article-main { min-width: 0; }
.article-body :deep(.md-editor) { --md-bk-color: transparent; --md-color: #39434d; font-family: inherit; background: transparent; }
.article-body :deep(.md-editor-preview-wrapper) { padding: 0; }
.article-body :deep(.md-editor-preview) { font-size: 18px; line-height: 1.95; overflow-wrap: anywhere; }
.article-body :deep(.md-editor-preview > :first-child) { margin-top: 0; }
.article-body :deep(.md-editor-preview p) { margin: 0 0 1.5em; }
.article-body :deep(.md-editor-preview h1), .article-body :deep(.md-editor-preview h2), .article-body :deep(.md-editor-preview h3) { color: #202b36; font-family: Georgia, 'Times New Roman', serif; line-height: 1.3; letter-spacing: -.02em; border: 0; padding: 0; margin: 1.7em 0 .7em; }
.article-body :deep(.md-editor-preview h1) { font-size: 2em; }
.article-body :deep(.md-editor-preview h2) { font-size: 1.65em; }
.article-body :deep(.md-editor-preview h3) { font-size: 1.3em; }
.article-body :deep(.md-editor-preview blockquote) { background: #faf6f6; border-left: 3px solid #a12c40; border-radius: 0 8px 8px 0; padding: 22px 28px; color: #66303b; font-family: Georgia, 'Times New Roman', serif; font-size: 1.2em; }
.article-body :deep(.md-editor-preview blockquote p:last-child) { margin-bottom: 0; }
.article-body :deep(.md-editor-preview a) { color: #9b293c; text-decoration: underline; text-underline-offset: 3px; }
.article-body :deep(.md-editor-preview img) { max-width: 100%; border-radius: 8px; }
.article-body :deep(.md-editor-preview pre), .article-body :deep(.md-editor-preview .md-editor-table) { max-width: 100%; overflow-x: auto; }
.article-extra { margin-top: 48px; }
.article-section-heading { margin-bottom: 20px; }
.article-section-heading h2 { font-family: Georgia, 'Times New Roman', serif; font-size: 27px; font-weight: 700; margin-top: 5px; }
.article-video { aspect-ratio: 16 / 9; border-radius: 12px; overflow: hidden; background: #f3f2f1; }
.article-video iframe { width: 100%; height: 100%; border: 0; }
.article-footer { margin-top: 48px; border-top: 1px solid #e8e9ea; padding-top: 24px; }
.article-tags { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 30px; }
.article-tags .badge { height: auto; padding: 6px 12px; font-size: 11px; border-color: #e4e0e1; color: #64666c; white-space: normal; overflow-wrap: anywhere; }
.article-author-card { background: #f8f7f5; border: 1px solid #eeece8; border-radius: 12px; padding: 26px; display: flex; align-items: center; justify-content: space-between; gap: 20px; }
.article-author-card h2 { font-weight: 800; font-size: 17px; margin: 6px 0; overflow-wrap: anywhere; }
.article-author-card p { font-size: 13px; line-height: 1.7; color: #70757b; max-width: 390px; }
.article-author-card .btn { flex-shrink: 0; font-size: 12px; }
.article-back { display: inline-flex; align-items: center; gap: 12px; margin-top: 30px; font-size: 13px; font-weight: 800; color: #8e2639; }
.article-back:hover { text-decoration: underline; }
.article-loading { max-width: 880px; margin: 40px auto; display: grid; gap: 22px; }
.article-empty { max-width: 650px; padding: 70px 0; margin: auto; }
.article-empty p { color: #727880; line-height: 1.8; margin-bottom: 24px; }
.article-button { background: #8e2639; color: #fff; border: 0; }
a:focus-visible, button:focus-visible { outline: 2px solid #a12c40; outline-offset: 4px; }
@media (max-width: 1000px) { .article-reading-layout { grid-template-columns: minmax(0, 740px); gap: 20px; } .article-rail { flex-direction: row; align-items: center; padding: 0 0 20px; border-bottom: 1px solid #eee; flex-wrap: wrap; gap: 10px; } .article-rail-rule { width: 1px; height: 14px; margin: 0 4px; } }
@media (max-width: 600px) { .publication-page { padding: 24px 20px 56px; } .article-breadcrumb { margin-bottom: 26px; } h1 { margin-top: 18px; } .article-meta-row { align-items: flex-start; flex-direction: column; gap: 14px; } .article-share { min-height: 36px; height: 36px; padding-left: 0; } .article-cover { margin-bottom: 28px; } .article-cover > img { border-radius: 8px; } .article-body :deep(.md-editor-preview) { font-size: 16px; line-height: 1.9; } .article-body :deep(.md-editor-preview blockquote) { padding: 18px; } .article-author-card { align-items: flex-start; flex-direction: column; padding: 22px; gap: 14px; } .article-author-card .btn { padding-left: 0; } }
</style>
