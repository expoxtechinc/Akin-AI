import type { IncomingMessage, ServerResponse } from "node:http";

export default function handler(
  _req: IncomingMessage,
  res: ServerResponse & { status: (n: number) => any; json: (b: unknown) => void },
) {
  res.status(200).json({ status: "ok" });
}
