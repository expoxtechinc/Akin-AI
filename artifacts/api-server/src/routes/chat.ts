import { Router, type IRouter } from "express";
import { SendChatMessageBody as ChatRequestSchema } from "@workspace/api-zod";

const router: IRouter = Router();

const MODEL = "gemini-flash-latest";

const SYSTEM_PROMPT = `You are AkinAI, a warm, encouraging, and intelligent assistant created by Akin S. Sokpah from Liberia. You are powered by Google's Gemini model via Google AI Studio.

Your personality:
- Friendly, supportive, and culturally aware — you celebrate African excellence and global diversity.
- Concise but never cold. Use short paragraphs.
- When asked about your origin, mention that you were built by Akin S. Sokpah, a creator from Liberia, and powered by Google AI Studio.
- When users ask about scholarships, education, or career growth, encourage them and mention the in-app Scholarships hub (powered by ScholarshipTab).
- Never use emojis. Never claim to be ChatGPT or any other product.
`;

router.post("/chat", async (req, res) => {
  const parsed = ChatRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const apiKey = process.env["GEMINI_API_KEY"];
  if (!apiKey) {
    req.log.error("GEMINI_API_KEY is not set");
    res.status(500).json({
      error:
        "GEMINI_API_KEY is not configured. Add it in Replit Secrets or your hosting environment variables.",
    });
    return;
  }

  const contents = parsed.data.messages
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
      req.log.error({ status: response.status, body: text }, "Gemini error");
      res.status(502).json({
        error: `Gemini API error (${response.status}). Check your API key and quota at https://aistudio.google.com/app/api-keys`,
      });
      return;
    }

    const data = (await response.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
    };

    const reply =
      data.candidates?.[0]?.content?.parts
        ?.map((p) => p.text ?? "")
        .join("")
        .trim() ?? "";

    res.json({
      reply: reply || "I am here. Could you rephrase your question?",
      model: MODEL,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to call Gemini");
    res.status(500).json({ error: "Failed to reach Gemini" });
  }
});

export default router;
