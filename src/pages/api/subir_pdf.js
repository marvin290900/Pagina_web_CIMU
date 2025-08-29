// src/pages/api/subir_pdf.js
import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

// Ruta absoluta a la carpeta public uploads en tu servidor
const BASE_PATH = "/var/www/cimu/public/uploads";

export async function POST({ request }) {
  try {
    const formData = await request.formData();
    const file = formData.get("pdf");
    const carpeta = (formData.get("carpeta")?.toString().trim() || "investigaciones");

    if (!file) {
      console.error("No se recibió archivo 'pdf' en formData");
      return new Response(JSON.stringify({ ok: false, error: "No se envió ningún PDF" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Nombre original y extensión (fallback por extensión si mime vacío)
    const origName = String(file.name || `upload-${Date.now()}`);
    const ext = path.extname(origName).toLowerCase() || ".pdf";

    const isPdf = (file.type === "application/pdf") || ext === ".pdf";
    if (!isPdf) {
      console.error("Archivo no identificado como PDF. type:", file.type, "ext:", ext);
      return new Response(JSON.stringify({ ok: false, error: "El archivo no parece ser un PDF" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Asegurar carpeta de destino
    const uploadsDir = path.join(BASE_PATH, carpeta);
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Guardar PDF con nombre único
    const timestamp = Date.now();
    const pdfFileName = `${timestamp}${ext || ".pdf"}`;
    const pdfPath = path.join(uploadsDir, pdfFileName);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fsPromises.writeFile(pdfPath, buffer);

    // Intentar generar thumbnail con pdftoppm (Poppler)
    let thumbnailCreated = false;
    let thumbFileName = null;
    try {
      // comprobar que pdftoppm esté disponible
      try {
        await execFileAsync("pdftoppm", ["-v"]);
      } catch (chkErr) {
        console.warn("pdftoppm no encontrado en PATH:", chkErr?.message || chkErr);
        throw new Error("pdftoppm_no_instalado");
      }

      // pdftoppm: salida base sin extensión
      const thumbBase = path.join(uploadsDir, `${timestamp}-thumb`);

      // args: primera página, singlefile, png, escala a ancho ~800
      const args = ["-f", "1", "-singlefile", "-png", "-scale-to", "800", pdfPath, thumbBase];

      // ejecutar pdftoppm
      const { stdout, stderr } = await execFileAsync("pdftoppm", args);

      // pdftoppm puede emitir warnings en stderr; registrarlos pero no fallar si exit code 0
      if (stderr) {
        console.warn("pdftoppm stderr:", String(stderr).trim());
      }

      thumbFileName = `${timestamp}-thumb.png`;
      // comprobar que el archivo fue creado
      const thumbPath = path.join(uploadsDir, thumbFileName);
      if (fs.existsSync(thumbPath)) {
        thumbnailCreated = true;
      } else {
        console.warn("pdftoppm no produjo el thumbnail esperado:", thumbPath);
        thumbnailCreated = false;
      }
    } catch (thumbErr) {
      if (String(thumbErr).includes("pdftoppm_no_instalado")) {
        console.error("pdftoppm no está instalado en el servidor. Instala poppler-utils.");
      } else {
        console.error("Error generando thumbnail con pdftoppm:", thumbErr && thumbErr.message ? thumbErr.message : thumbErr);
      }
      thumbnailCreated = false;
    }

    // Construir rutas públicas (siempre con leading '/')
    const pdfPathPublic = `/uploads/${carpeta}/${pdfFileName}`;
    const thumbPathPublic = thumbnailCreated ? `/uploads/${carpeta}/${thumbFileName}` : null;

    // Determinar origin absoluto desde request (o fallback a cabeceras)
    let origin;
    try {
      origin = new URL(request.url).origin; // normalmente funciona en Astro/Node
    } catch (e) {
      const proto = request.headers.get("x-forwarded-proto") || request.headers.get("x-forwarded-protocol") || "http";
      const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost";
      origin = `${proto}://${host.replace(/\/$/, "")}`;
    }

    const pdfUrl = `${origin}${pdfPathPublic}`;
    const thumbnailUrl = thumbPathPublic ? `${origin}${thumbPathPublic}` : null;

    return new Response(JSON.stringify({ ok: true, pdfUrl, thumbnailUrl }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error al subir PDF (catch general):", error && error.stack ? error.stack : error);
    return new Response(JSON.stringify({ ok: false, error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
