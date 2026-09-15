// Builds docs/MAP.html — the whole kit on one page: the doors in, the line, the
// words that trigger each phase, what each one writes, and who owns which files.
// Generated from the skills themselves and from CLAUDE.md, so it cannot go stale.
// Run: npm run map
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// --- the kit's own manifest -------------------------------------------------
const kit = JSON.parse(read('kit.json'));

// --- every skill, from its frontmatter --------------------------------------
const skills = {};
for (const dir of fs.readdirSync(path.join(ROOT, '.claude/skills'))) {
  const file = path.join('.claude/skills', dir, 'SKILL.md');
  if (!fs.existsSync(path.join(ROOT, file))) continue;
  const src = read(file);
  const fm = /^---\n([\s\S]*?)\n---/.exec(src)[1];
  const name = /^name:\s*(.+)$/m.exec(fm)[1].trim();
  const description = /^description:\s*([\s\S]*?)(?=\n\w[\w-]*:|$)/m.exec(fm)[1].trim().replace(/\s+/g, ' ');
  skills[name] = { name, description, words: [...description.matchAll(/"([^"]{2,34})"/g)].map((m) => m[1]) };
}

// --- the workflow table in CLAUDE.md is the source of truth for words + writes
const table = {};
for (const row of read('CLAUDE.md').split('\n')) {
  const m = /^\|\s*(.+?)\s*\|\s*`([a-z-]+)`\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|$/.exec(row);
  if (!m) continue;
  const strip = (s) => s.replace(/\*\*/g, '').replace(/`/g, '').trim();
  table[m[2]] = {
    words: [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]).concat(/a URL|a Figma link/.test(m[1]) ? [m[1].replace(/.*,\s*/, '')] : []),
    does: strip(m[3]),
    writes: m[4] === '—' ? [] : strip(m[4]).split(/,\s*/).map((s) => s.replace(/\(.*?\)/, '').trim()).filter(Boolean),
  };
}

// --- how the pieces are grouped (the only hand-made decision here) ----------
const LINE = ['new-landing', 'inspire', 'design', 'figma', 'build', 'animate', 'review', 'ship'];
const LINE_LABEL = { 'new-landing': 'Brief', inspire: 'Inspiration', design: 'Figma draft', figma: 'Import', build: 'Build', animate: 'Motion', review: 'Review', ship: 'Ship' };
const ANYTIME = ['start', 'help', 'status', 'fix', 'undo', 'update', 'handoff'];
const REFERENCE = ['astro-conventions', 'design-quality', 'figma-to-code', 'motion', 'qa-checklist', 'launch-essentials', 'deploy-vercel'];
const DOORS = [
  ['New project', 'An empty folder named after the client, opened in Claude.', 'Create a new landing from the AISTUDIOS kit: ' + kit.repo, 'Claude makes their repo from the template and clones it. Always the current version.'],
  ['A copy of the folder', 'The kit as a zip, or a folder they already have.', 'update the kit', 'Unzip, rename after the client, open it. Say this to pull the current system files.'],
  ['A project already going', 'Yesterday’s project, reopened.', '/start', 'Reads what is built and offers the next step.'],
];
const FRESH = [
  ['New landing page from a brief', 'recommended', 'Questionnaire, references, architecture, setup. Then the Figma draft appears on its own.'],
  ['I have a finished Figma design', '', 'Five quick questions, then import, then build.'],
  ['I have a reference site I love', '', 'Asks for the URL, reads the site, pre-fills the architecture round.'],
  ['Just show me around', '', 'Four lines about the preview and the board, then offers the first option.'],
];
const GOING = [
  ['Continue where we left off', 'recommended', 'Whatever is missing: import, build, motion, review or ship.'],
  ['Show me the board', '', 'Opens localhost:4321/board.'],
  ['Something’s wrong', '', 'Runs fix.'],
  ['Start a different project', '', 'Explains: copy the folder, open the copy, say start.'],
];
const AGENTS = fs.readdirSync(path.join(ROOT, '.claude/agents')).filter((f) => f.endsWith('.md')).map((f) => {
  const fm = /^---\n([\s\S]*?)\n---/.exec(read(path.join('.claude/agents', f)))[1];
  return {
    name: /^name:\s*(.+)$/m.exec(fm)[1].trim(),
    description: /^description:\s*([\s\S]*?)(?=\n\w[\w-]*:|$)/m.exec(fm)[1].trim().replace(/\s+/g, ' '),
  };
});
const PROJECT_FILES = ['src/sections/', 'src/styles/tokens.css', 'src/styles/global.css', 'src/pages/', 'src/layouts/', 'src/components/', 'src/assets/', 'public/', 'brief/', 'package.json', 'astro.config.mjs'];

// --- helpers ----------------------------------------------------------------
const chips = (xs, cls = '') => xs.map((x) => `<code class="chip ${cls}">${esc(x)}</code>`).join('');
const first = (s, n) => (s.length > n ? s.slice(0, s.lastIndexOf(' ', n)) + '…' : s);
const saying = (id) => (table[id]?.words?.length ? table[id].words : skills[id]?.words || []).slice(0, 4);

const rail = LINE.map((id, i) => `
      <li class="node">
        <span class="step">${i + 1}</span>
        <h3>${esc(LINE_LABEL[id])}</h3>
        <p class="sk">${esc(id)}</p>
        <p class="say">${saying(id).map((w) => `“${esc(w)}”`).join(' · ') || '—'}</p>
        ${table[id]?.writes?.length ? `<p class="writes">${chips(table[id].writes, 'file')}</p>` : ''}
      </li>`).join('');

const anytime = ANYTIME.map((id) => `
      <li>
        <h3>${esc(id)}</h3>
        <p class="say">${saying(id).map((w) => `“${esc(w)}”`).join(' · ') || '—'}</p>
        <p>${esc(first(table[id]?.does || skills[id].description, 120))}</p>
      </li>`).join('');

const reference = REFERENCE.map((id) => `
      <li><h3>${esc(id)}</h3><p>${esc(first(skills[id].description, 130))}</p></li>`).join('');

const agents = AGENTS.map((a) => `
      <li><h3>${esc(a.name)}</h3><p>${esc(first(a.description, 120))}</p></li>`).join('');

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Landing kit — the map</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=Martian+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  :root{
    --ground:#f2f3f5; --surface:#fff; --ink:#0b0d14; --ink-2:#4a4f5c; --ink-3:#6b7080;
    --hairline:rgba(11,13,20,.08); --line:rgba(11,13,20,.14); --action:#1b2cff; --action-soft:rgba(27,44,255,.07);
    --ui:"Archivo",system-ui,-apple-system,sans-serif; --mono:"Martian Mono",ui-monospace,Menlo,monospace;
  }
  *{box-sizing:border-box}
  body{margin:0;background:var(--ground);color:var(--ink);font:400 16px/1.5 var(--ui);-webkit-font-smoothing:antialiased}
  .wrap{max-width:1560px;margin:0 auto;padding:40px 32px 96px}
  header{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;flex-wrap:wrap;margin-bottom:40px}
  .brand{display:flex;align-items:center;gap:14px}
  .brand svg{width:34px;height:34px;color:var(--action)}
  h1{font:700 34px/1 var(--ui);font-stretch:108%;letter-spacing:-.03em;margin:0}
  header p{margin:6px 0 0;color:var(--ink-2);max-width:62ch}
  .meta{font:500 13px/1.4 var(--mono);color:var(--ink-3);text-align:right}
  h2{font:700 13px/1 var(--ui);letter-spacing:.14em;text-transform:uppercase;color:var(--ink-3);margin:44px 0 16px}
  h2:first-of-type{margin-top:0}
  h3{font:600 17px/1.25 var(--ui);letter-spacing:-.01em;margin:0 0 6px}
  p{margin:0}
  ul{list-style:none;margin:0;padding:0}
  .card,.node,.doors li,.grid li{background:var(--surface);border:1px solid var(--hairline);border-radius:12px;padding:16px 18px}
  .doors{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
  .doors p{color:var(--ink-2);font-size:14.5px;margin-top:6px}
  .rail{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:26px;position:relative}
  .node{position:relative;display:flex;flex-direction:column;gap:6px}
  .node:not(:last-child)::after{content:"";position:absolute;right:-20px;top:34px;width:14px;height:14px;border:2px solid var(--line);border-width:2px 2px 0 0;transform:rotate(45deg)}
  .step{position:absolute;top:-10px;left:16px;display:grid;place-items:center;width:22px;height:22px;border-radius:50%;background:var(--action);color:#fff;font:600 12px/1 var(--ui)}
  .node h3{margin-top:6px}
  .sk{font:500 12px/1 var(--mono);color:var(--action)}
  .say{color:var(--ink-2);font-size:14px}
  .writes{margin-top:auto;padding-top:8px;display:flex;flex-wrap:wrap;gap:4px}
  .chip{display:inline-block;max-width:100%;font:500 11.5px/1.5 var(--mono);background:var(--ground);border:1px solid var(--hairline);border-radius:5px;padding:2px 6px;color:var(--ink-2);overflow-wrap:anywhere}
  .chip.file{background:var(--action-soft);border-color:transparent;color:var(--action)}
  .loop{margin-top:14px;font-size:14px;color:var(--ink-2);display:flex;gap:22px;flex-wrap:wrap}
  .loop b{color:var(--ink);font-weight:600}
  .grid{display:grid;gap:14px}
  .grid.four{grid-template-columns:repeat(4,minmax(0,1fr))}
  .grid.seven{grid-template-columns:repeat(4,minmax(0,1fr))}
  .grid li p{color:var(--ink-2);font-size:14px}
  .split{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
  .split section{background:var(--surface);border:1px solid var(--hairline);border-radius:12px;padding:18px 20px}
  .split h3 span{font:500 12px/1 var(--mono);color:var(--ink-3);margin-left:8px}
  .files{display:flex;flex-wrap:wrap;gap:5px;margin-top:10px}
  .menu{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
  .menu ol{margin:10px 0 0;padding-left:20px}
  .menu li{margin-bottom:8px;font-size:14.5px}
  .menu li span{color:var(--ink-2)}
  .menu li em{font-style:normal;font:500 11px/1 var(--mono);color:var(--action);margin-left:6px}
  footer{margin-top:56px;padding-top:16px;border-top:1px solid var(--hairline);color:var(--ink-3);font-size:13.5px}
  @media (max-width:1200px){.rail{grid-template-columns:repeat(4,minmax(0,1fr));row-gap:34px}.node:nth-child(4)::after{display:none}.doors,.grid.four,.grid.seven{grid-template-columns:repeat(2,minmax(0,1fr))}.split,.menu{grid-template-columns:1fr}}
  @media (max-width:640px){.rail,.doors,.grid.four,.grid.seven{grid-template-columns:1fr}.node::after{display:none}}
  @media print{body{background:#fff}.wrap{max-width:none;padding:0}}
</style>
</head>
<body>
<div class="wrap">
  <header>
    <div>
      <div class="brand"><svg viewBox="0 -2 100 90" aria-hidden="true"><path fill="currentColor" d="M47 14.13 A36 36 0 1 0 47 85.87 Z M53 0.13 A36 36 0 1 1 53 71.87 Z"/></svg><h1>Landing kit — the map</h1></div>
      <p>Everything the designer can say, where it leads, and what it writes. The kit is a conversation: they talk, Claude runs the matching skill.</p>
    </div>
    <p class="meta">${esc(kit.name)}<br>v${esc(kit.version)} · ${esc(kit.repo)}<br>MIT</p>
  </header>

  <h2>Three doors in</h2>
  <ul class="doors">${DOORS.map(([t, w, say, d]) => `
    <li><h3>${esc(t)}</h3><p>${esc(w)}</p><p style="margin-top:10px">${chips([say])}</p><p>${esc(d)}</p></li>`).join('')}
  </ul>

  <h2>Then the front door: <code class="chip">/start</code></h2>
  <div class="menu">
    <section class="card"><h3>Nothing built yet</h3><ol>${FRESH.map(([t, r, d]) => `<li><b>${esc(t)}</b>${r ? `<em>${esc(r)}</em>` : ''}<br><span>${esc(d)}</span></li>`).join('')}</ol></section>
    <section class="card"><h3>A project already going</h3><ol>${GOING.map(([t, r, d]) => `<li><b>${esc(t)}</b>${r ? `<em>${esc(r)}</em>` : ''}<br><span>${esc(d)}</span></li>`).join('')}</ol></section>
  </div>

  <h2>The line — what they say, what it writes</h2>
  <ul class="rail">${rail}
  </ul>
  <p class="loop"><b>Build repeats</b> once per section until the list is done. <b>Motion</b> comes after the last section, never before. <b>Ship</b> can run at any point: every push is a preview link, “go live” is the real address.</p>

  <h2>Any time, at any point on the line</h2>
  <ul class="grid four">${anytime}
  </ul>

  <h2>Never asked for — Claude loads these itself</h2>
  <ul class="grid seven">${reference}
  </ul>

  <h2>Delegated to a sub-agent</h2>
  <ul class="grid four">${agents}
  </ul>

  <h2>Who owns which file</h2>
  <div class="split">
    <section><h3>The kit’s <span>replaced by “update the kit”</span></h3><div class="files">${chips(kit.system, 'file')}</div></section>
    <section><h3>The designer’s <span>never touched by an update</span></h3><div class="files">${chips(PROJECT_FILES)}</div></section>
  </div>

  <footer>Generated from the skills and CLAUDE.md by <code class="chip">npm run map</code>. Do not edit this file by hand.</footer>
</div>
</body>
</html>
`;
fs.mkdirSync(path.join(ROOT, 'docs'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'docs/MAP.html'), html);
console.log(`docs/MAP.html — ${LINE.length} on the line, ${ANYTIME.length} any time, ${REFERENCE.length} reference, ${AGENTS.length} agents, ${Object.keys(skills).length} skills total`);
