// app/api/embed/route.ts
import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

const STORAGE_DIR = path.join(process.cwd(), "storage");
const EMB_FILE = path.join(STORAGE_DIR, "embeddings.json");
const GEMINI_KEY = process.env.GEMINI_KEY ?? process.env.GENERATIVE_API_KEY ?? "";

type EmbRecord = {
  id: string;
  source: string;
  text: string;
  embedding: number[] | null;
};

function ensureStorage() {
  if (!fs.existsSync(STORAGE_DIR)) fs.mkdirSync(STORAGE_DIR, { recursive: true });
  if (!fs.existsSync(EMB_FILE)) fs.writeFileSync(EMB_FILE, JSON.stringify({ items: [] }, null, 2), "utf8");
}

function readStore(): { items: EmbRecord[] } {
  try {
    ensureStorage();
    const raw = fs.readFileSync(EMB_FILE, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    console.warn("[/api/embed] readStore error:", e);
    return { items: [] };
  }
}

function writeStore(obj: { items: EmbRecord[] }) {
  try {
    ensureStorage();
    fs.writeFileSync(EMB_FILE, JSON.stringify(obj, null, 2), "utf8");
  } catch (e) {
    console.error("[/api/embed] writeStore error:", e);
  }
}

function chunkText(text: string, chunkSize = 1200, overlap = 200) {
  const chunks: string[] = [];
  if (!text) return chunks;
  let i = 0;
  while (i < text.length) {
    const part = text.slice(i, i + chunkSize).trim();
    if (part) chunks.push(part);
    i += chunkSize - overlap;
  }
  return chunks;
}

async function extractTextFromBuffer(buf: Buffer, filename: string) {
  const name = (filename || "").toLowerCase();
  try {
    if (name.endsWith(".txt")) {
      return new TextDecoder().decode(buf);
    }
    if (name.endsWith(".docx") || name.endsWith(".doc")) {
      // try mammoth if installed
      try {
        const mammoth = await import("mammoth");
        const r = await mammoth.extractRawText({ buffer: buf });
        return String(r?.value ?? "").trim();
      } catch (e) {
        console.warn("[/api/embed] mammoth parse failed or not installed:", e?.message ?? e);
        return "";
      }
    }
    if (name.endsWith(".pdf")) {
      try {
        const pdfParse = await import("pdf-parse");
        const r = await pdfParse.default(buf);
        return String(r?.text ?? "").trim();
      } catch (e) {
        console.warn("[/api/embed] pdf-parse not available or failed:", e?.message ?? e);
        return "";
      }
    }
    // fallback: try decode as UTF-8
    return new TextDecoder().decode(buf).trim();
  } catch (e) {
    console.warn("[/api/embed] extractTextFromBuffer error:", e);
    return "";
  }
}

// Normalize various shapes of embedding responses to an array of vectors or nulls
function normalizeEmbeddingResp(resp: any): (number[] | null)[] | null {
  try {
    if (!resp) return null;
    if (Array.isArray(resp)) {
      // top-level array => assume array of objects or vectors
      if (resp.length === 0) return null;
      if (typeof resp[0] === "number") return [resp as unknown as number[]];
      return resp.map((d: any) => d?.embedding ?? d ?? null);
    }
    if (resp.data && Array.isArray(resp.data)) {
      return resp.data.map((d: any) => d?.embedding ?? d?.vector ?? null);
    }
    if (resp.embeddings && Array.isArray(resp.embeddings)) {
      return resp.embeddings.map((d: any) => d?.embedding ?? d ?? null);
    }
    if (resp.results && Array.isArray(resp.results)) {
      return resp.results.map((d: any) => d?.embedding ?? d ?? null);
    }
    return null;
  } catch (e) {
    console.warn("[/api/embed] normalizeEmbeddingResp error:", e);
    return null;
  }
}

// Try various SDK methods then REST fallback to compute embeddings
async function embedWithGemini(texts: string[]): Promise<(number[] | null)[]> {
  if (!texts || texts.length === 0) return [];

  // candidate embedding models
  const embCandidates = [
    "models/gemini-embedding-001",
    "models/embedding-gecko-001",
    "models/embedding-001",
    "models/text-embedding-004",
  ];

  // 1) try SDK dynamic import
  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(GEMINI_KEY);

    for (const model of embCandidates) {
      try {
        // many SDKs expose embeddings.create
        if ((genAI as any).embeddings?.create) {
          const resp = await (genAI as any).embeddings.create({ model, input: texts });
          console.log("[/api/embed] embeddings.create response model=", model, resp?.status ?? "");
          const norm = normalizeEmbeddingResp(resp);
          if (norm) return norm;
        }

        // or embeddings as function
        if ((genAI as any).embeddings && typeof (genAI as any).embeddings === "function") {
          const resp = await (genAI as any).embeddings({ model, input: texts });
          console.log("[/api/embed] embeddings(...) response model=", model);
          const norm = normalizeEmbeddingResp(resp);
          if (norm) return norm;
        }

        // embedText
        if ((genAI as any).embedText) {
          const resp = await (genAI as any).embedText({ model, input: texts });
          console.log("[/api/embed] embedText resp model=", model);
          const norm = normalizeEmbeddingResp(resp);
          if (norm) return norm;
        }
      } catch (e) {
        console.warn("[/api/embed] SDK embed attempt failed for", model, e?.message ?? e);
        // continue to next candidate
      }
    }
  } catch (e) {
    console.warn("[/api/embed] SDK import/usage failed:", e?.message ?? e);
  }

  // 2) REST fallback: try models via REST embed endpoint
  try {
    for (const model of embCandidates) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1/models/${encodeURIComponent(model)}:embed?key=${GEMINI_KEY}`;
        const resp = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: texts }),
        });
        const j = await resp.json();
        console.log("[/api/embed] REST embed response for", model, j && (j.error ? j.error : "ok"));
        const norm = normalizeEmbeddingResp(j);
        if (norm) return norm;
      } catch (e) {
        console.warn("[/api/embed] REST embed failed for", model, e?.message ?? e);
      }
    }
  } catch (e) {
    console.warn("[/api/embed] REST embed overall failed:", e);
  }

  // nothing worked
  console.warn("[/api/embed] No embeddings produced for texts; returning nulls");
  return texts.map(() => null);
}

export async function POST(req: Request) {
  try {
    // Accept form-data upload with key "file" OR JSON with { url }
    const contentType = req.headers.get("content-type") || "";
    let filename = `file_${Date.now()}`;
    let text = "";

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ ok: false, error: "No file provided" }, { status: 400 });
      }
      filename = (file.name ?? filename).toString();
      const buf = Buffer.from(await file.arrayBuffer());
      text = await extractTextFromBuffer(buf, filename);
    } else {
      // JSON body - accept { url: "...", text: "..." }
      const body = await req.json().catch(() => ({}));
      if (body?.text) {
        text = String(body.text ?? "");
        filename = body?.name ?? filename;
      } else if (body?.url) {
        // fetch url and attempt to extract HTML text
        try {
          const r = await fetch(String(body.url));
          const html = await r.text();
          // try cheerio if available
          try {
            const cheerio = await import("cheerio");
            const $ = cheerio.load(html);
            $("script, style, noscript").remove();
            text = $("body").text().replace(/\s+/g, " ").trim();
          } catch (e) {
            text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
          }
          filename = body?.url;
        } catch (e) {
          console.warn("[/api/embed] fetch url failed:", e);
        }
      } else {
        return NextResponse.json({ ok: false, error: "Unsupported content type or empty body" }, { status: 400 });
      }
    }

    // chunk text and persist
    const chunks = chunkText(text || "");
    const store = readStore();
    const sourceId = `file_${filename.replace(/\s+/g, "_")}_${Date.now()}`;
    let added = 0;

    for (let i = 0; i < chunks.length; i++) {
      const rec: EmbRecord = {
        id: `${sourceId}_${i}`,
        source: sourceId,
        text: chunks[i],
        embedding: null,
      };
      store.items.push(rec);
      added++;
    }

    // attempt to embed newly added chunks
    let embeddingsProduced = 0;
    try {
      const toEmbed = chunks;
      const vectors = await embedWithGemini(toEmbed);
      if (Array.isArray(vectors) && vectors.length === toEmbed.length) {
        for (let i = 0; i < vectors.length; i++) {
          store.items[store.items.length - added + i].embedding = vectors[i];
          if (Array.isArray(vectors[i]) && vectors[i].length > 0) embeddingsProduced++;
        }
      }
    } catch (e) {
      console.warn("[/api/embed] embedWithGemini failed:", e);
    }

    writeStore(store);

    console.log("[/api/embed] Received file:", filename);
    console.log("[/api/embed] Extracted text length:", (text || "").length);
    console.log("[/api/embed] Chunk count:", chunks.length);
    console.log("[/api/embed] Embeddings returned:", embeddingsProduced, "/", chunks.length);
    console.log("[/api/embed] Stored items:", (readStore().items ?? []).length);
    console.log("[/api/embed] Stored for source:", sourceId);

    return NextResponse.json({ ok: true, sourceId, added, embeddingsProduced });
  } catch (err: any) {
    console.error("[/api/embed] ERROR:", err);
    return NextResponse.json({ ok: false, error: String(err?.message ?? err) }, { status: 500 });
  }
}
