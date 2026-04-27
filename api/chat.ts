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

async function readBody(req: any): Promise<any> {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    const body = await readBody(req);
    const messages: Msg[] = Array.isArray(body?.messages) ? body.messages : [];
    if (messages.length === 0) {
      res.status(400).json({ error: "messages array required" });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({
        error:
          "GEMINI_API_KEY is not configured. Add it in Vercel Project Settings > Environment Variables, then redeploy.",
      });
      return;
    }

    const contents = messages
      .filter((m) => m && m.role !== "system" && typeof m.content === "string")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(
      apiKey,
    )}`;

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
        detail: text.slice(0, 500),
      });
      return;
    }

    const data: any = await response.json();
    const reply: string =
      data?.candidates?.[0]?.content?.parts
        ?.map((p: any) => p?.text ?? "")
        .join("")
        .trim() ?? "";

    res.status(200).json({
      reply: reply || "I am here. Could you rephrase your question?",
      model: MODEL,
    });
  } catch (err: any) {
    console.error("AkinAI chat handler crashed", err);
    res.status(500).json({
      error: "Chat handler failed",
      detail: String(err?.message || err),
    });
  }
}
