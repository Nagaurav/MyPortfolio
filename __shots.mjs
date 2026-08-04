import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE = process.argv[2] || 'http://localhost:5199';
const OUT = process.argv[3];
fs.mkdirSync(OUT, { recursive: true });

const ROUTES = [
  ['home', '/'],
  ['projects', '/projects'],
  ['skills', '/skills'],
  ['experience', '/experience'],
  ['certificates', '/certificates'],
  ['resume', '/resume'],
  ['contact', '/contact'],
  ['notfound', '/nope'],
  ['login', '/admin/login'],
];

const browser = await chromium.launch();

for (const theme of ['dark', 'light']) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(t => localStorage.setItem('theme', t), theme);
  const page = await ctx.newPage();

  for (const [name, path] of ROUTES) {
    await page.goto(BASE + path, { waitUntil: 'networkidle' });
    await page.waitForTimeout(700);
    await page.screenshot({ path: `${OUT}/${theme}-${name}.png`, fullPage: false });
  }
  await ctx.close();
}

// Mobile pass, dark only
const m = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
await m.addInitScript(() => localStorage.setItem('theme', 'dark'));
const mp = await m.newPage();
for (const [name, path] of [['home', '/'], ['projects', '/projects'], ['contact', '/contact']]) {
  await mp.goto(BASE + path, { waitUntil: 'networkidle' });
  await mp.waitForTimeout(600);
  await mp.screenshot({ path: `${OUT}/mobile-${name}.png` });
}
await m.close();

await browser.close();
console.log('done');
