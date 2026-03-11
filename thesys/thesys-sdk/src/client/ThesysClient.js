// src/client/ThesysClient.js
// Core Thesys API client — class-based with arrow methods

import { DEFAULT_URL, DEFAULT_HEADERS } from "../config/defaults.js";
import { parseSSEChunk, cleanOutput } from "../utils/parser.js";
import { ThesysError } from "../utils/ThesysError.js";

export class ThesysClient {
  /** @type {Array<{role: string, content: string}>} */
  #history = [];

  /**
   * @param {object} [options]
   * @param {string}                              [options.url]     - Override the default API endpoint
   * @param {Record<string, string>}              [options.headers] - Merge extra headers into every request
   */
  constructor({ url = DEFAULT_URL, headers = {} } = {}) {
    this.url = url;
    this.headers = { ...DEFAULT_HEADERS, ...headers };
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  /**
   * Send a message and return the full response string.
   *
   * @param {string}   message              - User message to send
   * @param {object}   [options]
   * @param {Function} [options.onMessage]  - Streaming callback — called with each partial chunk
   * @returns {Promise<string>}             - The complete assistant reply
   */
  run = async (message, { onMessage } = {}) => {
    this.#history.push({ role: "user", content: message });

    let raw = "";

    for await (const chunk of this.#streamChunks()) {
      raw += chunk;
      onMessage?.(chunk);
    }

    const reply = cleanOutput(raw);
    this.#history.push({ role: "assistant", content: reply });
    return reply;
  };

  /**
   * Async iterator — yields cleaned text fragments as they arrive.
   * Automatically adds the final assembled reply to conversation history.
   *
   * @param {string} message - User message to send
   * @yields {string}        - Incremental text fragments
   *
   * @example
   * for await (const fragment of client.stream("Hello!")) {
   *   process.stdout.write(fragment);
   * }
   */
  stream = async function* (message) {
    this.#history.push({ role: "user", content: message });

    let raw = "";

    for await (const chunk of this.#streamChunks()) {
      raw += chunk;
      yield chunk;
    }

    const reply = cleanOutput(raw);
    this.#history.push({ role: "assistant", content: reply });
  };

  /**
   * Return a copy of the current conversation history.
   * @returns {Array<{role: string, content: string}>}
   */
  getHistory = () => [...this.#history];

  /**
   * Clear conversation history (start a new session).
   */
  reset = () => {
    this.#history = [];
  };

  // ─── Private helpers ───────────────────────────────────────────────────────

  /**
   * Open the SSE request and yield raw data payloads.
   * @yields {string}
   */
  #streamChunks = async function* () {
    const body = JSON.stringify({ conversationHistory: [...this.#history] });

    let response;
    try {
      response = await fetch(this.url, {
        method: "POST",
        headers: this.headers,
        body,
      });
    } catch (cause) {
      throw new ThesysError("Network request failed", {
        code: "NETWORK_ERROR",
        cause,
      });
    }

    if (!response.ok) {
      throw new ThesysError(
        `API responded with status ${response.status}: ${response.statusText}`,
        { status: response.status, code: "API_ERROR" }
      );
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        for (const payload of parseSSEChunk(text)) {
          yield payload;
        }
      }
    } catch (cause) {
      throw new ThesysError("Stream read interrupted", {
        code: "STREAM_ERROR",
        cause,
      });
    } finally {
      reader.releaseLock();
    }
  };
}
