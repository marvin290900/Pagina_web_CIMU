import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const fixtureDir = fileURLToPath(new URL('./fixtures/', import.meta.url));
const image = '/uploads/demo/cimu-demo-cover.svg';
const pdf = '/uploads/demo/cimu-demo.pdf';
export function demoDocuments(adminId, at) {
  const control = { createdBy: adminId, updatedBy: adminId, createdAt: at, updatedAt: at, assignedTo: [], demo: true };
  const docs = [
    ['cimu-gaceta-autores', { _id: 'demo-autor', nombre: 'Redacción de demostración', correo: 'autor@example.test', biografia: 'Perfil ficticio para explorar Gaceta. No es una cuenta de acceso.', foto: '', estado: 'activo', redes_sociales: {}, demo: true }],
    ['investigadores', { _id: 'demo-investigador', type: 'investigador', nombre: 'Investigadora de demostración', correo: 'investigadora@example.test', categoria: 'Investigador_Externo', foto: image, biografia: 'Perfil ficticio para probar las relaciones del catálogo.', demo: true }],
    ['carrousel_imagenes', { _id: 'demo-carrusel', type: 'imagen', categoria: 'carrousel', creado_en: at, foto: image, demo: true }],
  ];
  const entries = [
    ['actualidad', 'La investigación conecta ideas y comunidad', 'publicado'],
    ['vida_universitaria', 'Un espacio para aprender en comunidad', 'publicado'],
    ['opinion', 'El valor de compartir conocimiento', 'borrador'],
    ['memoria', 'Historias que construyen nuestra identidad', 'aprobado'],
    ['audiovisuales', 'Una mirada a la vida universitaria', 'en_revision'],
  ];
  for (const [section, title, state] of entries) docs.push([`cimu-gaceta-${section}`, {
    ...control, _id: `demo-noticia-${section}`, tipo: section, titulo: `[DEMO] ${title}`, categoria: 'Demostración',
    contenido: 'Esta publicación contiene **datos ficticios** para conocer el sistema.\n\n## Un espacio para crear\n\nExplora las secciones, consulta los registros y revisa las acciones disponibles según el estado editorial.\n\n> El contenido de demostración puede editarse o archivarse desde el panel.\n\nSustituye estos ejemplos por contenido propio antes de utilizar el sitio públicamente.',
    fecha_publicacion: at, autor: { id: 'demo-autor', nombre: 'Redacción de demostración' },
    imagenes: { portada: { url: image, descripcion: 'Portada de demostración de CIMU' }, galeria: [] }, etiquetas: ['Demostración', 'Comunidad'], visitas: 0,
    editorialStatus: state, estado: state === 'publicado' ? 'activo' : 'inactivo', editorialHistory: [],
  }]);
  for (const state of ['publicado', 'borrador']) docs.push(['cimu-libros', {
    ...control, _id: `demo-libro-${state}`, titulo: `[DEMO] Ideas para compartir${state === 'borrador' ? ' — borrador' : ''}`, tipo: 'Libro', fecha_publicacion: at.slice(0, 10), editorial: 'Otra Editorial', coleccion: 'Demostración', paginas: 1, isbn: '', uri: '', resumen: 'Libro ficticio para explorar el catálogo y su flujo editorial.', portada: image, pdf_url: pdf, pdf_thumbnail: '', palabras_clave: ['Demostración'], autores: [{ id: 'demo-investigador', nombre: 'Investigadora de demostración' }], editorialStatus: state, editorialHistory: [], metadata: { uploadDate: at, lastChange: at }, vistas: 0, descargas: 0,
  }]);
  docs.push(['investigaciones', {
    ...control, _id: 'demo-investigacion', titulo: '[DEMO] Aprendizaje y comunidad universitaria', resumen: 'Investigación ficticia para conocer el módulo.', descripcion: 'Este registro no representa una investigación real. Permite consultar el perfil, el documento de ejemplo y las acciones editoriales.', programa: 'estudios-sociologicos', investigadores: [{ id: 'demo-investigador', nombre: 'Investigadora de demostración' }], fecha_publicacion: at.slice(0, 10), uri: '', palabras_clave: ['Demostración'], imagenURL: image, pdfURL: pdf, editorialStatus: 'publicado', editorialHistory: [], metadata: { uploadDate: at, lastChange: at },
  }]);
  return docs;
}
export function initialConfiguration(seedDemo = false) {
  return [
    ['cimu-libros', { _id: 'colecciones', colecciones: seedDemo ? ['Demostración'] : [] }],
    ['cimu-gaceta', { _id: 'publicacion_del_dia', publicaciones: seedDemo ? [{ id: 'demo-noticia-actualidad', coleccion: 'actualidad' }] : [] }],
    ['cimu-gaceta', { _id: 'publicacion_destacadas', publicaciones: seedDemo ? [{ id: 'demo-noticia-actualidad', coleccion: 'actualidad' }, { id: 'demo-noticia-vida_universitaria', coleccion: 'vida_universitaria' }] : [] }],
  ];
}
// A small, valid PDF fixture. Offsets are computed in bytes for the xref table.
export function demoPdf() {
  const content = 'BT /F1 22 Tf 60 750 Td (CIMU - Documento de demostracion) Tj /F1 12 Tf 0 -45 Td (Datos ficticios. Sin valor editorial.) Tj 0 -25 Td (Reemplaza este archivo por un documento propio.) Tj ET';
  const objects = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>', '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>', `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`];
  let output = '%PDF-1.4\n'; const offsets = [0];
  objects.forEach((object, index) => { offsets.push(Buffer.byteLength(output)); output += `${index + 1} 0 obj\n${object}\nendobj\n`; });
  const xref = Buffer.byteLength(output);
  output += `xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map(offset => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(output);
}
export async function writeDemoFiles(publicDir = path.resolve('public')) {
  const directory = path.join(publicDir, 'uploads/demo');
  await fs.mkdir(directory, { recursive: true });
  const files = [['cimu-demo-cover.svg', await fs.readFile(path.join(fixtureDir, 'demo-cover.svg'))], ['cimu-demo.pdf', demoPdf()]];
  for (const [name, buffer] of files) {
    try { await fs.writeFile(path.join(directory, name), buffer, { flag: 'wx', mode: 0o644 }); }
    catch (error) { if (error.code !== 'EEXIST') throw error; }
  }
}
