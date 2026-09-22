/**
 * Renders a designed 1200x630 cover banner for every project and writes them to
 * public/project-banners/<id>.jpg, plus a manifest the project cards read.
 *
 * Run after adding or renaming a project:  npm run banners
 *
 * Why generated rather than drawn by hand: the banner is built from fields the
 * project already has (title, short description, category, tech stack, cover
 * screenshot), so a project added in the admin panel gets a studio-looking card
 * without anyone opening a design tool. A raw screenshot on a card reads as a
 * screenshot; the same screenshot in a device frame on a branded ground reads as
 * a product.
 *
 * Uses the Playwright Chromium the e2e suite already depends on, and the same
 * publishable key the site uses -- projects are world-readable by policy, so
 * this needs no privileged credentials.
 */
import { chromium } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs/promises';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');
const outDir = path.join(root, 'public', 'project-banners');
const manifestPath = path.join(root, 'src', 'data', 'project-banners.json');

// --- env ---------------------------------------------------------------------
const env = Object.fromEntries(
  (await fs.readFile(path.join(root, '.env'), 'utf8'))
    .split(/\r?\n/)
    .filter(line => line.includes('=') && !line.trimStart().startsWith('#'))
    .map(line => {
      const at = line.indexOf('=');
      return [line.slice(0, at).trim(), line.slice(at + 1).trim()];
    })
);

const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY in .env');
  process.exit(1);
}

// --- palette -----------------------------------------------------------------
// Each project keeps the same ground across runs because the choice is derived
// from its id, not from its position in the list.
const PALETTES = [
  { from: '#0b2a3d', via: '#0e4b5e', accent: '#22d3ee', ink: '#e6fbff' },
  { from: '#2a1244', via: '#4a1d6b', accent: '#c084fc', ink: '#f5ecff' },
  { from: '#0c2f28', via: '#10543f', accent: '#34d399', ink: '#e7fff6' },
  { from: '#331709', via: '#5c2a0d', accent: '#fb923c', ink: '#fff2e6' },
  { from: '#12213f', via: '#1e3a6b', accent: '#60a5fa', ink: '#eaf2ff' },
  { from: '#3a0f23', via: '#631a38', accent: '#fb7185', ink: '#ffeaf0' },
];

function paletteFor(id) {
  let hash = 0;
  for (const ch of String(id)) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTES[hash % PALETTES.length];
}

const escapeHtml = value =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Trims a sentence to fit the banner without a word breaking mid-way. */
function clamp(text, max) {
  const clean = String(text ?? '').replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, clean.lastIndexOf(' ', max)).replace(/[,;:.]$/, '') + '…';
}

/**
 * Titles here read "ChakkiBook — Offline-First Billing for Flour Mills": the
 * product name, then a descriptor the tagline underneath already covers. The
 * banner wants the name alone, the way a wordmark works -- clamping the whole
 * string instead produced "ChakkiBook — Offline-First Billing for…".
 */
function wordmark(title) {
  const name = String(title ?? '').split(/\s[—–|:]\s|\s-\s/)[0].trim();
  return name.length >= 3 ? name : String(title ?? '').trim();
}

/** Long names need to step down or they wrap into three lines. */
function titleSize(name) {
  if (name.length <= 14) return 76;
  if (name.length <= 24) return 60;
  return 48;
}

function bannerHtml(project) {
  const p = paletteFor(project.id);
  const tech = (project.tech_stack ?? [])
    .flatMap(t => String(t).split(/[,·•|]+/))
    .map(t => t.trim())
    .filter(Boolean)
    .slice(0, 5);
  const shot = project.image_urls?.[0] || project.image_url || '';
  const name = wordmark(project.title);

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&family=JetBrains+Mono:wght@600&display=swap');
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        width: 1200px; height: 630px; overflow: hidden; position: relative;
        font-family: Inter, 'Segoe UI', system-ui, sans-serif;
        background: linear-gradient(135deg, ${p.from} 0%, ${p.via} 55%, ${p.from} 100%);
        color: ${p.ink};
      }
      /* Faint grid + glow, matching the site's own hero treatment. */
      .grid {
        position: absolute; inset: 0;
        background-image:
          linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px);
        background-size: 48px 48px;
        mask-image: radial-gradient(ellipse 80% 70% at 30% 50%, #000 30%, transparent 100%);
      }
      .glow {
        position: absolute; width: 700px; height: 700px; right: -140px; top: -220px;
        background: radial-gradient(circle, ${p.accent}33 0%, transparent 65%);
      }
      .copy { position: absolute; left: 72px; top: 96px; width: 560px; }
      body.landscape .copy { width: 430px; }
      body.noshot .copy { width: 840px; top: 150px; }
      body.noshot h1 { font-size: ${Math.min(titleSize(name) + 18, 96)}px; }
      body.noshot p.tagline { font-size: 26px; }
      body.noshot .stage { display: none; }
      body.landscape h1 { font-size: ${Math.min(titleSize(name), 50)}px; }
      body.landscape p.tagline { font-size: 20px; }
      .eyebrow {
        display: inline-flex; align-items: center; gap: 8px;
        font-family: 'JetBrains Mono', monospace; font-size: 15px; font-weight: 600;
        letter-spacing: .16em; text-transform: uppercase; color: ${p.accent};
      }
      .eyebrow i { width: 7px; height: 7px; border-radius: 99px; background: ${p.accent}; }
      h1 {
        margin-top: 20px; font-size: ${titleSize(name)}px; line-height: 1.04; font-weight: 900;
        letter-spacing: -.03em;
      }
      p.tagline {
        margin-top: 20px; font-size: 22px; line-height: 1.45; font-weight: 400;
        color: ${p.ink}b8;
      }
      .chips { margin-top: 30px; display: flex; flex-wrap: wrap; gap: 9px; }
      .chip {
        font-family: 'JetBrains Mono', monospace; font-size: 14px; font-weight: 600;
        padding: 7px 14px; border-radius: 99px;
        color: ${p.accent}; border: 1px solid ${p.accent}4d; background: ${p.accent}14;
      }
      /* Device frames: a portrait capture gets a phone, anything else a browser
         window. Without a frame the screenshot floats and reads as a leftover. */
      .stage { position: absolute; right: 0; top: 0; width: 520px; height: 630px; }
      .phone {
        position: absolute; right: 74px; top: 62px; width: 286px; height: 580px;
        border-radius: 42px; padding: 11px; background: #0b0f14;
        box-shadow: 0 40px 90px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.09) inset;
        transform: rotate(-7deg);
      }
      .phone .screen {
        width: 100%; height: 100%; border-radius: 32px; overflow: hidden; background: #fff;
      }
      .browser {
        position: absolute; right: 40px; top: 168px; width: 590px;
        border-radius: 14px; overflow: hidden; background: #0b0f14;
        box-shadow: 0 40px 90px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.09) inset;
      }
      .bar { height: 34px; display: flex; align-items: center; gap: 7px; padding: 0 14px; background: #131a22; }
      .bar b { width: 10px; height: 10px; border-radius: 99px; background: #2b3947; display: block; }
      .browser .screen { height: 330px; background: #fff; }
      .screen img { width: 100%; height: 100%; object-fit: cover; object-position: top center; display: block; }
      .empty { width: 100%; height: 100%; background: linear-gradient(135deg, ${p.via}, ${p.from}); }
    </style>
  </head>
  <body>
    <div class="grid"></div>
    <div class="glow"></div>

    <div class="copy">
      <span class="eyebrow"><i></i>${escapeHtml(clamp(project.category || 'Project', 28))}</span>
      <h1>${escapeHtml(name)}</h1>
      <p class="tagline">${escapeHtml(clamp(project.short_description || project.description, 95))}</p>
      <div class="chips">
        ${tech.map(t => `<span class="chip">${escapeHtml(t)}</span>`).join('')}
      </div>
    </div>

    <div class="stage">
      <div id="phone" class="phone" style="display:none">
        <div class="screen">${shot ? `<img id="shotP" src="${escapeHtml(shot)}" />` : '<div class="empty"></div>'}</div>
      </div>
      <div id="browser" class="browser" style="display:none">
        <div class="bar"><b></b><b></b><b></b></div>
        <div class="screen">${shot ? `<img id="shotB" src="${escapeHtml(shot)}" />` : '<div class="empty"></div>'}</div>
      </div>
    </div>

    <script>
      // The frame is chosen from the image's real proportions, so a phone
      // capture never ends up letterboxed inside a browser chrome.
      window.__ready = (async () => {
        const src = ${JSON.stringify(shot)};
        if (!src) {
          document.body.classList.add('noshot');
          await document.fonts.ready;
          return true;
        }
        let portrait = true;
        if (src) {
          portrait = await new Promise(resolve => {
            const probe = new Image();
            probe.onload = () => resolve(probe.naturalHeight >= probe.naturalWidth);
            probe.onerror = () => resolve(true);
            probe.src = src;
          });
        }
        document.getElementById(portrait ? 'phone' : 'browser').style.display = 'block';
        if (!portrait) document.body.classList.add('landscape');
        await document.fonts.ready;
        const img = document.querySelector('.stage img');
        if (img && !img.complete) await new Promise(r => { img.onload = r; img.onerror = r; });
        return true;
      })();
    </script>
  </body>
</html>`;
}

// --- fetch -------------------------------------------------------------------
const query =
  '/rest/v1/projects?select=id,title,short_description,description,category,tech_stack,image_url,image_urls&order=created_at.desc';
const response = await fetch(SUPABASE_URL + query, {
  headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY },
});
if (!response.ok) {
  console.error('Could not read projects:', response.status, await response.text());
  process.exit(1);
}
const projects = await response.json();
console.log('Found ' + projects.length + ' projects');

// --- render ------------------------------------------------------------------
await fs.mkdir(outDir, { recursive: true });
await fs.mkdir(path.dirname(manifestPath), { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });

const manifest = {};
for (const project of projects) {
  await page.setContent(bannerHtml(project), { waitUntil: 'networkidle' });
  await page.evaluate(() => window.__ready);
  await page.waitForTimeout(250);

  const file = project.id + '.jpg';
  await page.screenshot({ path: path.join(outDir, file), type: 'jpeg', quality: 90 });
  manifest[project.id] = '/project-banners/' + file;
  console.log('  ✓ ' + project.title);
}

await browser.close();
await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

console.log('\nWrote ' + projects.length + ' banners to public/project-banners/');
console.log('Manifest: ' + path.relative(root, manifestPath));
