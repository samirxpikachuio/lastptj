import { DEFAULT_URL, DEFAULT_HEADERS } from "../config/defaults.js";
import { parseSSEChunk, cleanOutput } from "../utils/parser.js";
import { ThesysError } from "../utils/ThesysError.js";

/**
 * Represents a single turn in the conversation history.
 */
export interface Message {
  role: "user" | "assistant";
  content: string;
}

/**
 * Configuration options for the ThesysClient.
 */
export interface ThesysClientOptions {
  /** Override the default API endpoint */
  url?: string;
  /** Merge extra headers into every request */
  headers?: Record<string, string>;
}

/**
 * Options for the `run` method.
 */
export interface RunOptions {
  /** Streaming callback called with each partial chunk */
  onMessage?: (chunk: string) => void;
}

/**
 * Core Thesys API client for interacting with the AI Chat API.
 */
export class ThesysClient {
  #history: Message[] = [];
  public url: string;
  public headers: Record<string, string>;

  /**
   * Creates a new instance of ThesysClient.
   *
   * @param options - Configuration options for the client.
   */
  constructor(options: ThesysClientOptions = {}) {
    this.url = options.url ?? DEFAULT_URL;
    this.headers = { ...DEFAULT_HEADERS, ...options.headers };
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  /**
   * Send a message and return the full response string.
   *
   * @param message - User message to send.
   * @param options - Optional processing parameters.
   * @returns The complete assembled assistant reply.
   */
  public run = async (message: string, options: RunOptions = {}): Promise<string> => {
    this.#history.push({ role: "user", content: message });

    let raw = "";

    for await (const chunk of this.#streamChunks()) {
      raw += chunk;
      options.onMessage?.(chunk);
    }

    const reply = cleanOutput(raw);
    this.#history.push({ role: "assistant", content: reply });
    return reply;
  };

  /**
   * Async iterator that yields cleaned text fragments as they arrive.
   * Automatically adds the final assembled reply to conversation history.
   *
   * @param message - User message to send.
   * @returns Incremental text fragments.
   *
   * @example
   * for await (const fragment of client.stream("Hello!")) {
   *   process.stdout.write(fragment);
   * }
   */
  public stream = async function* (this: ThesysClient, message: string): AsyncGenerator<string, void, unknown> {
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
   *
   * @returns Array of message objects.
   */
  public getHistory = (): Message[] => [...this.#history];

  /**
   * Clear conversation history and reset the session.
   */
  public reset = (): void => {
    this.#history = [];
  };

  // ─── Private helpers ───────────────────────────────────────────────────────

  /**
   * Open the SSE request and yield raw data payloads.
   */
  #streamChunks = async function* (this: ThesysClient): AsyncGenerator<string, void, unknown> {
    const body = JSON.stringify({ conversationHistory: [...this.#history] });

    let response: Response;
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

    if (!response.body) {
      throw new ThesysError("Response body is null", { code: "API_ERROR" });
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
