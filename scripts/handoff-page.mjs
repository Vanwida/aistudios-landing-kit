#!/usr/bin/env node
/*
  Landing Kit — HANDOFF PAGE
  Renders brief/HANDOFF.md into brief/handoff.html (a self-contained page the client can open),
  and optionally brief/handoff.pdf.

    node scripts/handoff-page.mjs          # → brief/handoff.html
    node scripts/handoff-page.mjs --pdf    # → brief/handoff.html + brief/handoff.pdf (needs playwright)
*/
import { readFile, writeFile } from 'node:fs/promises';
import { marked } from 'marked';

const src = await readFile('brief/HANDOFF.md', 'utf8').catch(() => null);
if (!src) { console.error('brief/HANDOFF.md not found — run the handoff step first.'); process.exit(1); }

const title = (src.match(/^#\s+(.+)$/m) || [, 'Handoff'])[1].replace(/^HANDOFF\s*—\s*/i, '');
const body = marked.parse(src);

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=DM+Mono&display=swap">
<style>
  :root { --bg:#f6f6f2; --ink:#17191b; --ink2:#5a5f5c; --ink3:#8b918d; --line:#dcdfd9; --accent:#1f6f5f; --soft:#e2efe9; }
  * { box-sizing:border-box; }
  body { margin:0; background:var(--bg); color:var(--ink); font-family:'DM Sans',system-ui,sans-serif; font-size:15.5px; line-height:1.6; padding:0 clamp(16px,4vw,40px) 80px; }
  main { max-width:760px; margin:0 auto; }
  header { padding:56px 0 24px; border-bottom:1px solid var(--line); margin-bottom:8px; }
  .eyebrow { font-family:'DM Mono',monospace; font-size:12px; letter-spacing:.08em; text-transform:uppercase; color:var(--ink2); }
  h1 { font-family:'Instrument Serif',Georgia,serif; font-weight:400; font-size:clamp(38px,6vw,60px); line-height:1.05; margin:10px 0 0; letter-spacing:-.01em; }
  main h2 { font-family:'Instrument Serif',Georgia,serif; font-weight:400; font-size:28px; margin:38px 0 10px; letter-spacing:-.01em; }
  main h3 { font-size:16px; font-weight:600; margin:22px 0 6px; }
  p { margin:8px 0; max-width:66ch; } ul { padding-left:1.2em; } li { margin:4px 0; }
  a { color:var(--accent); } code { font-family:'DM Mono',monospace; font-size:.85em; background:var(--soft); padding:1px 6px; border-radius:4px; }
  table { border-collapse:collapse; width:100%; font-size:14px; } th,td { text-align:left; padding:8px; border-bottom:1px solid var(--line); vertical-align:top; }
  footer { margin-top:56px; padding-top:18px; border-top:1px solid var(--line); font-family:'DM Mono',monospace; font-size:12px; color:var(--ink3); }
  @media print { body { background:#fff; padding:0 12mm; } header { padding-top:0; } a { color:var(--ink); } }
</style>
</head>
<body>
<main>
  <header><p class="eyebrow">Website handoff</p><h1>${title}</h1></header>
  ${body}
  <footer>Prepared with the AISTUDIOS Landing Kit · ${new Date().toLocaleDateString('en-GB')}</footer>
</main>
</body>
</html>
`;

await writeFile('brief/handoff.html', html);
console.log('Wrote brief/handoff.html');

if (process.argv.includes('--pdf')) {
  const { chromium } = await import('playwright');
  const launch = {};
  if (process.env.PW_EXECUTABLE_PATH) launch.executablePath = process.env.PW_EXECUTABLE_PATH;
  const browser = await chromium.launch(launch);
  const page = await browser.newPage();
  await page.goto('file://' + process.cwd() + '/brief/handoff.html', { waitUntil: 'load' });
  await page.pdf({ path: 'brief/handoff.pdf', format: 'A4', printBackground: true, margin: { top: '16mm', bottom: '16mm', left: '14mm', right: '14mm' } });
  await browser.close();
  console.log('Wrote brief/handoff.pdf');
}
