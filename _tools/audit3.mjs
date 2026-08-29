import { chromium } from './node_modules/playwright-core/index.mjs';

const BASE = 'http://localhost:3000';
const routes = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ['/explore', '/category/Birthday', '/', '/packages', '/wishlist'];

const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1440, height: 1000 } })).newPage();
const net4xx = [];
page.on('response', (r) => {
  if (/\.(jpe?g|png|webp|gif|svg)(\?|$)/i.test(r.url()) && r.status() >= 400) net4xx.push(`${r.status()} ${r.url()}`);
});

for (const path of routes) {
  net4xx.length = 0;
  await page.goto(BASE + path, { waitUntil: 'domcontentloaded', timeout: 45000 });
  // thorough slow scroll: small steps, wait for network to settle at each
  await page.evaluate(async () => {
    const step = 350;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 450));
    }
  });
  await page.waitForTimeout(5000);
  const s = await page.evaluate(() => {
    const imgs = [...document.images].filter((i) => {
      const r = i.getBoundingClientRect();
      return r.width >= 40 && r.height >= 40;
    });
    const failed = imgs.filter((i) => i.complete && i.naturalWidth === 0);
    const pending = imgs.filter((i) => !i.complete);
    return {
      content: imgs.length,
      failed: failed.length,
      failedSrc: [...new Set(failed.map((i) => i.currentSrc || i.src))].slice(0, 20),
      pending: pending.length,
      pendingSrc: [...new Set(pending.map((i) => i.currentSrc || i.src))].slice(0, 8),
    };
  });
  console.log(`\n${path}`);
  console.log(`  content=${s.content}  FAILED=${s.failed}  pending=${s.pending}  net4xx=${net4xx.length}`);
  s.failedSrc.forEach((x) => console.log('   FAILED', x));
  s.pendingSrc.forEach((x) => console.log('   pending', x));
  net4xx.slice(0, 10).forEach((x) => console.log('   NET', x));
}
await browser.close();
