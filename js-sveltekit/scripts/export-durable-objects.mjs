import { readFileSync, writeFileSync } from "node:fs";

const workerPath = ".svelte-kit/cloudflare/_worker.js";
const marker = "// DURABLE_OBJECTS_EXPORT - do not remove";
const exportLine =
  "export { ThreadSession } from '../../src/lib/server/durable-objects/thread-session.ts';";

const worker = readFileSync(workerPath, "utf8");

if (!worker.includes(marker)) {
  writeFileSync(workerPath, `${worker}\n${marker}\n${exportLine}\n`);
}
