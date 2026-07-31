/**
 * Copies large third-party runtime assets out of node_modules into public/ so
 * they ship from our own origin instead of a CDN.
 *
 * Both targets are gitignored — a 32MB wasm binary and a 1MB worker bundle
 * have no business in the repo when npm already pins their versions. Runs
 * from predev/prebuild.
 */

import { mkdir, copyFile, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const BUNDLES = [
  {
    label: "ffmpeg",
    source: join(root, "node_modules", "@ffmpeg", "core", "dist", "esm"),
    target: join(root, "public", "ffmpeg"),
    files: ["ffmpeg-core.js", "ffmpeg-core.wasm"],
    hint: "@ffmpeg/core",
  },
  {
    // The worker @ffmpeg/ffmpeg would otherwise construct via
    // `new URL("./worker.js", import.meta.url)`. Turbopack cannot resolve
    // that and fails the load with "expression is too dynamic", so we serve
    // the worker ourselves and hand its URL over as `classWorkerURL`.
    // worker.js imports only these two flat siblings — no deeper tree.
    label: "ffmpeg-worker",
    source: join(root, "node_modules", "@ffmpeg", "ffmpeg", "dist", "esm"),
    target: join(root, "public", "ffmpeg"),
    files: ["worker.js", "const.js", "errors.js"],
    hint: "@ffmpeg/ffmpeg",
  },
  {
    label: "pdfjs",
    source: join(root, "node_modules", "pdfjs-dist", "build"),
    target: join(root, "public", "pdfjs"),
    files: ["pdf.worker.min.mjs"],
    hint: "pdfjs-dist",
  },
];

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

for (const bundle of BUNDLES) {
  if (!(await exists(bundle.source))) {
    console.error(
      `[${bundle.label}] ${bundle.hint} is not installed. Run \`npm install\` before building.`
    );
    process.exit(1);
  }

  await mkdir(bundle.target, { recursive: true });

  for (const file of bundle.files) {
    const from = join(bundle.source, file);
    const to = join(bundle.target, file);

    // Skip when the copy is already current — this runs on every dev start.
    if (await exists(to)) {
      const [a, b] = await Promise.all([stat(from), stat(to)]);
      if (a.size === b.size) continue;
    }

    await copyFile(from, to);
    console.log(`[${bundle.label}] copied ${file}`);
  }
}
