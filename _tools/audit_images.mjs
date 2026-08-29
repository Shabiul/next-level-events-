import { chromium } from './node_modules/playwright-core/index.mjs';
import fs from 'fs';

const BASE = 'http://localhost:3000';
const OUT = '_tools/shots';
fs.mkdirSync(OUT, { recursive: true });

const routes = [
  ['home', '/'],
  ['explore', '/explore'],
  ['packages', '/packages'],
  ['gallery', '/gallery'],
  ['cat-birthday', '/category/Birthday'],
  ['cat-babyshower', '/category/Baby%20Shower'],
  ['cat-simplewall', '/category/Simple%20wall%20decors'],
  ['cat-kidsact', '/category/Kids%20Activities'],
  ['cat-liveeat', '/category/Live%20Eateries'],
  ['cat-welcomebaby', '/category/Welcome%20Baby'],
];

const browser = await chromium.launch();
page_default_timeout: 0;
const page = await browser.newPage({ viewport: { width: 1440, height: 2600 } });
const failed = [];
page.on('response', (r) => {
  const u = r.url();
  if (/\.(jpe?g|png|webp|gif|svg)(\?|$)/i.test(u) && r.status() >= 400) {
    failed.push(`${r.status()} ${u}`);
  }
});

const summary = [];
for (const [name, path] of routes) {
  failed.length = 0;
  try {
    await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 45000 });
  } catch (e) {
    summary.push({ name, path, error: String(e).slice(0, 120) });
    continue;
  }
  // scroll to trigger lazy images
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 700) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1500);

  const stats = await page.evaluate(() => {
    const imgs = [...document.images];
    const vis = imgs.filter((i) => {
      const r = i.getBoundingClientRect();
      return r.width > 20 && r.height > 20;
    });
    const broken = vis.filter((i) => !i.complete || i.naturalWidth === 0);
    const bgEls = [...document.querySelectorAll('*')].filter((el) => {
      const b = getComputedStyle(el).backgroundImage;
      return b && b.startsWith('url(');
    });
    return {
      total: imgs.length,
      visible: vis.length,
      broken: broken.length,
      brokenSrc: broken.slice(0, 12).map((i) => i.currentSrc || i.src),
      cssBg: bgEls.length,
    };
  });
  try { await page.screenshot({ path: `${OUT}/${name}.jpg`, quality: 55, type: 'jpeg', timeout: 15000 }); } catch { summary[summary.length] && 0; }
  summary.push({ name, path, ...stats, http404: [...failed] });
}

await browser.close();
console.log(JSON.stringify(summary, null, 2));
