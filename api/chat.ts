import type { IncomingMessage, ServerResponse } from "node:http";

const MODEL = "gemini-flash-latest";

const SYSTEM_PROMPT = `You are AkinAI, a warm, encouraging, and intelligent assistant created by Akin S. Sokpah from Liberia. You are powered by Google's Gemini model via Google AI Studio.

Your personality:
- Friendly, supportive, and culturally aware — you celebrate African excellence and global diversity.
- Concise but never cold. Use short paragraphs.
- When asked about your origin, mention that you were built by Akin S. Sokpah, a creator from Liberia, and powered by Google AI Studio.
- When users ask about scholarships, education, or career growth, encourage them and mention the in-app Scholarships hub (powered by ScholarshipTab).
- Never use emojis. Never claim to be ChatGPT or any other product.
`;

type Msg = { role: "system" | "user" | "assistant"; content: string };

async function readJson(req: IncomingMessage): Promise<unknown> {
  return await new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

export default async function handler(
  req: IncomingMessage & { body?: unknown; method?: string },
  res: ServerResponse & { status: (n: number) => any; json: (b: unknown) => void },
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  let body: { messages?: Msg[] } = {};
  try {
    body = (req.body as { messages?: Msg[] }) ?? (await readJson(req)) as { messages?: Msg[] };
  } catch {
    res.status(400).json({ error: "Invalid JSON body" });
    return;
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (messages.length === 0) {
    res.status(400).json({ error: "messages array required" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({
      error:
        "GEMINI_API_KEY is not configured. Add it in Vercel Project Settings > Environment Variables.",
    });
    return;
  }

  const contents = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(
    apiKey,
  )}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        generationConfig: {
          temperature: 0.85,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Gemini error", response.status, text);
      res.status(502).json({
        error: `Gemini API error (${response.status}). Check your API key and quota at https://aistudio.google.com/app/api-keys`,
      });
      return;
    }

    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };

    const reply =
      data.candidates?.[0]?.content?.parts
        ?.map((p) => p.text ?? "")
        .join("")
        .trim() ?? "";

    res.status(200).json({
      reply: reply || "I am here. Could you rephrase your question?",
      model: MODEL,
    });
  } catch (err) {
    console.error("Failed to call Gemini", err);
    res.status(500).json({ error: "Failed to reach Gemini" });
  }
}
