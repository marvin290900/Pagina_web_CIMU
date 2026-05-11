import fs from "fs";
import path from "path";

const BASE_PATH = path.join(process.cwd(), "public/uploads");

export async function POST({ request }) {
  try {
    const formData = await request.formData();
    const file = formData.get("foto");

    // 1. Sanitizar el nombre de la carpeta para evitar Path Traversal
    const carpetaRaw = formData.get("carpeta")?.toString().trim() || "uploads";
    const carpeta = path.basename(carpetaRaw);

    if (!file) {
      return new Response(
        JSON.stringify({ ok: false, error: "No se envió ninguna imagen" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 2. Limitar tamaño del archivo (10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return new Response(
        JSON.stringify({ ok: false, error: "La imagen es demasiado grande (máx 10MB)" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 3. Validar tipo y extensión
    const ext = path.extname(file.name || "").toLowerCase();
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
    const isImage = file.type.startsWith("image/") && allowedExtensions.includes(ext);

    if (!isImage) {
      return new Response(
        JSON.stringify({ ok: false, error: "Archivo no permitido. Debe ser una imagen válida." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 4. Preparar guardado
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const uploadsDir = path.join(BASE_PATH, carpeta);

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const timestamp = Date.now();
    const fileName = `${timestamp}${ext || ".bin"}`;
    const filePath = path.join(uploadsDir, fileName);

    // 5. Guardar archivo
    await fs.promises.writeFile(filePath, buffer);

    // URL pública
    const publicUrl = `/uploads/${carpeta}/${fileName}`;

    return new Response(JSON.stringify({ ok: true, url: publicUrl }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error al guardar la imagen:", error);
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
