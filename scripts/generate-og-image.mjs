/**
 * Renders scripts/og-image.html to public/og-image.jpg at the 1200x630 size
 * Open Graph and Twitter expect.
 *
 * Run after editing the template:  npm run og
 *
 * Uses the Playwright Chromium that the e2e suite already depends on, so this
 * adds no new dependency. Requires `npx playwright install chromium` once.
 */
import { chromium } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const template = path.join(here, 'og-image.html');
const output = path.join(here, '..', 'public', 'og-image.jpg');

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
});

await page.goto('file://' + template.split(path.sep).join('/'));
await page.screenshot({ path: output, type: 'jpeg', quality: 92 });
await browser.close();

console.log('Wrote ' + path.relative(process.cwd(), output) + ' (1200x630)');
