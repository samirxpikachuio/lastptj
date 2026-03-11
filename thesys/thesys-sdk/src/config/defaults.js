// src/config/defaults.js
// Default configuration for the Thesys SDK

/**
 * Default API endoint for the Thesys AI Chat API.
 * @type {string}
 */
export const DEFAULT_URL =
  "https://api.app.thesys.dev/demo/ai/chat.claude/stream";

/**
 * Default HTTP headers required by the Thesys API.
 * @type {Record<string, string>}
 */
export const DEFAULT_HEADERS = {
  accept: "text/event-stream",
  "content-type": "application/json",
  origin: "https://demo.thesys.dev",
  referer: "https://demo.thesys.dev/",
  "x-thesys-ax-req-source": "demo/compare",
};
