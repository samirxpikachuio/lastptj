/**
 * Default API endoint for the Thesys AI Chat API.
 */
export const DEFAULT_URL: string =
  "https://api.app.thesys.dev/demo/ai/chat.claude/stream";

/**
 * Default HTTP headers required by the Thesys API.
 */
export const DEFAULT_HEADERS: Record<string, string> = {
  accept: "text/event-stream",
  "content-type": "application/json",
  origin: "https://demo.thesys.dev",
  referer: "https://demo.thesys.dev/",
  "x-thesys-ax-req-source": "demo/compare",
};
