// examples/streaming.js
// Live streaming — two approaches shown side by side.

import { ThesysClient } from "../index.js";

const client = new ThesysClient();

// ── Approach 1: onMessage callback ────────────────────────────────────────
console.log("── onMessage callback ──");
process.stdout.write("Response: ");

await client.run("Explain quantum entanglement in one sentence.", {
  onMessage: (chunk) => process.stdout.write(chunk),
});

console.log("\n");
client.reset();

// ── Approach 2: async iterator ────────────────────────────────────────────
console.log("── async iterator ──");
process.stdout.write("Response: ");

for await (const fragment of client.stream("What is the speed of light?")) {
  process.stdout.write(fragment);
}

console.log();
