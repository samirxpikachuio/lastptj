// examples/history.js
// Multi-turn conversation with history inspection and reset.

import { ThesysClient } from "../index.js";

const client = new ThesysClient();

// Turn 1
const r1 = await client.run("My name is Alex.");
console.log("Assistant:", r1);

// Turn 2 — model should remember the name
const r2 = await client.run("What is my name?");
console.log("Assistant:", r2);

// Inspect history
console.log("\n── Conversation history ──");
for (const msg of client.getHistory()) {
  console.log(`[${msg.role}] ${msg.content}`);
}

// Reset and verify history is cleared
client.reset();
console.log("\n── After reset ──");
console.log("History length:", client.getHistory().length); // 0

// Fresh conversation
const r3 = await client.run("Do you remember my name?");
console.log("Assistant:", r3);
