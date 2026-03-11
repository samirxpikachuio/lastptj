// examples/basic.js
// Simplest usage: send a message, get back the full response.

import { ThesysClient } from "../index.js";

const client = new ThesysClient();

const reply = await client.run("What is love?");
console.log("Reply:", reply);
