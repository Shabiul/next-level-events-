import { chromium } from './node_modules/playwright-core/index.mjs';
import fs from 'fs';

const BASE = 'http://localhost:3000';
const PID = '6a7725f9cd457ad8eff36e89'; // Car Theme
const OUT = 'shots4';
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1440, height: 1000 } })).newPage();
const net4xx = [];
page.on('response', (r) => {
  if (/\.(jpe?g|png|webp|gif|svg)(\?|$)/i.test(r.url()) && r.status() >= 400) net4xx.push(`${r.status()} ${r.url()}`);
});

async function scan(label) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 350)); }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(3500);
  const s = await page.evaluate(() => {
    const imgs = [...document.images].filter((i) => { const r = i.getBoundingClientRect(); return r.width >= 40 && r.height >= 40; });
    const failed = imgs.filter((i) => i.complete && i.naturalWidth === 0);
    return { content: imgs.length, failed: failed.length, failedSrc: [...new Set(failed.map(i => i.currentSrc || i.src))].slice(0, 12), pending: imgs.filter(i => !i.complete).length };
  });
  try { await page.screenshot({ path: `${OUT}/${label}.jpg`, fullPage: true, type: 'jpeg', quality: 50, timeout: 50000 }); } catch {}
  console.log(`${label.padEnd(20)} content=${s.content} FAILED=${s.failed} pending=${s.pending} net4xx=${net4xx.length}`);
  s.failedSrc.forEach(x => console.log('   FAILED', x));
  net4xx.slice(0, 8).forEach(x => console.log('   NET', x));
  net4xx.length = 0;
}

// 1. Product / service details
await page.goto(`${BASE}/product/${PID}`, { waitUntil: 'domcontentloaded' });
await scan('product-details');

// 2. Add to cart on the product page
for (const rx of [/add to cart/i, /add to bag/i, /book now/i]) {
  const btn = page.locator('button', { hasText: rx }).first();
  if (await btn.count()) { try { await btn.click({ timeout: 3000 }); break; } catch {} }
}
await page.waitForTimeout(1500);

// 3. Cart drawer (try a cart/bag toggle in the header)
const cartBtn = page.locator('header button, header a').filter({ has: page.locator('svg') });
try {
  await page.locator('[aria-label*="cart" i], [aria-label*="bag" i], button:has(svg.lucide-shopping-bag), button:has(svg.lucide-shopping-cart)').first().click({ timeout: 3000 });
} catch {}
await page.waitForTimeout(1500);
await scan('cart-drawer');

// 4. Wishlist page
await page.goto(`${BASE}/wishlist`, { waitUntil: 'domcontentloaded' });
await scan('wishlist');

// 5. AI planner
await page.goto(`${BASE}/ai-planner`, { waitUntil: 'domcontentloaded' });
await scan('ai-planner');

// 6. Book now
await page.goto(`${BASE}/booking/${PID}`, { waitUntil: 'domcontentloaded' });
await scan('booking');

// 7. checkout (may redirect to login)
await page.goto(`${BASE}/checkout`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(1500);
console.log('checkout URL after load:', page.url());
await scan('checkout');

// 8. a couple more category pages
for (const c of ['Kids Activities', 'Naming ceremony', 'Live Eateries', 'Baby Shower']) {
  await page.goto(`${BASE}/category/${encodeURIComponent(c)}`, { waitUntil: 'domcontentloaded' });
  await scan('cat-' + c.replace(/\W+/g, '').toLowerCase());
}

await browser.close();
