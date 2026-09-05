import { chromium } from './node_modules/playwright-core/index.mjs';
const browser = await chromium.launch({ executablePath: 'C:/Users/Shabiul/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe' });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
const page = await ctx.newPage();

await page.goto('http://localhost:3000/product/6a7725f9cd457ad8eff36e89', { waitUntil: 'networkidle', timeout: 45000 });
await page.waitForTimeout(1200);

const fullViewBtn = await page.$('button:has-text("Full View")');
await fullViewBtn.click();
await page.waitForTimeout(700);
await page.screenshot({ path: 'pdp-fullview.png' });

const closeBtn = await page.$('button[aria-label="Close"]');
console.log('close button found:', !!closeBtn);
if (closeBtn) {
  console.log('box:', await closeBtn.boundingBox());
  await closeBtn.click();
  await page.waitForTimeout(500);
  console.log('still open after close click:', await page.$('button[aria-label="Close"]') !== null);
}
await browser.close();
