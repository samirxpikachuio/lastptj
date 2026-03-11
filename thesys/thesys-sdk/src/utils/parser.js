// src/utils/parser.js
// Utilities for parsing Server-Sent Events (SSE) streams from Thesys

/**
 * Decode a raw SSE chunk and yield each `data:` payload line.
 *
 * @param {string} rawChunk - Raw text decoded from the ReadableStream
 * @yields {string} Individual data payloads (not yet post-processed)
 */
export function* parseSSEChunk(rawChunk) {
  const lines = rawChunk.split("\n");
  for (const line of lines) {
    if (line.startsWith("data:")) {
      const payload = line.replace(/^data:\s?/, "");
      if (payload) yield payload;
    }
  }
}

/**
 * Post-process the accumulated raw output into clean readable text.
 *
 * @param {string} raw - The concatenated SSE data payloads
 * @returns {string}   - Clean, human-readable response text
 */
export const cleanOutput = (raw) =>
  raw
    .replace(/\\n/g, "\n")
    .replace(/\s+/g, " ")
    .replace(/\s([?.!,])/g, "$1")
    .trim();
