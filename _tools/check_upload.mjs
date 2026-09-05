import { chromium } from './node_modules/playwright-core/index.mjs';
const browser = await chromium.launch({ executablePath: 'C:/Users/Shabiul/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe' });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', e => errors.push(String(e)));

await page.goto('http://localhost:3001/', { waitUntil: 'networkidle', timeout: 45000 });
await page.fill('input[type="email"]', 'admin@thedecorparty.com');
await page.fill('input[type="password"]', 'DecorAdmin@2026');
await page.click('button:has-text("Sign In with Password")');
await page.waitForTimeout(1500);

await page.click('text=Categories');
await page.waitForTimeout(800);
await page.click('text=+ Add Category');
await page.waitForTimeout(500);
await page.screenshot({ path: 'category-modal-fixed.png' });

// actually upload a file through the real UI
const fileInput = await page.$('#cat-image-upload');
await fileInput.setInputFiles('C:/Users/Shabiul/AppData/Local/Temp/claude/d--d-next-level-events-/4fdcd925-fee0-4658-8508-8101f0a58aeb/scratchpad/test.png');
await page.waitForTimeout(2500);
await page.screenshot({ path: 'category-modal-uploaded.png' });

console.log('errors:', errors);
await browser.close();
