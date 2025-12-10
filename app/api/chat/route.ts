// app/api/chat/route.ts
import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

const STORAGE_DIR = path.join(process.cwd(), "storage");
const EMB_FILE = path.join(STORAGE_DIR, "embeddings.json");
const GEMINI_KEY = process.env.GEMINI_KEY ?? process.env.GENERATIVE_API_KEY ?? "";

// helpers for storage + read
function ensureStorage() {
  if (!fs.existsSync(STORAGE_DIR)) fs.mkdirSync(STORAGE_DIR, { recursive: true });
  if (!fs.existsSync(EMB_FILE)) fs.writeFileSync(EMB_FILE, JSON.stringify({ items: [] }, null, 2), "utf8");
}
function readStore(): { items: { id: string; source: string; text: string; embedding: number[] | null }[] } {
  try {
    ensureStorage();
    return JSON.parse(fs.readFileSync(EMB_FILE, "utf8"));
  } catch (e) {
    console.warn("[/api/chat] readStore error:", e);
    return { items: [] };
  }
}

// cosine similarity
function cosine(a?: number[] | null, b?: number[] | null) {
  if (!Array.isArray(a) || !Array.isArray(b)) return -1;
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (!na || !nb) return -1;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

// simple keyword fallback
function simpleScore(query: string, doc: string) {
  if (!query || !doc) return 0;
  const q = query.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter(Boolean);
  const d = doc.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter(Boolean);
  const setD = new Set(d);
  let score = 0;
  for (const w of q) if (setD.has(w)) score++;
  return score;
}

// normalize embeddings responses (same as embed route)
function normalizeEmbeddingResp(resp: any): (number[] | null)[] | null {
  try {
    if (!resp) return null;
    if (Array.isArray(resp)) {
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
    console.warn("[/api/chat] normalizeEmbeddingResp error:", e);
    return null;
  }
}

// Try to get query embedding (SDK then REST)
async function getQueryEmbedding(text: string): Promise<number[] | null> {
  if (!text) return null;
  const candidates = [
    "models/gemini-embedding-001",
    "models/embedding-gecko-001",
    "models/embedding-001",
    "models/text-embedding-004",
  ];

  // try SDK
  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(GEMINI_KEY);
    for (const m of candidates) {
      try {
        if ((genAI as any).embeddings?.create) {
          const resp = await (genAI as any).embeddings.create({ model: m, input: [text] });
          const norm = normalizeEmbeddingResp(resp);
          if (norm && Array.isArray(norm) && norm[0]) return norm[0];
        }
        if ((genAI as any).embeddings && typeof (genAI as any).embeddings === "function") {
          const resp = await (genAI as any).embeddings({ model: m, input: [text] });
          const norm = normalizeEmbeddingResp(resp);
          if (norm && Array.isArray(norm) && norm[0]) return norm[0];
        }
        if ((genAI as any).embedText) {
          const resp = await (genAI as any).embedText({ model: m, input: [text] });
          const norm = normalizeEmbeddingResp(resp);
          if (norm && Array.isArray(norm) && norm[0]) return norm[0];
        }
      } catch (e) {
        // continue
      }
    }
  } catch (e) {
    console.warn("[/api/chat] SDK embed not available:", e?.message ?? e);
  }

  // REST fallback
  try {
    for (const m of candidates) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1/models/${encodeURIComponent(m)}:embed?key=${GEMINI_KEY}`;
        const r = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: [text] }),
        });
        const j = await r.json();
        const norm = normalizeEmbeddingResp(j);
        if (norm && norm[0]) return norm[0];
      } catch (e) {
        // continue
      }
    }
  } catch (e) {
    console.warn("[/api/chat] REST embed fallback failed:", e);
  }

  return null;
}

// call Gemini to generate (SDK or REST fallback). tries several generation models
async function callGeminiWithRetry(systemInstruction: string, userMessage: string, modelOverride?: string) {
  const preferred = [
    "models/gemini-2.5-pro",
    "models/gemini-pro-latest",
    "models/gemini-2.5-flash",
    "models/gemini-flash-latest",
  ];
  const tryModels = modelOverride ? [modelOverride, ...preferred.filter(m => m !== modelOverride)] : preferred;

  // try SDK
  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(GEMINI_KEY);

    for (const m of tryModels) {
      try {
        const modelRef = (genAI as any).getGenerativeModel ? (genAI as any).getGenerativeModel({ model: m }) : genAI;
        const result = await modelRef.generateContent({
          model: m,
          systemInstruction,
          // put user content as contents array, matches SDK examples
          // NOTE: some SDKs expect 'input' instead — we try standard shape first
          contents: [{ role: "user", parts: [{ text: userMessage }] }],
          // generationConfig could be added if needed
        } as any);
        console.log("[/api/chat] Gemini SDK generate succeeded model=", m);
        return result;
      } catch (e) {
        console.warn("[/api/chat] Gemini SDK generate failed for", m, e?.message ?? e);
      }
    }
  } catch (e) {
    console.warn("[/api/chat] Gemini SDK not available or failed:", e?.message ?? e);
  }

  // REST fallback: try models
  for (const m of tryModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(m)}:generateContent?key=${GEMINI_KEY}`;
      // Note: some accounts might need /v1/ instead of /v1beta/; logs will show 404 if wrong
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // systemInstruction and user message in prompt-like structure for REST
          prompt: `${systemInstruction}\n\nUser: ${userMessage}`,
          // generation config
          temperature: 0.2,
          maxOutputTokens: 800,
        }),
      });
      const j = await resp.json();
      if (j && !j.error) {
        console.log("[/api/chat] Gemini REST generate succeeded model=", m);
        return j;
      } else {
        console.warn("[/api/chat] Gemini REST generate error model=", m, j?.error ?? j);
      }
    } catch (e) {
      console.warn("[/api/chat] Gemini REST generate failed for", m, e?.message ?? e);
    }
  }

  throw new Error("No working Gemini generation method found");
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const message: string = String(body?.message ?? "").trim();
    const useRag: boolean = Boolean(body?.useRag);
    const modelOverride: string | undefined = body?.model ?? undefined;
    const responseAdjustment: string | undefined = body?.responseAdjustment ?? undefined;

    if (!message) return NextResponse.json({ ok: false, error: "No message provided" }, { status: 400 });

    // base system instruction, you can customize
    let systemInstruction = "You are an assistant. Answer concisely and helpfully.";
    if (responseAdjustment) {
      systemInstruction += `\nRespond with this adjustment: ${responseAdjustment}`;
    }

    let fileText = ""; // optional if user provided direct text in body
    if (body?.fileText) fileText = String(body.fileText ?? "");

    // RAG retrieval
    if (!fileText && useRag) {
      const store = readStore();
      const items = store.items ?? [];
      console.log("[/api/chat] RAG: store items:", items.length);

      if (items.length > 0) {
        // check if embeddings exist
        const hasEmbeddings = items.some(it => Array.isArray(it.embedding) && it.embedding.length > 0);
        console.log("[/api/chat] RAG: hasEmbeddings =", hasEmbeddings);

        let contexts: string[] = [];

        if (hasEmbeddings) {
          // compute query embedding
          const qEmb = await getQueryEmbedding(message);
          if (qEmb) {
            const scored = items.map(it => ({ score: cosine(qEmb, it.embedding), text: it.text }));
            scored.sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
            contexts = scored.slice(0, 5).filter(s => s.score > -0.5).map(s => s.text.slice(0, 1200));
            console.log("[/api/chat] RAG: top cosine scores:", scored.slice(0, 5).map(s => s.score));
          }
        }

        if (contexts.length === 0) {
          // fallback to simple keyword score
          const scored = items.map(it => ({ score: simpleScore(message, it.text), text: it.text }));
          scored.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
          const top = scored.filter(s => s.score > 0).slice(0, 5);
          if (top.length > 0) contexts = top.map(t => t.text.slice(0, 1200));
          else contexts = items.slice(0, 3).map(it => it.text.slice(0, 1200)); // absolute fallback
          console.log("[/api/chat] RAG: fallback chosen, top scores:", top.map(t => t.score));
        }

        if (contexts.length > 0) {
          systemInstruction += `\n\nUse the following document excerpts to answer the user's question (use as context):\n\n${contexts.join("\n\n---\n\n")}`;
          console.log("[/api/chat] RAG: inserted contexts count:", contexts.length);
        }
      }
    }

    // call Gemini to generate a reply (SDK or REST fallback)
    try {
      const genResult = await callGeminiWithRetry(systemInstruction, message, modelOverride);
      // extract reply text from possible shapes
      let replyText = "";

      if (!genResult) {
        throw new Error("Empty generation result");
      }

      // If SDK-style response
      try {
        // SDK may return result.response?.text() or result.response?.content?.[0]?.text
        if (typeof genResult?.response?.text === "function") {
          replyText = await genResult.response.text();
        } else if (genResult?.response?.text) {
          replyText = String(genResult.response.text ?? "");
        } else if (genResult?.candidates && Array.isArray(genResult.candidates) && genResult.candidates[0]) {
          replyText = String(genResult.candidates[0].content ?? genResult.candidates[0].output ?? "");
        } else if (genResult?.output?.[0]?.content) {
          // some shapes
          replyText = genResult.output.map((o:any) => o?.content?.map((p:any)=> p?.text ?? "").join("")).join("\n");
        } else if (typeof genResult === "string") {
          replyText = genResult;
        } else if (genResult?.text) {
          replyText = String(genResult.text ?? "");
        } else {
          // rest-style: maybe j.output?.[0]?.content?.[0]?.text
          if (genResult?.output && Array.isArray(genResult.output)) {
            replyText = genResult.output.map((o:any)=> {
              if (Array.isArray(o.content)) return o.content.map((p:any)=> p.text ?? "").join("");
              return o.text ?? "";
            }).join("\n");
          }
        }
      } catch (e) {
        console.warn("[/api/chat] extract reply error:", e);
      }

      replyText = (replyText || "").trim();
      if (!replyText) replyText = "I couldn't produce an answer.";

      return NextResponse.json({ ok: true, reply: replyText });
    } catch (e:any) {
      console.error("[/api/chat] Gemini error:", e);
      return NextResponse.json({ ok: false, error: String(e?.message ?? e) }, { status: 500 });
    }
  } catch (err: any) {
    console.error("[/api/chat] ERROR:", err);
    return NextResponse.json({ ok: false, error: String(err?.message ?? err) }, { status: 500 });
  }
}
