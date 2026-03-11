import { z } from "zod";
import { couch } from "../../../lib/couchDB.js";
import { requireAuth } from "../../../lib/apiAuth.js";

const DateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato esperado: YYYY-MM-DD");

const ISODateTime = z.string().datetime();

// Esquema que valida el JSON tal cual lo envías (claves con espacios)
export const InvestigacionSchemaRaw = z
  .object({
    titulo: z.string().min(1, "titulo es requerido"),
    resumen: z.string().min(1).max(1500, "máx 1500 caracteres"),
    descripcion: z.string().min(1).max(1500, "máx 1500   caracteres"),
    programa: z.string().min(1, "programa es requerido"),
    investigadores: z.array(z.object({
      id: z.string().min(1, "ID del investigador requerido"),
      nombre: z.string().min(1, "Nombre del investigador requerido"),
    })).min(1, "al menos 1 autor"),
    "Fecha de publicacion": DateOnly,
    URI: z
      .string()
      .url("URI debe ser una URL válida")
      .optional()
      .or(z.literal("").transform(() => undefined)),
    "palabras clave": z.string().optional().default(""),
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

export async function POST({ request, cookies }) {
  try {
    const auth = await requireAuth(request, cookies);
    if (!auth.authorized) return auth.response;

    let body = await request.json();
    const parsed = InvestigacionSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ ok: false, error: parsed.error.flatten() }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const respuesta = await couch.post("investigaciones", parsed.data);
    console.log("Respuesta de CouchDB:", respuesta.data.id);
    // Actualizar cada investigador
    body = {
      id: respuesta.data.id,
      nombre: parsed.data.titulo,
    }
    
    await Promise.all(parsed.data.investigadores.map(inv => {
      const datos  = couch.post(
  `/investigadores/_design/investigadores/_update/agregarProyecto/${inv.id}`,
  JSON.stringify(body),
  {
    headers: { 'Content-Type': 'application/json' }
  }
).catch(error => {  
  console.error(`Error actualizando investigador ${inv.id}:`, error);
  throw error; // Re-lanzar para que Promise.all falle
});
      console.log(`Actualizando investigador ${inv.id} con proyecto ${datos}`);
      return datos;

    }));

    return new Response(JSON.stringify({ ok: true, data: respuesta.data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ ok: false, error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function PUT({ request, cookies }) {
  try {
   const auth = await requireAuth(request, cookies);

    if (!auth.authorized) return auth.response;
    let body = await request.json();

    // ⚠️ Ahora sacamos el id directamente del body
    const { id, ...rest } = body;

    console.log("BODY RECIBIDO PARA UPDATE:", body);

    if (!id) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Falta el id en el cuerpo del request",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const parsed = InvestigacionSchema.safeParse(rest);
    console.log("PARSED:", parsed);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ ok: false, error: parsed.error.flatten() }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 1. Obtener doc actual
    const current = await couch.get(`investigaciones/${id}`);
    console.log("DOC ACTUAL:", current.data);
    // 2. Construir nuevo doc con _id y _rev
    const updatedDoc = {
      ...current.data, // mantenemos lo que ya tenía
      ...parsed.data, // sobreescribimos con lo validado
      _id: id,
      _rev: current.data._rev,
    };

    // 3. Guardar en CouchDB
    console.log("DOC ACTUALIZADO:", updatedDoc);
    const respuesta = await couch.put(`investigaciones/${id}`, updatedDoc);

    //Actualizar investigadores
    body = {
      id: respuesta.data.id,
      nombre: parsed.data.titulo,
    }
    
    await Promise.all(parsed.data.investigadores.map(inv => {
      return couch.post(`/investigadores/_design/investigadores/_update/agregarProyecto/${inv.id}`, body);
    }));

    return new Response(JSON.stringify({ ok: true, data: respuesta.data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error al actualizar investigación:", error);
    return new Response(JSON.stringify({ ok: false, error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function GET() {
  try {
    const respuesta = await couch.get(
      "investigaciones/_all_docs?include_docs=true"
    );
    return new Response(JSON.stringify({ ok: true, data: respuesta.data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error al obtener investigaciones:", error);
    return new Response(JSON.stringify({ ok: false, error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// funcion para delete investigacion
export async function DELETE({ request }) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Falta el id en el cuerpo del request",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    
    const getResponse = await couch.get(`investigaciones/${id}`);
    await Promise.all(getResponse.data.investigadores.map(inv => {
      const datos  = couch.post(
  `/investigadores/_design/investigadores/_update/eliminarProyecto/${inv.id}`,
  JSON.stringify({id}),
  {
    headers: { 'Content-Type': 'application/json' }
  }
).catch(error => {  
  console.error(`Error actualizando investigador ${inv.id}:`, error);
  throw error; // Re-lanzar para que Promise.all falle
});
      console.log(`Actualizando investigador ${inv.id} con proyecto ${datos}`);
      return datos;

    }));
    if (!getResponse.data) {
      return new Response(
        JSON.stringify({ ok: false, error: "Investigación no encontrada" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const respuesta = await couch.delete(
      `investigaciones/${id}?rev=${getResponse.data._rev}`
    );
    return new Response(JSON.stringify({ ok: true, data: respuesta.data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error al eliminar investigación:", error);
    return new Response(JSON.stringify({ ok: false, error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
