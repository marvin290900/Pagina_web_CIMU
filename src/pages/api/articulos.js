import { couch } from "../../lib/couchDB";

export async function GET({ request }) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const filename = url.searchParams.get("filename");

  try {
    if (id && filename) {
      // Proxy attachment download
      const response = await couch.get(`/articulos/${encodeURIComponent(id)}/${encodeURIComponent(filename)}`, {
        responseType: 'arraybuffer'
      });
      return new Response(response.data, {
        status: 200,
        headers: {
          "Content-Type": response.headers["content-type"] || "application/pdf",
          "Content-Disposition": `inline; filename="${filename}"`
        },
      });
    }

    const { data } = await couch.get("/articulos/_all_docs?include_docs=true");
    const docs = data.rows.map((r) => r.doc || {});
    return new Response(JSON.stringify(docs), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching articles/attachment:", error);
    return new Response(JSON.stringify({ error: "Error fetching articles" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST({ request }) {
  try {
    const body = await request.json();
    const { data } = await couch.post("/articulos", body);
    return new Response(JSON.stringify(data), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating article:", error);
    return new Response(JSON.stringify({ error: "Error creating article" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function PUT({ request }) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const rev = url.searchParams.get("rev");
  const filename = url.searchParams.get("filename");

  try {
    if (filename && id && rev) {
      // Attachment upload
      const arrayBuffer = await request.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const { data } = await couch.put(`/articulos/${encodeURIComponent(id)}/${encodeURIComponent(filename)}?rev=${rev}`, buffer, {
        headers: { "Content-Type": "application/pdf" },
      });
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else if (id) {
      // Document update
      const body = await request.json();
      const { data } = await couch.put(`/articulos/${encodeURIComponent(id)}`, body);
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ error: "Missing ID for update" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating article:", error);
    return new Response(JSON.stringify({ error: "Error updating article" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function DELETE({ request }) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const rev = url.searchParams.get("rev");

  if (!id || !rev) {
    return new Response(JSON.stringify({ error: "Missing id or rev" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { data } = await couch.delete(`/articulos/${encodeURIComponent(id)}?rev=${rev}`);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error deleting article:", error);
    return new Response(JSON.stringify({ error: "Error deleting article" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
