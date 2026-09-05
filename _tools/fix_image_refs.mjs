// Fix every source reference to a file that compress_images.mjs renamed
// (.png/.jpeg -> .jpg). Plain string replacement (filenames have spaces,
// parens, etc. -- not safe as regex) across NLE-frontend/src and index.html.
import fs from 'node:fs';
import path from 'node:path';

const renames = JSON.parse(fs.readFileSync('d:/d/next-level-events-/_tools/image-renames.json', 'utf8'));
const SRC_DIRS = ['d:/d/next-level-events-/NLE/src'];
const EXTRA_FILES = ['d:/d/next-level-events-/NLE/index.html'];

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (/\.(tsx?|jsx?|html|json)$/i.test(entry.name)) out.push(p);
  }
  return out;
}

const files = SRC_DIRS.flatMap((d) => walk(d)).concat(EXTRA_FILES.filter((f) => fs.existsSync(f)));

let filesChanged = 0;
let totalReplacements = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  for (const { from, to } of renames) {
    if (content.includes(from)) {
      const count = content.split(from).length - 1;
      content = content.split(from).join(to);
      totalReplacements += count;
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(file, content);
    filesChanged++;
    console.log(`updated ${path.relative('d:/d/next-level-events-', file)}`);
  }
}

console.log(`\ndone. filesChanged=${filesChanged} totalReplacements=${totalReplacements}`);
