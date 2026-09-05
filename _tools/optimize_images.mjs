import { execFile } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const ROOT = 'd:/d/next-level-events-/NLE/public';
const MAX_DIM = 1000;
const CONCURRENCY = 6;

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (/\.(jpe?g|png)$/i.test(entry.name)) out.push(p);
  }
  return out;
}

async function convertToWebp(src) {
  const dst = src.replace(/\.(jpe?g|png)$/i, '.webp');
  // Don't regenerate if webp already exists and is newer than src
  if (fs.existsSync(dst)) {
    const srcMtime = fs.statSync(src).mtimeMs;
    const dstMtime = fs.statSync(dst).mtimeMs;
    if (dstMtime >= srcMtime) return { skipped: true, src };
  }

  const tmp = dst + '.tmp.webp';
  try {
    await execFileAsync('ffmpeg', [
      '-y', '-loglevel', 'error',
      '-i', src,
      '-vf', `scale='min(${MAX_DIM},iw)':-2:flags=lanczos`,
      '-vcodec', 'libwebp',
      '-quality', '76',
      tmp
    ]);
    if (fs.existsSync(tmp)) {
      const origSize = fs.statSync(src).size;
      const webpSize = fs.statSync(tmp).size;
      // If webp is smaller or within reasonable range, keep it
      if (webpSize < origSize * 1.05) {
        fs.renameSync(tmp, dst);
        return { success: true, origSize, webpSize, src, dst };
      } else {
        if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
        return { skipped: true, src, reason: 'webp not smaller' };
      }
    }
  } catch (e) {
    if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
    return { error: e.message, src };
  }
  return { skipped: true, src };
}

async function run() {
  const files = walk(ROOT);
  console.log(`Found ${files.length} images to optimize into WebP.`);

  let totalOrig = 0;
  let totalWebp = 0;
  let convertedCount = 0;
  let errorCount = 0;

  // Process in chunks of CONCURRENCY
  for (let i = 0; i < files.length; i += CONCURRENCY) {
    const chunk = files.slice(i, i + CONCURRENCY);
    const results = await Promise.all(chunk.map(f => convertToWebp(f)));
    for (const res of results) {
      if (res.success) {
        convertedCount++;
        totalOrig += res.origSize;
        totalWebp += res.webpSize;
      } else if (res.error) {
        errorCount++;
        console.error(`Error converting ${res.src}:`, res.error);
      }
    }
    if ((i + CONCURRENCY) % 60 === 0 || i + CONCURRENCY >= files.length) {
      console.log(`Progress: ${Math.min(i + CONCURRENCY, files.length)} / ${files.length} processed...`);
    }
  }

  console.log(`\n=== WebP Generation Completed ===`);
  console.log(`Converted: ${convertedCount} images`);
  console.log(`Original size: ${(totalOrig / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`WebP size: ${(totalWebp / (1024 * 1024)).toFixed(2)} MB`);
  if (totalOrig > 0) {
    console.log(`Bandwidth saved: ${((1 - totalWebp / totalOrig) * 100).toFixed(1)}%`);
  }
  console.log(`Errors: ${errorCount}`);
}

run().catch(console.error);
