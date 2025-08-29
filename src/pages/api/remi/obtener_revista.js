import { JSDOM } from 'jsdom';

export async function GET() {
    try {
        
        const response = await fetch('https://revistas.ues.edu.sv/index.php/remi/issue/view/420', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const html = await response.text();
        const dom = new JSDOM(html);
        const document = dom.window.document;

        // Extraer datos de la página
        // Numero
        const titulo = document.querySelector('h1')?.textContent?.trim() || '';
        const publicado = document.querySelector('.published .value')?.textContent?.trim() || '';
        const urlPDF = document.querySelector('a.obj_galley_link.pdf')?.href || '';
        // Editorial
        const editorialTitulo = document.querySelector('.cmp_article_list.articles .obj_article_summary .title')?.textContent?.trim() || '';
        const editorialAutor = document.querySelector('.cmp_article_list.articles .obj_article_summary .authors')?.textContent?.trim() || '';
        const editorialPaginas = document.querySelector('.cmp_article_list.articles .obj_article_summary .pages')?.textContent?.trim() || '';
        const editorialPDF = document.querySelector('.cmp_article_list.articles .obj_article_summary .obj_galley_link.pdf')?.href || '';
        // Articulos Originales
        const articulos = Array.from(document.querySelectorAll('ul.cmp_article_list.articles li')).map(li => {
    const titulo = li.querySelector('.obj_article_summary h3.title')?.textContent?.trim() || '';
    const autor = li.querySelector('.authors')?.textContent?.trim() || '';
    const paginas = li.querySelector('.pages')?.textContent?.trim() || '';
    const article = li.querySelector('h3.title a')?.href || '';
    const enlace = li.querySelector('.obj_galley_link.pdf')?.href || '';
    return { titulo, autor, paginas, article, enlace };
  })
  
  const articulosOriginales = articulos.filter(articulo => articulo.titulo && articulo.titulo.includes("Artículo Original")); // solo los que tengan título y autor
  const articulosRevision = articulos.filter(articulo => articulo.titulo && articulo.titulo.includes("Artículos de revisión")); // solo los que tengan título y autor
        return new Response(JSON.stringify({
            success: true,
            data: {
                titulo,
                publicado,
                urlPDF,
                editorialTitulo,
                editorialAutor,
                editorialPaginas,
                editorialPDF,
                articulosOriginales,
                articulosRevision
            }
        }), {
            status: 200
        });

    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}