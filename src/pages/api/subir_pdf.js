import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import { writeFileSync } from "fs";
import pdfThumbnail from "pdf-thumbnail"; // npm i pdf-thumbnail

export const POST = async ({ request }) => {
  const formData = await request.formData();
  const pdfFile = formData.get("pdf");

  if (!pdfFile) {
    return new Response(JSON.stringify({ error: "No PDF uploaded" }), { status: 400 });
  }

  // Guardar temporalmente el PDF
  const arrayBuffer = await pdfFile.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const pdfPath = path.join("uploads", pdfFile.name);
  fs.writeFileSync(pdfPath, buffer);

  // Generar thumbnail
  const thumbPath = path.join("uploads", pdfFile.name.replace(".pdf", ".png"));
  const thumbStream = await pdfThumbnail(buffer, { compress: { type: "JPEG", quality: 90 } });
  const out = fs.createWriteStream(thumbPath);
  thumbStream.pipe(out);

  return new Response(
    JSON.stringify({
      success: true,
      pdf: pdfPath,
      thumbnail: thumbPath,
    }),
    { status: 200 }
  );
};
