// src/pages/api/subir_pdf.js
import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

// Ajusta la ruta base a tu servidor
const BASE_PATH = "/var/www/cimu/public/uploads";

export async function POST({ request }) {
  try {
    const formData = await request.formData();
    const file = formData.get("pdf");
    const carpeta = (formData.get("carpeta")?.toString().trim() || "investigaciones");

    if (!file) {
      console.error("No file in formData");
      return new Response(JSON.stringify({ ok: false, error: "No se envió ningún PDF" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    // Nombre original
    const origName = String(file.name || `upload-${Date.now()}`);
    const ext = path.extname(origName).toLowerCase();

    // Determinar si es pdf: permitir cuando mime es application/pdf o extensión .pdf
    const isPdf = (file.type === "application/pdf") || ext === ".pdf";
    if (!isPdf) {
      console.error("Archivo no identificado como PDF. type:", file.type, "name ext:", ext);
      return new Response(JSON.stringify({ ok: false, error: "El archivo no parece ser un PDF" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    // Preparar rutas
    const uploadsDir = path.join(BASE_PATH, carpeta);
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Usar timestamp para nombres
    const timestamp = Date.now();
    const pdfFileName = `${timestamp}${ext || ".pdf"}`;
    const pdfPath = path.join(uploadsDir, pdfFileName);

    // Guardar PDF en disco
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fsPromises.writeFile(pdfPath, buffer);

    // Intentar generar thumbnail con pdftoppm (poppler-utils)
    let thumbnailUrl = null;
    try {
      // comprobar pdftoppm disponible (opcional, rápido)
      try {
        await execFileAsync("pdftoppm", ["-v"]);
      } catch (chkErr) {
        // pdftoppm no está disponible
        console.warn("pdftoppm no está disponible en PATH del sistema:", chkErr?.message || chkErr);
        throw new Error("pdftoppm_no_instalado");
      }

      // salida base (pdftoppm añadirá .png)
      const thumbBase = path.join(uploadsDir, `${timestamp}-thumb`);
      // Generar PNG de la primera página, scaled width ~800px
      // Si quieres otro tamaño cambia -scale-to
      const args = ["-f", "1", "-singlefile", "-png", "-scale-to", "800", pdfPath, thumbBase];

      // Ejecutar y captar stdout/stderr
      const { stdout, stderr } = await execFileAsync("pdftoppm", args);
      if (stderr) {
        // pdftoppm puede escribir warnings en stderr aunque salga 0
        console.warn("pdftoppm stderr:", stderr.toString());
      }
      const origin = new URL(request.url).origin; 
      const thumbFileName = `${timestamp}-thumb.png`;
      thumbnailUrl = `${origin}/uploads/${carpeta}/${thumbFileName}`;
    } catch (thumbErr) {
      // Si falla la generación (pdftoppm no instalado o fallo) lo registramos y seguimos
      if (String(thumbErr).includes("pdftoppm_no_instalado")) {
        console.error("Thumbnail: pdftoppm no instalado. Instala poppler-utils en el servidor.");
      } else {
        console.error("Error generando thumbnail con pdftoppm:", thumbErr?.message || thumbErr);
      }
      thumbnailUrl = null;
    }

    
    const pdfUrl = `${origin}/uploads/${carpeta}/${pdfFileName}`;

    return new Response(JSON.stringify({ ok: true, pdfUrl, thumbnailUrl }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    // registrar stack completo
    console.error("Error al subir PDF (catch general):", error && error.stack ? error.stack : error);
    return new Response(JSON.stringify({ ok: false, error: String(error) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
