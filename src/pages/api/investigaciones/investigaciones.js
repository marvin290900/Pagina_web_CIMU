  import { z } from "zod";
  import { couch } from "../../../lib/couchDB.js";

  const DateOnly = z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato esperado: YYYY-MM-DD");

  const ISODateTime = z.string().datetime();

  // Esquema que valida el JSON tal cual lo envías (claves con espacios)
  export const InvestigacionSchemaRaw = z
    .object({
      titulo: z.string().min(1, "titulo es requerido"),
      resumen: z.string().min(1).max(300, "máx 300 caracteres"),
      descripcion: z.string().min(1).max(1000, "máx 1000 caracteres"),
      programa: z.string().min(1, "programa es requerido"),
      investigadores: z.array(z.string().min(1)).min(1, "al menos 1 autor"),
      "Fecha de publicacion": DateOnly,
      URI: z
        .string()
        .url("URI debe ser una URL válida")
        .optional() 
        .or(z.literal("").transform(() => undefined)),
      "palabras clave": z.string().min(1, "proporciona al menos una palabra").optional(),
      imagenURL: z.string().url("imagenURL debe ser una URL válida").optional(),
      pdfURL: z.string().url("pdfURL debe ser una URL válida").optional(),
      metadata: z.object({
        UploadDate: ISODateTime,
        LastChange: ISODateTime,
      }),
    })
    .strict(); // rechaza campos extra

  export const InvestigacionSchema = InvestigacionSchemaRaw.transform((v) => ({
    titulo: v.titulo,
    resumen: v.resumen,
    descripcion: v.descripcion,
    programa: v.programa,
    investigadores: v.investigadores,
    fecha_publicacion: v["Fecha de publicacion"], // mantiene YYYY-MM-DD
    uri: v.URI, // undefined si venía vacío
    palabras_clave: v["palabras clave"]
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean),
    imagenURL: v.imagenURL,
    pdfURL: v.pdfURL,
    metadata: {
      uploadDate: v.metadata.UploadDate,
      lastChange: v.metadata.LastChange,
    },
  }));

  export async function POST({ request }) {
    try {
      const body = await request.json();

      const parsed = InvestigacionSchema.safeParse(body);
      if (!parsed.success) {
        return new Response(  
          JSON.stringify({ ok: false, error: parsed.error.flatten() }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      
      const respuesta = await couch.post("investigaciones", parsed.data);

      return new Response(
        JSON.stringify({ ok: true, data: respuesta.data }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("Error:", error);
      return new Response(JSON.stringify({ ok: false, error: String(error) }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  export async function PUT({ request, params }) {
  try {
    const id = params.id; // si usas rutas dinámicas tipo /api/investigaciones/[id]
    if (!id) {
      return new Response(
        JSON.stringify({ ok: false, error: "Falta el id" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await request.json();

    const parsed = InvestigacionSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ ok: false, error: parsed.error.flatten() }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 1. Obtener doc actual
    const current = await couch.get("investigaciones", id);

    // 2. Construir nuevo doc con _id y _rev
    const updatedDoc = {
      ...current.data, // mantenemos lo que ya tenía
      ...parsed.data,  // sobreescribimos con lo validado
      _id: id,
      _rev: current.data._rev,
    };

    // 3. Guardar en CouchDB
    const respuesta = await couch.put("investigaciones", id, updatedDoc);

    return new Response(
      JSON.stringify({ ok: true, data: respuesta.data }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error al actualizar investigación:", error);
    return new Response(
      JSON.stringify({ ok: false, error: String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}