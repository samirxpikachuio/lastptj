// index.js — thesys-sdk public entry point

/**
 * @module thesys-sdk
 */

/**
 * Re-export of the core client class.
 */
export { ThesysClient } from "./src/client/ThesysClient.js";

/**
 * Re-export of the custom error class.
 */
export { ThesysError } from "./src/utils/ThesysError.js";

/**
 * Re-export of configuration defaults.
 */
export { DEFAULT_URL, DEFAULT_HEADERS } from "./src/config/defaults.js";
