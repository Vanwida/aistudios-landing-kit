#!/usr/bin/env node
/*
  Landing Kit — SCREENSHOTS
  ---------------------------------------------------------------
  Takes screenshots so Claude (and you) can SEE the page instead of guessing.
  Output goes to brief/shots/ (or brief/inspiration/ for external sites).

  Usage (from the project folder):
    npm run shots                          # full page, 3 widths, local dev server
    npm run shots -- --section hero        # only the element with id="hero"
    npm run shots -- --width 1440          # one width only
    npm run shots -- --url https://site.com --name lassie   # external reference site
    npm run shots -- --scroll              # capture 5 viewport-height frames while scrolling (motion check)
    npm run shots -- --dark                # emulate dark colour scheme

  Widths: 390 (mobile), 834 (tablet), 1440 (desktop). Add --width 1920 for wide.
  Requires: the dev server running on http://localhost:4321 (npm run dev),
            unless --url is given.
*/

import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const args = process.argv.slice(2);
const opt = (name, fallback = undefined) => {
  const i = args.indexOf(`--${name}`);
  if (i === -1) return fallback;
  const v = args[i + 1];
  return v && !v.startsWith('--') ? v : true;
};

const url = opt('url', 'http://localhost:4321');
const isExternal = url !== 'http://localhost:4321';
const name = opt('name', isExternal ? new URL(url).hostname.replace(/^www\./, '') : 'page');
const section = opt('section');
const singleWidth = opt('width');
const scrollMode = opt('scroll') === true;
const dark = opt('dark') === true;
const widths = singleWidth ? [Number(singleWidth)] : [390, 834, 1440];
const outDir = isExternal ? 'brief/inspiration' : 'brief/shots';

await mkdir(outDir, { recursive: true });

const launchOptions = {};
if (process.env.PW_EXECUTABLE_PATH) launchOptions.executablePath = process.env.PW_EXECUTABLE_PATH;

const browser = await chromium.launch(launchOptions);
const results = [];

for (const width of widths) {
  const height = width < 768 ? 844 : width < 1024 ? 1194 : 900;
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    colorScheme: dark ? 'dark' : 'light',
    reducedMotion: scrollMode ? 'no-preference' : 'reduce', // static shots: skip animations so nothing is mid-fade
    userAgent:
      width < 768
        ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
        : undefined,
  });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('pageerror', (e) => consoleErrors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()));

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
  } catch (e) {
    await page.goto(url, { waitUntil: 'load', timeout: 45000 });
  }
  await page.waitForTimeout(600);

  if (scrollMode) {
    // Walk down the page and capture frames — useful to check scroll-triggered motion fires.
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    const steps = 5;
    for (let s = 0; s <= steps; s++) {
      const y = Math.round((total - height) * (s / steps));
      await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: 'instant' }), y);
      await page.waitForTimeout(700);
      const file = path.join(outDir, `${name}-${width}-scroll-${s}.png`);
      await page.screenshot({ path: file });
      results.push(file);
    }
  } else if (section) {
    // Scroll through once so lazy content and reveals settle, then shoot the element.
    await autoScroll(page);
    const el = page.locator(`#${section}`).first();
    if ((await el.count()) === 0) {
      console.error(`✗ No element with id="${section}" at ${width}px`);
    } else {
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
      const file = path.join(outDir, `${name}-${section}-${width}.png`);
      await el.screenshot({ path: file });
      results.push(file);
    }
  } else {
    await autoScroll(page);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    const file = path.join(outDir, `${name}-${width}.png`);
    await page.screenshot({ path: file, fullPage: true });
    results.push(file);
  }

  if (consoleErrors.length) {
    console.log(`⚠ ${width}px — ${consoleErrors.length} console error(s):`);
    consoleErrors.slice(0, 5).forEach((e) => console.log('   ' + e.slice(0, 200)));
  }
  await context.close();
}

await browser.close();

console.log('Screenshots saved:');
results.forEach((f) => console.log('  ' + f));

// Scroll to the bottom in steps so lazy images load and [data-reveal] elements are shown.
async function autoScroll(page) {
  await page.evaluate(async () => {
    const step = Math.max(400, window.innerHeight * 0.8);
    const total = document.documentElement.scrollHeight;
    for (let y = 0; y < total; y += step) {
      window.scrollTo({ top: y, behavior: 'instant' });
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' });
    await new Promise((r) => setTimeout(r, 400));
  });
}
