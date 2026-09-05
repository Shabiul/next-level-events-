import fs from 'node:fs';
import path from 'node:path';

function walk(dir, out = []) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) walk(p, out);
    else if (/\.(tsx?|jsx?|json)$/.test(f.name)) out.push(p);
  }
  return out;
}

const files = walk('NLE/src');
const referenced = new Set();
const regex = /["'`](\/[^"'`\s>]+\.(?:jpe?g|png|webp))["'`]/gi;

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  let m;
  while ((m = regex.exec(content)) !== null) {
    referenced.add(m[1]);
  }
}

console.log('Total unique referenced images in src:', referenced.size);
const missing = [];
const existing = [];

for (const img of Array.from(referenced).sort()) {
  const decoded = decodeURIComponent(img.replace(/^\//, ''));
  const pubPath = path.join('NLE/public', decoded);
  if (fs.existsSync(pubPath)) {
    const size = fs.statSync(pubPath).size;
    existing.push({ img, size: Math.round(size / 1024), path: pubPath });
  } else {
    missing.push(img);
  }
}

existing.sort((a, b) => b.size - a.size);
console.log('\nTop 20 largest existing images referenced in src:');
existing.slice(0, 20).forEach(x => console.log(`${x.img}: ${x.size}KB`));

if (missing.length > 0) {
  console.log('\nMissing images referenced in src:', missing.length);
  missing.forEach(m => console.log('  ', m));
}
