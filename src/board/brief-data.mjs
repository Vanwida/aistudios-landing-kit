/*
  Reads everything the board shows. Runs on the dev server only (imported by Board.astro).
  All reads are tolerant: a missing file renders as "not yet".
*/
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { marked } from 'marked';

const root = process.cwd();
const p = (...s) => path.join(root, ...s);

function readText(rel) {
  try { return existsSync(p(rel)) ? readFileSync(p(rel), 'utf8') : null; } catch { return null; }
}
function readJson(rel, fallback) {
  try { const t = readText(rel); return t ? JSON.parse(t) : fallback; } catch { return fallback; }
}
function md(text) {
  return text ? marked.parse(text) : '';
}
function listImages(rel) {
  try { return existsSync(p(rel)) ? readdirSync(p(rel)).filter((f) => /\.(png|jpe?g|webp|svg)$/i.test(f)).sort() : []; } catch { return []; }
}

export function loadBrief() {
  const sections = readJson('brief/sections.json', { client: null, sections: [], log: [] });
  const project = readText('brief/PROJECT.md');
  const design = readText('brief/DESIGN.md');
  const review = readText('brief/REVIEW.md');
  const handoff = readText('brief/HANDOFF.md');
  const figma = listImages('brief/figma');
  const shots = listImages('brief/shots');
  const inspiration = listImages('brief/inspiration');

  // Tokens → swatches / type specimens
  const tokensCss = readText('src/styles/tokens.css') || '';
  const colors = [...tokensCss.matchAll(/--color-([a-z0-9-]+):\s*([^;]+);/gi)]
    .map((m) => ({ name: m[1], value: m[2].trim() }))
    .filter((c) => !c.value.startsWith('var('));
  const fonts = [...tokensCss.matchAll(/--font-([a-z]+):\s*([^;]+);/gi)].map((m) => ({ role: m[1], stack: m[2].trim() }));
  const textSizes = [...tokensCss.matchAll(/--text-([a-z0-9]+):\s*([^;]+);/gi)].map((m) => ({ name: m[1], value: m[2].trim() }));

  // Save points
  let savePoints = [];
  let branch = null;
  let remote = null;
  try {
    branch = execSync('git branch --show-current', { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim() || null;
    remote = execSync('git remote get-url origin', { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim() || null;
    savePoints = execSync('git log --date=format:"%d %b %H:%M" --pretty=format:"%ad|%s" -12', { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] })
      .toString().trim().split('\n').filter(Boolean).map((l) => { const [date, ...s] = l.split('|'); return { date, text: s.join('|') }; });
  } catch { /* no git yet */ }

  // Per-section imagery
  const withImages = (sections.sections || []).map((s) => {
    const id = s.id;
    const figmaDesktop = figma.find((f) => f.replace(/\.[^.]+$/, '') === id) || null;
    const figmaMobile = figma.find((f) => f.replace(/\.[^.]+$/, '') === `${id}-mobile`) || null;
    const shot = (w) => shots.find((f) => f === `page-${id}-${w}.png`) || null;
    return { ...s, figmaDesktop, figmaMobile, shots: { 390: shot(390), 834: shot(834), 1440: shot(1440) } };
  });

  const built = withImages.filter((s) => s.built).length;
  const animated = withImages.filter((s) => s.motion && s.built).length;

  return {
    client: sections.client || null,
    sections: withImages,
    counts: { total: withImages.length, built, animated },
    log: sections.log || [],
    projectHtml: md(project),
    designHtml: md(design),
    reviewHtml: md(review),
    handoffHtml: md(handoff),
    hasProject: !!project, hasDesign: !!design, hasReview: !!review, hasHandoff: !!handoff,
    colors, fonts, textSizes,
    fullShots: [390, 834, 1440].map((w) => shots.find((f) => f === `page-${w}.png`) || null),
    scrollShots: shots.filter((f) => /-scroll-\d+\.png$/.test(f)),
    inspiration,
    savePoints, branch, remote,
    generatedAt: new Date().toLocaleString('en-GB', { hour12: false }),
  };
}
