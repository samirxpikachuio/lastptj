# thesys-sdk

A professional Node.js SDK for the Thesys AI Chat API.  
Supports streaming, full conversation history, async iterators, and custom configuration.

---

## Installation

```bash
npm install thesys-sdk
# or reference locally:
# "thesys-sdk": "file:./thesys-sdk"
```

> Requires **Node.js ≥ 18** (native `fetch` + ESM).

---

## Quick Start

```js
import { ThesysClient } from "thesys-sdk";

const client = new ThesysClient();
const reply = await client.run("What is love?");
console.log(reply);
```

---

## API

### `new ThesysClient(options?)`

| Option    | Type                        | Default                            | Description                        |
|-----------|-----------------------------|------------------------------------|-----------------------------------|
| `url`     | `string`                    | Thesys demo endpoint               | Override the API URL               |
| `headers` | `Record<string, string>`    | `{}`                               | Extra headers merged into requests |

---

### `client.run(message, options?)`  →  `Promise<string>`

Send a message and receive the full assembled reply.

```js
const reply = await client.run("Hello!", {
  onMessage: (chunk) => process.stdout.write(chunk), // optional live callback
});
```

---

### `client.stream(message)`  →  `AsyncGenerator<string>`

Async iterator — yields text fragments as they arrive from the SSE stream.

```js
for await (const fragment of client.stream("Tell me a story.")) {
  process.stdout.write(fragment);
}
```

---

### `client.getHistory()`  →  `Array<{role, content}>`

Returns a copy of the full conversation history (user + assistant turns).

---

### `client.reset()`

Clears conversation history and starts a fresh session.

---

## Error Handling

All errors are thrown as `ThesysError` instances.

```js
import { ThesysClient, ThesysError } from "thesys-sdk";

try {
  await client.run("Hello");
} catch (err) {
  if (err instanceof ThesysError) {
    console.error(err.message, err.code, err.status);
  }
}
```

| Property  | Description                              |
|-----------|------------------------------------------|
| `message` | Human-readable description               |
| `code`    | `NETWORK_ERROR` / `API_ERROR` / `STREAM_ERROR` |
| `status`  | HTTP status code (API errors only)       |
| `cause`   | Original underlying error                |

---

## Project Structure

```
thesys-sdk/
├── index.js               ← Public entry point (exports)
├── package.json
├── README.md
├── src/
│   ├── client/
│   │   └── ThesysClient.js  ← Core class with arrow methods
│   ├── config/
│   │   └── defaults.js      ← Default URL & headers
│   └── utils/
│       ├── parser.js        ← SSE chunk parser & output cleaner
│       └── ThesysError.js   ← Custom error class
└── examples/
    ├── basic.js             ← Simple request/response
    ├── streaming.js         ← onMessage callback + async iterator
    └── history.js           ← Multi-turn conversation & reset
```

---

## Examples

```bash
node examples/basic.js
node examples/streaming.js
node examples/history.js
```
