import { rm } from "node:fs/promises";

const targets = ["_site", "public/search-index.json"];

for (const target of targets) {
  try {
    await rm(target, { recursive: true, force: true });
    console.log(`cleaned ${target}`);
  } catch (err) {
    console.warn(`could not clean ${target}: ${err.message}`);
  }
}
