#!/usr/bin/env node
/*
  Landing Kit — MOTION PROBE
  ---------------------------------------------------------------
  Investigates a website like a curious developer would with DevTools open:
  which libraries it uses, which elements are sticky/pinned, and — the useful
  part — which elements CHANGE as you scroll (transform, opacity, clip-path,
  filter) and by how much. That is how you find "the image zooms inside its
  container", "the card scales up while pinned", "captions fade in and out".

  Usage:
    npm run probe -- --url https://www.example.com            # report to brief/inspiration/<host>-probe.md
    npm run probe -- --url https://www.example.com --width 390 # mobile behaviour
    npm run probe                                              # probe the local dev server (check your own motion)

  Reads the report afterwards and translate findings into recipes from the motion skill.
  Note: some sites block headless browsers; if the page never loads, ask the designer
  to describe what moves, or use a real browser session if available.
*/

import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  if (i === -1) return fallback;
  const v = args[i + 1];
  return v && !v.startsWith('--') ? v : true;
};

const url = opt('url', 'http://localhost:4321');
const width = Number(opt('width', 1440));
const height = width < 768 ? 844 : 900;
const host = url.startsWith('http://localhost') ? 'local' : new URL(url).hostname.replace(/^www\./, '');
const outDir = 'brief/inspiration';
await mkdir(outDir, { recursive: true });

const launchOptions = {};
if (process.env.PW_EXECUTABLE_PATH) launchOptions.executablePath = process.env.PW_EXECUTABLE_PATH;
const browser = await chromium.launch(launchOptions);
const page = await browser.newPage({ viewport: { width, height } });

try {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
} catch {
  await page.goto(url, { waitUntil: 'load', timeout: 45000 });
}
await page.waitForTimeout(1500);

// ---------- 1. Static facts ----------
const facts = await page.evaluate(() => {
  const libs = {
    gsap: !!window.gsap, ScrollTrigger: !!window.ScrollTrigger, lenis: !!(window.lenis || window.Lenis),
    three: !!window.THREE, framerMotion: !!document.querySelector('[data-framer-name],[data-projection-id]'),
    webflow: !!window.Webflow, next: !!document.querySelector('script[src*="_next/"]'), nuxt: !!window.__NUXT__,
    swiper: !!document.querySelector('.swiper'), splide: !!document.querySelector('.splide'),
  };
  const scriptHints = [...document.scripts].map((s) => s.src).filter(Boolean)
    .map((s) => s.split('/').pop().split('?')[0]).filter((n) => /gsap|lenis|three|motion|swiper|splide|locomotive|barba|lottie|rive/i.test(n));
  const fontsUsed = [...new Set([...document.querySelectorAll('h1,h2,h3,p,a,button,span,li')].map((el) => getComputedStyle(el).fontFamily.split(',')[0].replace(/"/g, '')))];
  const type = {};
  for (const sel of ['h1', 'h2', 'h3', 'p']) {
    const el = document.querySelector(sel);
    if (!el) continue;
    const cs = getComputedStyle(el);
    type[sel] = { family: cs.fontFamily.split(',')[0].replace(/"/g, ''), size: cs.fontSize, weight: cs.fontWeight, lineHeight: cs.lineHeight, letterSpacing: cs.letterSpacing, style: cs.fontStyle };
  }
  const htmlFont = getComputedStyle(document.documentElement).fontSize;
  const bgs = {};
  document.querySelectorAll('body, section, header, footer, main > div').forEach((el) => {
    const b = getComputedStyle(el).backgroundColor; if (b && b !== 'rgba(0, 0, 0, 0)') bgs[b] = (bgs[b] || 0) + 1;
  });
  const sticky = [...document.querySelectorAll('*')].filter((el) => ['sticky', 'fixed'].includes(getComputedStyle(el).position))
    .map((el) => ({ tag: el.tagName.toLowerCase(), id: el.id, cls: String(el.className).slice(0, 60), h: el.offsetHeight }))
    .filter((e) => e.h > 0).slice(0, 12);
  const radii = {};
  document.querySelectorAll('img, video, picture, [class*="card"], [class*="Card"]').forEach((el) => {
    const r = getComputedStyle(el).borderRadius; if (r && r !== '0px') radii[r] = (radii[r] || 0) + 1;
  });
  return {
    title: document.title, libs, scriptHints, fontsUsed, type, htmlFont, bgs, sticky, radii,
    videos: document.querySelectorAll('video').length, canvases: document.querySelectorAll('canvas').length,
    svgs: document.querySelectorAll('svg').length, pageHeight: document.documentElement.scrollHeight,
    sections: [...document.querySelectorAll('section, header, footer')].map((s) => ({
      tag: s.tagName.toLowerCase(), id: s.id, top: Math.round(s.getBoundingClientRect().top + scrollY), h: s.offsetHeight,
      heading: (s.querySelector('h1,h2,h3')?.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 70),
    })).filter((s) => s.h > 40),
  };
});

// ---------- 2. Motion probe: sample element styles while scrolling ----------
await page.evaluate(() => {
  document.documentElement.style.scrollBehavior = 'auto';
  // tag candidate elements once so we can find them again
  let i = 0;
  document.querySelectorAll('section *, header *, footer *').forEach((el) => {
    if (el.children.length > 30) return; // skip huge containers
    const r = el.getBoundingClientRect();
    if (r.width < 24 || r.height < 24) return;
    el.setAttribute('data-probe', String(i++));
  });
});

const steps = 24;
const total = facts.pageHeight;
const samples = [];
for (let s = 0; s <= steps; s++) {
  const y = Math.round((total - height) * (s / steps));
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.waitForTimeout(350);
  const snap = await page.evaluate(() => {
    const out = {};
    document.querySelectorAll('[data-probe]').forEach((el) => {
      const cs = getComputedStyle(el);
      out[el.getAttribute('data-probe')] = [cs.transform, cs.opacity, cs.clipPath, cs.filter, Math.round(el.getBoundingClientRect().width)].join('|');
    });
    return out;
  });
  samples.push({ y, snap });
}

// which elements changed, and how
const changes = {};
for (let s = 1; s < samples.length; s++) {
  const a = samples[s - 1].snap, b = samples[s].snap;
  for (const id of Object.keys(b)) {
    if (a[id] !== undefined && a[id] !== b[id]) {
      (changes[id] ||= { count: 0, first: samples[s - 1].y, last: samples[s].y, from: a[id], to: b[id] });
      changes[id].count++; changes[id].last = samples[s].y; changes[id].to = b[id];
    }
  }
}
const ids = Object.keys(changes).sort((p, q) => changes[q].count - changes[p].count).slice(0, 30);
const described = await page.evaluate((ids) => ids.map((id) => {
  const el = document.querySelector(`[data-probe="${id}"]`);
  if (!el) return null;
  const parent = el.closest('section, header, footer');
  return {
    id, tag: el.tagName.toLowerCase(), cls: String(el.className).slice(0, 50), text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40),
    isMedia: /^(img|video|canvas|picture)$/.test(el.tagName.toLowerCase()) || !!el.querySelector('img,video,canvas'),
    section: parent ? (parent.id || (parent.querySelector('h1,h2,h3')?.textContent || parent.tagName).trim().replace(/\s+/g, ' ').slice(0, 40)) : '',
    overflowHiddenParent: !!el.parentElement && getComputedStyle(el.parentElement).overflow.includes('hidden'),
  };
}), ids);

await browser.close();

// ---------- 3. Interpret ----------
function interpret(c, d) {
  const [tf1, op1, cp1, f1, w1] = c.from.split('|');
  const [tf2, op2, cp2, f2, w2] = c.to.split('|');
  const notes = [];
  const m1 = parseMatrix(tf1), m2 = parseMatrix(tf2);
  if (m1 && m2) {
    if (Math.abs(m1.scale - m2.scale) > 0.02) notes.push(`scale ${m1.scale.toFixed(2)}→${m2.scale.toFixed(2)}${d.isMedia && d.overflowHiddenParent ? ' (media zoom inside a clipped container)' : ''}`);
    if (Math.abs(m1.ty - m2.ty) > 4) notes.push(`moves vertically ${Math.round(m1.ty)}→${Math.round(m2.ty)}px (parallax / reveal)`);
    if (Math.abs(m1.tx - m2.tx) > 4) notes.push(`moves horizontally ${Math.round(m1.tx)}→${Math.round(m2.tx)}px (horizontal scroll / marquee)`);
  } else if (tf1 !== tf2) notes.push('transform changes');
  if (op1 !== op2) notes.push(`opacity ${op1}→${op2} (fade)`);
  if (cp1 !== cp2) notes.push('clip-path changes (mask / morph)');
  if (f1 !== f2) notes.push('filter changes (blur / colour)');
  if (w1 !== w2) notes.push(`width ${w1}→${w2}px (resizes)`);
  const scrub = c.count > 4 ? 'continuous while scrolling (scrub)' : 'once (entrance / toggle)';
  return { notes, scrub };
}
function parseMatrix(t) {
  const m = t && t.match(/matrix\(([^)]+)\)/);
  if (!m) return t === 'none' ? { scale: 1, tx: 0, ty: 0 } : null;
  const [a, b, , , tx, ty] = m[1].split(',').map(Number);
  return { scale: Math.hypot(a, b), tx, ty };
}

const lines = [];
lines.push(`# Motion probe — ${host} @ ${width}px`, '', `Captured: ${new Date().toISOString().slice(0, 10)} · Page height: ${facts.pageHeight}px · Videos: ${facts.videos} · Canvas: ${facts.canvases}`, '');
lines.push('## Libraries / stack', '', Object.entries(facts.libs).filter(([, v]) => v).map(([k]) => `- ${k}`).join('\n') || '- none detected on window (may be bundled)', facts.scriptHints.length ? `- script hints: ${facts.scriptHints.join(', ')}` : '', '');
lines.push('## Typography', '', `- html font-size: ${facts.htmlFont} (if not 16px → proportional/fluid rem scaling)`, `- families in use: ${facts.fontsUsed.join(', ')}`);
for (const [sel, t] of Object.entries(facts.type)) lines.push(`- ${sel}: ${t.family} ${t.size} / ${t.lineHeight}, weight ${t.weight}, tracking ${t.letterSpacing}${t.style !== 'normal' ? ', ' + t.style : ''}`);
lines.push('', '## Surfaces', '', ...Object.entries(facts.bgs).map(([c, n]) => `- ${c} (×${n})`), '', `Media radii: ${Object.entries(facts.radii).map(([r, n]) => `${r} ×${n}`).join(', ') || 'none'}`, '');
lines.push('## Sticky / fixed / pinned elements', '', ...(facts.sticky.length ? facts.sticky.map((s) => `- <${s.tag}${s.id ? '#' + s.id : ''}> ${s.cls} (h ${s.h}px)`) : ['- none']), '');
lines.push('## Sections (top → bottom)', '', '| top | height | id | heading |', '|---|---|---|---|', ...facts.sections.map((s) => `| ${s.top} | ${s.h} | ${s.id || '—'} | ${s.heading || '—'} |`), '');
lines.push('## What moves while scrolling (most active first)', '');
if (!described.filter(Boolean).length) lines.push('- nothing detected (site may animate with canvas/WebGL, or blocks headless browsers)');
for (const d of described.filter(Boolean)) {
  const c = changes[d.id]; const { notes, scrub } = interpret(c, d);
  if (!notes.length) continue;
  lines.push(`- **${d.section || '?'}** → <${d.tag}${d.cls ? ' .' + d.cls.split(' ')[0] : ''}> ${d.text ? `"${d.text}"` : d.isMedia ? '[media]' : ''} — ${notes.join('; ')} — ${scrub}; active ${c.first}–${c.last}px`);
}
lines.push('', '## How to read this', '', '- "scale + clipped container" = image zoom inside a frame → motion recipe 3.4/3.11 with scale.', '- "moves vertically, continuous" = parallax (3.4). "once" = entrance reveal (data-reveal).', '- A sticky <section> with several fading texts = pinned scroll story (3.3).', '- Horizontal movement continuous = marquee (3.7) or horizontal scroll section.', '- opacity toggles inside a sticky block = caption swap.', '');

const file = path.join(outDir, `${host}-probe-${width}.md`);
await writeFile(file, lines.join('\n'));
console.log(`Probe report saved: ${file}`);
console.log(lines.slice(0, 40).join('\n'));
