import { chromium } from './node_modules/playwright-core/index.mjs';
import fs from 'fs';

const BASE = 'http://localhost:3000';
const OUT = '_tools/shots2';
fs.mkdirSync(OUT, { recursive: true });

const routes = [
  ['home', '/'],
  ['explore', '/explore'],
  ['packages', '/packages'],
  ['cat-birthday', '/category/Birthday'],
  ['cat-1stbday', '/category/1st%20Birthday'],
  ['cat-anniversary', '/category/Anniversary%20Celebrations'],
  ['cat-prepost', '/category/Pre%20%26%20Post%20Wedding%20decors'],
];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
const netFail = [];
page.on('response', (r) => {
  if (/\.(jpe?g|png|webp|gif|svg)(\?|$)/i.test(r.url()) && r.status() >= 400) netFail.push(`${r.status()} ${r.url()}`);
});

const out = [];
for (const [name, path] of routes) {
  netFail.length = 0;
  try {
    await page.goto(BASE + path, { waitUntil: 'domcontentloaded', timeout: 45000 });
  } catch (e) { out.push({ name, error: String(e).slice(0, 100) }); continue; }

  // scroll the whole page slowly so every lazy image gets a chance
  await page.evaluate(async () => {
    const h = document.body.scrollHeight;
    for (let y = 0; y < h; y += 500) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 200)); }
    window.scrollTo(0, 0);
    await new Promise(r => setTimeout(r, 400));
  });
  await page.waitForTimeout(3000);

  const stats = await page.evaluate(() => {
    const imgs = [...document.images].filter(i => {
      const r = i.getBoundingClientRect();
      return r.width >= 40 && r.height >= 40;   // real content images only
    });
    const failed = imgs.filter(i => i.complete && i.naturalWidth === 0); // genuine load failure
    const pending = imgs.filter(i => !i.complete);                       // still loading after scroll+wait
    return {
      contentImgs: imgs.length,
      failed: failed.length,
      failedSrc: [...new Set(failed.map(i => i.currentSrc || i.src))].slice(0, 15),
      pending: pending.length,
      pendingSrc: [...new Set(pending.map(i => i.currentSrc || i.src))].slice(0, 10),
    };
  });
  try { await page.screenshot({ path: `${OUT}/${name}.jpg`, fullPage: true, type: 'jpeg', quality: 50, timeout: 60000 }); } catch {}
  out.push({ name, path, ...stats, netFail: [...netFail] });
}

await browser.close();
fs.writeFileSync(`${OUT}/report.json`, JSON.stringify(out, null, 2));
for (const r of out) {
  console.log(`${(r.name||'').padEnd(16)} imgs=${r.contentImgs ?? '-'}  FAILED=${r.failed ?? '-'}  pending=${r.pending ?? '-'}  net4xx=${(r.netFail||[]).length}  ${r.error||''}`);
  if (r.failedSrc?.length) r.failedSrc.forEach(s => console.log('    FAILED:', s));
  if (r.netFail?.length) r.netFail.slice(0,6).forEach(s => console.log('    NET:', s));
}
