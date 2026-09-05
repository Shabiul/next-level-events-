// One-off batch job: recompress every image under NLE-frontend/public to
// JPEG, capped at ~400KB (floor ~100KB is best-effort, never upscaled to
// reach it). Renames non-.jpg files to .jpg and reports the rename map so
// source references can be fixed up afterwards.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'd:/d/next-level-events-/NLE/public';
const MIN = 100 * 1024;
const MAX = 400 * 1024;
const MAX_DIM = 1600;

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (/\.(jpe?g|png|webp)$/i.test(entry.name)) out.push(p);
  }
  return out;
}

function ffmpegToJpeg(src, dst, quality) {
  execFileSync('ffmpeg', [
    '-y', '-loglevel', 'error',
    '-i', src,
    '-vf', `scale='min(${MAX_DIM},iw)':-2:flags=lanczos`,
    '-q:v', String(quality),
    '-f', 'mjpeg',
    dst,
  ]);
}

const files = walk(ROOT);
console.log(`found ${files.length} images`);

const renames = [];
let processed = 0, skipped = 0, shrunk = 0;

for (const src of files) {
  const ext = path.extname(src);
  const dst = ext.toLowerCase() === '.jpg' ? src : src.slice(0, -ext.length) + '.jpg';
  const tmp = dst + '.tmp';

  // Binary-search the mjpeg quality scale (2=best .. 31=worst) to land <=MAX.
  let lo = 2, hi = 31, q = 6, lastSize = Infinity;
  for (let i = 0; i < 6; i++) {
    q = Math.round((lo + hi) / 2);
    try {
      ffmpegToJpeg(src, tmp, q);
    } catch (e) {
      console.error(`FAILED ${src}:`, e.message);
      break;
    }
    lastSize = fs.statSync(tmp).size;
    if (lastSize > MAX) lo = q + 1;
    else if (lastSize < MIN) hi = q - 1;
    else break;
    if (lo > hi) break;
  }

  if (!fs.existsSync(tmp)) { skipped++; continue; }

  const originalSize = fs.statSync(src).size;
  fs.renameSync(tmp, dst);
  if (dst !== src) {
    fs.unlinkSync(src);
    renames.push({ from: path.relative(ROOT, src), to: path.relative(ROOT, dst) });
  }
  processed++;
  if (lastSize < originalSize) shrunk++;
  if (processed % 50 === 0) console.log(`... ${processed}/${files.length}`);
}

console.log(`done. processed=${processed} skipped=${skipped} shrunk=${shrunk} renamed=${renames.length}`);
fs.writeFileSync('d:/d/next-level-events-/_tools/image-renames.json', JSON.stringify(renames, null, 2));
