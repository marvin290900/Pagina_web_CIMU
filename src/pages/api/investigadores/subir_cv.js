import fs from 'fs';
import path from 'path';

export async function POST({ request }) {
  try {
    const formData = await request.formData();
    const file = formData.get('cv'); // <- asegúrate que el input tenga name="cv"

    if (!file) {
      return new Response(JSON.stringify({ ok: false, error: 'No se envió ningún CV' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const carpeta = formData.get('carpeta')?.toString().trim() || 'cv';

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadsDir = path.join(process.cwd(), 'public', carpeta);

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const timestamp = Date.now();
    const ext = path.extname(file.name) || '.pdf';
    const fileName = `${timestamp}${ext}`;
    const filePath = path.join(uploadsDir, fileName);

    await fs.promises.writeFile(filePath, buffer);

    const publicUrl = `/${carpeta}/${fileName}`;

    return new Response(JSON.stringify({ ok: true, url: publicUrl }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error al guardar el CV:', error);
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
