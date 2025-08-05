import fs from 'fs';
import path from 'path';

const BASE_PATH = '/var/www/cimu'; // Cambia esto a la ruta absoluta de tu carpeta public

export async function POST({ request }) {
  try {
    // Obtenemos los datos del formulario (la imagen)
    const formData = await request.formData();

    // El input file debe llamarse "foto" (debe coincidir con el name del input)
    const file = formData.get('foto');

    if (!file) {
      return new Response(JSON.stringify({ ok: false, error: 'No se envió ninguna imagen' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Obtener el nombre de la carpeta (por ejemplo: 'investigadores', 'libros', etc.)
    // Si no viene, usar 'uploads' por defecto
    const carpeta = formData.get('carpeta')?.toString().trim() || 'uploads';
    console.log('Carpeta recibida:', carpeta);

    // Convertimos la imagen a un buffer para guardarla
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Ruta donde guardaremos las imágenes (carpeta public/uploads)
    const uploadsDir = path.join(BASE_PATH, carpeta);

    // Crear la carpeta si no existe
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Crear un nombre único para la imagen para evitar sobreescrituras
    const timestamp = Date.now();
    // Extraemos extensión original del archivo o usamos .bin si no tiene
    const ext = path.extname(file.name) || '.bin';
    const fileName = `${timestamp}${ext}`;

    // Ruta final del archivo
    const filePath = path.join(uploadsDir, fileName);

    // Guardar el archivo
    await fs.promises.writeFile(filePath, buffer);

    // URL pública para acceder desde el frontend
    const publicUrl = `/${carpeta}/${fileName}`;

    // Devolvemos el resultado con el link
    return new Response(JSON.stringify({ ok: true, url: publicUrl }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error al guardar la imagen:', error);
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
