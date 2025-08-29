import fs from "fs"
import path from "path"

const BASE_PATH = "/var/www/cimu/public/uploads"

export async function POST({ request }) {
  try {
    const formData = await request.formData()

    // Ahora permitimos que el input se llame "pdf"
    const file = formData.get("pdf")
    if (!file) {
      return new Response(
        JSON.stringify({ ok: false, error: "No se envió ningún PDF" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // Puedes pasar "carpeta" opcional, default = "investigaciones"
    const carpeta = formData.get("carpeta")?.toString().trim() || "investigaciones"

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const uploadsDir = path.join(BASE_PATH, carpeta)
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    const timestamp = Date.now()
    const ext = path.extname(file.name) || ".pdf"
    const fileName = `${timestamp}${ext}`
    const filePath = path.join(uploadsDir, fileName)

    await fs.promises.writeFile(filePath, buffer)

    const publicUrl = `/uploads/${carpeta}/${fileName}`

    return new Response(JSON.stringify({ ok: true, url: publicUrl }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })
  } catch (error) {
    console.error("Error al guardar el PDF:", error)
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
}
