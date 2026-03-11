/**
 * Decode a raw SSE chunk and yield each `data:` payload line.
 *
 * @param rawChunk - Raw text decoded from the ReadableStream
 * @yields Individual data payloads (not yet post-processed)
 */
export function* parseSSEChunk(rawChunk: string): Generator<string, void, unknown> {
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
 * @param raw - The concatenated SSE data payloads
 * @returns Clean, human-readable response text
 */
export const cleanOutput = (raw: string): string =>
  raw
    .replace(/\\n/g, "\n")
    .replace(/\s+/g, " ")
    .replace(/\s([?.!,])/g, "$1")
    .trim();
