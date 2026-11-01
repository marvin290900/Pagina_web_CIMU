<template>
  <div class="gaceta-home">
    <header class="home-intro">
      <div><span class="home-eyebrow">Gaceta Multidisciplinaria</span><h1>Voces de nuestra comunidad</h1></div>
      <p>Historias, ideas y conocimiento que conectan con la vida universitaria.</p>
    </header>

    <div v-if="loading" class="home-loading" role="status" aria-busy="true">
      <span class="sr-only">Cargando publicaciones…</span>
      <div class="skeleton home-hero-skeleton"></div>
      <div class="home-grid"><div v-for="n in 3" :key="n" class="skeleton h-72"></div></div>
    </div>
    <template v-else>
      <div v-if="failedSections.length || featuredFailed" class="alert home-alert" role="status">
        <span>{{ failedSections.length === sectionEntries.length ? 'No pudimos cargar las publicaciones recientes.' : 'Algunas publicaciones no pudieron cargarse.' }}</span>
        <button type="button" class="btn btn-sm btn-ghost" @click="loadPublications">Reintentar</button>
      </div>

      <article v-if="lead" class="home-lead">
        <div class="home-lead-copy">
          <span class="home-eyebrow home-accent">{{ daily ? 'En portada' : 'Lo más reciente' }}</span>
          <a :href="sectionUrl(lead)" class="home-category">{{ sectionLabel(lead) }}</a>
          <h2><a :href="publicationUrl(lead)">{{ lead.titulo }}</a></h2>
          <p class="home-lead-excerpt">{{ excerpt(lead.contenido, 210) }}</p>
          <div class="home-meta"><span>{{ lead.autor?.nombre || 'Redacción Gaceta' }}</span><span>{{ dateLabel(lead.fecha_publicacion) }}</span></div>
          <a :href="publicationUrl(lead)" class="btn home-read">Leer publicación <span aria-hidden="true">↗</span></a>
        </div>
        <a :href="publicationUrl(lead)" class="home-lead-visual" tabindex="-1" aria-hidden="true">
          <img v-if="cover(lead) && !brokenImages[imageKey(lead)]" :src="cover(lead)" alt="" fetchpriority="high" @error="brokenImages[imageKey(lead)] = true" />
          <div v-else class="home-image-fallback"><span>GM</span><span>Gaceta Multidisciplinaria</span></div>
          <span class="home-image-label">{{ sectionLabel(lead) }}</span>
        </a>
      </article>

      <section v-if="highlights.length" class="home-highlights" aria-labelledby="home-highlights-title">
        <div class="home-section-heading"><div><span class="home-eyebrow">Selección editorial</span><h2 id="home-highlights-title">Publicaciones destacadas</h2></div><span class="home-heading-note">Para detenerse a leer</span></div>
        <div class="home-highlight-grid">
          <article v-for="(publication, index) in visibleHighlights" :key="imageKey(publication)" class="home-highlight">
            <span class="home-highlight-number" aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</span>
            <div><a :href="sectionUrl(publication)" class="home-category">{{ sectionLabel(publication) }}</a><h3><a :href="publicationUrl(publication)">{{ publication.titulo }}</a></h3><time :datetime="publication.fecha_publicacion">{{ dateLabel(publication.fecha_publicacion) }}</time></div>
          </article>
        </div>
        <button v-if="highlights.length > 3" type="button" class="btn btn-ghost home-more-highlights" @click="showAllHighlights = !showAllHighlights" :aria-expanded="showAllHighlights">{{ showAllHighlights ? 'Mostrar menos' : 'Ver todas las destacadas' }} <span aria-hidden="true">{{ showAllHighlights ? '−' : '+' }}</span></button>
      </section>

      <section class="home-recent" aria-labelledby="home-recent-title">
        <div class="home-section-heading"><div><span class="home-eyebrow">El pulso de la universidad</span><h2 id="home-recent-title">Publicaciones recientes</h2><p>Descubre lo que está pasando en nuestra comunidad.</p></div><a v-if="activeSection" :href="`/gaceta/${activeSection}`" class="home-section-link">Ver sección <span aria-hidden="true">↗</span></a></div>
        <div class="home-filters" role="group" aria-label="Filtrar publicaciones por sección">
          <button type="button" class="btn btn-sm" :class="{ 'home-filter-active': !activeSection }" :aria-pressed="!activeSection" @click="selectSection('')">Todas</button>
          <button v-for="[key, label] in sectionEntries" :key="key" type="button" class="btn btn-sm" :class="{ 'home-filter-active': activeSection === key }" :aria-pressed="activeSection === key" @click="selectSection(key)">{{ label }}</button>
        </div>
        <p class="home-result-count" role="status">{{ filteredPublications.length }} {{ filteredPublications.length === 1 ? 'publicación reciente' : 'publicaciones recientes' }}{{ activeSection ? ` en ${NEWS_SECTIONS[activeSection]}` : '' }}</p>
        <div v-if="visibleRecent.length" class="home-grid">
          <article v-for="publication in visibleRecent" :key="imageKey(publication)" class="home-card">
            <a :href="publicationUrl(publication)" class="home-card-visual" tabindex="-1" aria-hidden="true">
              <img v-if="cover(publication) && !brokenImages[imageKey(publication)]" :src="cover(publication)" alt="" loading="lazy" @error="brokenImages[imageKey(publication)] = true" />
              <div v-else class="home-image-fallback"><span>GM</span><span>{{ sectionLabel(publication) }}</span></div>
              <span class="home-card-arrow" aria-hidden="true">↗</span>
            </a>
            <div class="home-card-copy">
              <div class="home-card-meta"><a :href="sectionUrl(publication)" class="home-category">{{ sectionLabel(publication) }}</a><time :datetime="publication.fecha_publicacion">{{ dateLabel(publication.fecha_publicacion) }}</time></div>
              <h3><a :href="publicationUrl(publication)">{{ publication.titulo }}</a></h3>
              <p>{{ excerpt(publication.contenido, 135) }}</p>
              <div class="home-card-author"><span>{{ publication.autor?.nombre || 'Redacción Gaceta' }}</span><span>{{ readingMinutes(publication) }} min de lectura</span></div>
            </div>
          </article>
        </div>
        <div v-else class="home-empty"><h3>{{ activeSection ? 'Pronto habrá más historias por aquí' : 'Nuevas historias están por llegar' }}</h3><p>{{ activeSection && failedSections.includes(activeSection) ? 'No se pudo cargar esta sección. Intenta nuevamente.' : 'Explora las secciones de Gaceta para seguir descubriendo nuestra comunidad.' }}</p><button v-if="activeSection" type="button" class="btn btn-ghost" @click="selectSection('')">Ver todas las publicaciones</button></div>
        <div v-if="visibleRecent.length < filteredPublications.length" class="home-load-more"><button type="button" class="btn btn-outline" @click="recentLimit += 9">Mostrar más publicaciones <span aria-hidden="true">↓</span></button></div>
      </section>

      <nav class="home-explore" aria-label="Explorar secciones de Gaceta"><div><span class="home-eyebrow">Sigue explorando</span><h2>Una comunidad, muchas miradas.</h2></div><div class="home-explore-links"><a v-for="[key, label] in sectionEntries" :key="key" :href="`/gaceta/${key}`">{{ label }} <span aria-hidden="true">↗</span></a></div></nav>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { NEWS_SECTIONS, dateLabel } from '../../../lib/publicationUi.js';
const sectionEntries = Object.entries(NEWS_SECTIONS);
const loading = ref(true);
const daily = ref(null);
const featured = ref([]);
const recent = ref([]);
const activeSection = ref('');
const recentLimit = ref(9);
const failedSections = ref([]);
const featuredFailed = ref(false);
const showAllHighlights = ref(false);
const brokenImages = ref({});
const sectionKey = publication => publication.sectionKey || publication.tipo;
const sectionLabel = publication => NEWS_SECTIONS[sectionKey(publication)] || 'Gaceta';
const sectionUrl = publication => Object.hasOwn(NEWS_SECTIONS, sectionKey(publication)) ? `/gaceta/${sectionKey(publication)}` : '/gaceta';
const publicationUrl = publication => `/gaceta/${encodeURIComponent(publication._id)}?categoria=${encodeURIComponent(sectionKey(publication))}`;
const imageKey = publication => `${sectionKey(publication)}:${publication._id}`;
const cover = publication => publication.imagenes?.portada?.url || '';
const lead = computed(() => daily.value || recent.value[0]);
const highlights = computed(() => featured.value.filter(publication => !lead.value || imageKey(publication) !== imageKey(lead.value)));
const visibleHighlights = computed(() => showAllHighlights.value ? highlights.value : highlights.value.slice(0, 3));
const filteredPublications = computed(() => activeSection.value ? recent.value.filter(publication => sectionKey(publication) === activeSection.value) : recent.value);
const visibleRecent = computed(() => filteredPublications.value.slice(0, recentLimit.value));
function selectSection(section) { activeSection.value = section; recentLimit.value = 9; }
function excerpt(content, limit) {
  const text = String(content || '').replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/<[^>]*>/g, '').replace(/[#*_`>~|]/g, '').replace(/\s+/g, ' ').trim();
  if (text.length <= limit) return text;
  return text.slice(0, limit).replace(/\s+\S*$/, '') + '…';
}
const readingMinutes = publication => Math.max(1, Math.ceil(String(publication.contenido || '').trim().split(/\s+/).filter(Boolean).length / 200));
async function getPublications(url, optional = false) {
  const response = await fetch(url);
  if (optional && response.status === 404) return [];
  if (!response.ok) throw new Error('No se pudieron cargar las publicaciones');
  return response.json();
}
async function loadPublications() {
  loading.value = true;
  const results = await Promise.allSettled([
    getPublications('/api/gaceta/obtener_destacados?id=publicacion_del_dia', true),
    getPublications('/api/gaceta/obtener_destacados?id=publicacion_destacadas', true),
    ...sectionEntries.map(([section]) => getPublications(`/api/gaceta/obtener_recientes?categoria=${section}`)),
  ]);
  daily.value = results[0].status === 'fulfilled' ? results[0].value[0] || null : null;
  featured.value = results[1].status === 'fulfilled' && Array.isArray(results[1].value) ? results[1].value : [];
  // An unconfigured editorial selection (404) should not hide recent publications.
  featuredFailed.value = results.slice(0, 2).some(result => result.status === 'rejected');
  failedSections.value = [];
  const publications = [];
  results.slice(2).forEach((result, index) => {
    const section = sectionEntries[index][0];
    if (result.status === 'rejected') { failedSections.value.push(section); return; }
    publications.push(...(result.value.rows || []).map(({ doc }) => ({ ...doc, sectionKey: section })));
  });
  recent.value = publications.sort((a, b) => (b.fecha_publicacion || '').localeCompare(a.fecha_publicacion || '') || String(a._id).localeCompare(String(b._id)));
  loading.value = false;
}
onMounted(loadPublications);
</script>

<style scoped>
.gaceta-home { max-width: 1208px; padding: 38px 24px 72px; margin: auto; color: #202b36; }
.home-intro { display: flex; justify-content: space-between; align-items: flex-end; gap: 28px; margin-bottom: 28px; padding-bottom: 26px; border-bottom: 1px solid #e7e5e4; }
.home-eyebrow { color: #787c81; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: .13em; }
.home-intro h1 { font-family: Georgia, 'Times New Roman', serif; font-size: clamp(26px, 3vw, 37px); font-weight: 700; line-height: 1.2; letter-spacing: -.03em; margin-top: 9px; }
.home-intro > p { max-width: 290px; font-size: 13px; line-height: 1.8; color: #72777c; }
.home-lead { display: grid; grid-template-columns: 1fr 1.05fr; background: #f8f6f3; border: 1px solid #eeebe6; border-radius: 16px; overflow: hidden; }
.home-lead-copy { padding: 38px; display: flex; flex-direction: column; align-items: flex-start; }
.home-accent { color: #90273b; margin-bottom: 25px; display: flex; align-items: center; gap: 8px; }
.home-accent::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: #a12c40; }
.home-category { font-size: 10px; font-weight: 800; letter-spacing: .075em; text-transform: uppercase; color: #943047; }
.home-lead h2 { font-family: Georgia, 'Times New Roman', serif; font-weight: 700; font-size: clamp(26px, 2.8vw, 39px); line-height: 1.16; letter-spacing: -.03em; margin: 12px 0 18px; text-wrap: balance; overflow-wrap: anywhere; }
.home-lead h2 a:hover, .home-highlight h3 a:hover, .home-card h3 a:hover { color: #90273b; }
.home-lead-excerpt { color: #687078; font-size: 14px; line-height: 1.8; margin-bottom: 24px; }
.home-meta { display: flex; flex-wrap: wrap; gap: 5px 16px; color: #72777c; font-size: 11px; margin-top: auto; }
.home-meta > span:first-child { font-weight: 800; color: #48515b; }
.home-read { background: #8e2639; color: #fff; border: 0; box-shadow: none; font-size: 12px; margin-top: 24px; border-radius: 7px; gap: 24px; }
.home-read:hover { background: #722032; }
.home-lead-visual { position: relative; display: block; min-height: 410px; overflow: hidden; background: #eeeae5; }
.home-lead-visual > img { width: 100%; height: 100%; position: absolute; inset: 0; object-fit: cover; }
.home-image-label { position: absolute; right: 20px; bottom: 20px; background: #fff; color: #4a3a3f; padding: 8px 13px; font-size: 10px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; border-radius: 5px; }
.home-image-fallback { height: 100%; min-height: inherit; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 12px; background: linear-gradient(135deg, #ede1df, #f6efea); color: #8e3344; }
.home-image-fallback > span:first-child { font-family: Georgia, 'Times New Roman', serif; font-weight: 700; font-size: 64px; letter-spacing: -.07em; border-bottom: 1px solid #cfb2b9; padding: 0 18px 12px; }
.home-image-fallback > span:last-child { font-size: 9px; text-transform: uppercase; font-weight: 800; letter-spacing: .15em; }
.home-section-heading { display: flex; justify-content: space-between; align-items: center; gap: 20px; margin-bottom: 24px; }
.home-section-heading h2 { font-family: Georgia, 'Times New Roman', serif; font-weight: 700; font-size: clamp(26px, 3vw, 32px); letter-spacing: -.025em; line-height: 1.25; margin-top: 6px; }
.home-section-heading p { color: #72777c; font-size: 13px; line-height: 1.8; margin-top: 10px; }
.home-heading-note { font-size: 11px; color: #85858a; }
.home-highlights { margin-top: 40px; padding-bottom: 32px; border-bottom: 1px solid #e7e5e4; }
.home-highlight-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 28px; }
.home-highlight { display: flex; align-items: flex-start; gap: 15px; min-width: 0; }
.home-highlight-number { color: #dac3c9; font-family: Georgia, 'Times New Roman', serif; font-size: 36px; line-height: 1.2; }
.home-highlight h3 { font-family: Georgia, 'Times New Roman', serif; font-size: 19px; font-weight: 700; line-height: 1.4; margin: 7px 0 12px; overflow-wrap: anywhere; }
.home-highlight time { color: #80848a; font-size: 11px; }
.home-more-highlights { display: flex; margin: 24px auto 0; font-size: 12px; }
.home-recent { margin-top: 48px; }
.home-section-link { font-size: 12px; color: #8e2639; font-weight: 800; display: flex; gap: 12px; align-items: center; flex-shrink: 0; }
.home-filters { display: flex; flex-wrap: wrap; gap: 8px; }
.home-filters .btn { background: #f7f6f4; border: 1px solid transparent; box-shadow: none; color: #6e737a; font-size: 11px; padding: 0 16px; border-radius: 30px; font-weight: 700; }
.home-filters .btn:hover { border-color: #dcc9ce; }
.home-filters .home-filter-active { background: #8e2639; color: #fff; }
.home-result-count { color: #7b8087; font-size: 11px; margin: 18px 0 22px; }
.home-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 32px 26px; }
.home-card { min-width: 0; border-bottom: 1px solid #e7e5e4; padding-bottom: 22px; display: flex; flex-direction: column; }
.home-card-visual { display: block; position: relative; aspect-ratio: 16/10; overflow: hidden; border-radius: 10px; background: #f3efeb; }
.home-card-visual > img { width: 100%; height: 100%; object-fit: cover; transition: transform .3s ease; }
.home-card:hover .home-card-visual > img { transform: scale(1.035); }
.home-card-arrow { position: absolute; bottom: 12px; right: 12px; display: grid; place-items: center; width: 30px; height: 30px; background: #fff; color: #8e2639; border-radius: 50%; font-size: 17px; }
.home-card-copy { padding-top: 18px; display: flex; flex-direction: column; flex: 1; }
.home-card-meta { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 8px; }
.home-card-meta time { color: #80848a; font-size: 10px; }
.home-card h3 { font-family: Georgia, 'Times New Roman', serif; font-size: 23px; font-weight: 700; line-height: 1.3; letter-spacing: -.015em; margin: 12px 0; overflow-wrap: anywhere; }
.home-card-copy > p { color: #72777c; font-size: 13px; line-height: 1.8; margin-bottom: 20px; overflow-wrap: anywhere; }
.home-card-author { display: flex; flex-wrap: wrap; gap: 5px 10px; justify-content: space-between; font-size: 10px; color: #86898d; margin-top: auto; }
.home-card-author > span:first-child { color: #555e67; font-weight: 800; }
.home-load-more { display: flex; justify-content: center; margin-top: 32px; }
.home-load-more .btn { border-color: #d9cbd0; color: #8e2639; border-radius: 8px; font-size: 12px; box-shadow: none; }
.home-empty { border: 1px dashed #e0d5d8; background: #faf8f6; border-radius: 12px; padding: 40px 24px; text-align: center; }
.home-empty h3 { font-family: Georgia, 'Times New Roman', serif; font-weight: 700; font-size: 23px; }
.home-empty p { color: #757a81; font-size: 13px; line-height: 1.8; margin: 10px 0; }
.home-explore { margin-top: 56px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; background: #f8f6f3; border: 1px solid #eeebe6; border-radius: 12px; padding: 32px; align-items: center; }
.home-explore h2 { font-family: Georgia, 'Times New Roman', serif; font-size: 27px; line-height: 1.3; letter-spacing: -.02em; font-weight: 700; margin-top: 10px; }
.home-explore-links { display: flex; flex-wrap: wrap; gap: 10px 20px; }
.home-explore-links a { font-size: 12px; color: #6b4d56; display: flex; align-items: center; gap: 12px; padding: 5px 0; }
.home-explore-links a:hover, .home-section-link:hover { text-decoration: underline; text-underline-offset: 4px; }
.home-loading { display: grid; gap: 40px; }
.home-hero-skeleton { height: 470px; border-radius: 16px; }
.home-alert { background: #faf4ef; border: 1px solid #eddfd0; box-shadow: none; margin-bottom: 24px; font-size: 13px; display: flex; justify-content: space-between; gap: 16px; }
a:focus-visible, button:focus-visible { outline: 2px solid #a12c40; outline-offset: 4px; }
@media (max-width: 950px) { .home-lead-copy { padding: 28px; } .home-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .home-highlight-grid { gap: 22px; } .home-highlight { gap: 10px; } .home-highlight-number { font-size: 28px; } .home-highlight h3 { font-size: 17px; } }
@media (max-width: 700px) { .home-intro { align-items: flex-start; flex-direction: column; gap: 12px; } .home-intro > p { max-width: 100%; } .home-lead { grid-template-columns: 1fr; } .home-lead-visual { min-height: 0; aspect-ratio: 16/10; grid-row: 1; } .home-lead-copy { padding: 26px; } .home-lead h2 { font-size: 31px; } .home-accent { margin-bottom: 18px; } .home-highlight-grid { grid-template-columns: 1fr; gap: 0; } .home-highlight { padding: 20px 0; gap: 18px; border-bottom: 1px solid #ece7e6; } .home-highlight:first-child { padding-top: 0; } .home-highlight:last-child { border-bottom: 0; padding-bottom: 0; } .home-highlight-number { font-size: 34px; } .home-highlight h3 { font-size: 20px; } .home-heading-note { display: none; } .home-explore { grid-template-columns: 1fr; gap: 24px; } }
@media (max-width: 480px) { .gaceta-home { padding: 26px 20px 48px; } .home-grid { grid-template-columns: 1fr; gap: 30px; } .home-section-heading { align-items: flex-start; flex-wrap: wrap; gap: 12px; } .home-card h3 { font-size: 24px; } .home-filters .btn { padding: 0 13px; } .home-explore { padding: 26px; } .home-lead h2 { font-size: 29px; } .home-alert { align-items: flex-start; flex-direction: column; } }
@media (prefers-reduced-motion: reduce) { .home-card-visual > img { transition: none; } }
</style>
