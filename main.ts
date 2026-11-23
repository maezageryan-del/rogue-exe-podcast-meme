// main.ts — ROGUE.EXE podcast-cover meme
// (u-steady-ibis-48-6610-meme-sprint-3-ai-agent-goes-d021cde6).
// Node 22 stdlib only. Copies entry.png byte-for-byte to
// $MAKEFUN_OUTPUT_DIR (default /output), verifies PNG magic bytes +
// 1024x1024 IHDR + the 1 MiB gate, exits 0. No network, no clock,
// no external dependencies. Deterministic: same entry.png in, same
// bytes out, every run.
import { copyFileSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, "entry.png");
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const dst = join(outDir, "entry.png");

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const MAX_BYTES = 1048576;

const data = readFileSync(src);
if (data.length < 8 || !data.subarray(0, 8).equals(PNG_MAGIC)) {
  console.error("entry.png: bad PNG magic bytes");
  process.exit(1);
}
if (data.length > MAX_BYTES) {
  console.error(`entry.png: ${data.length} bytes exceeds the 1 MiB gate`);
  process.exit(1);
}
const width = data.readUInt32BE(16);
const height = data.readUInt32BE(20);
if (width !== 1024 || height !== 1024) {
  console.error(`entry.png: expected 1024x1024, got ${width}x${height}`);
  process.exit(1);
}
mkdirSync(outDir, { recursive: true });
copyFileSync(src, dst);
const written = readFileSync(dst);
if (!written.equals(data)) {
  console.error("output bytes differ from entry.png");
  process.exit(1);
}
const size = statSync(dst).size;
console.log(`entry.png -> ${dst} (${size} bytes, PNG OK)`);
