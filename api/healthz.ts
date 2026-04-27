export default function handler(_req: any, res: any) {
  res.status(200).json({
    status: "ok",
    geminiKeyConfigured: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString(),
  });
}
