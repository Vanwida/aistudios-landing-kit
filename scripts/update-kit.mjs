// Update the kit's system files from the AISTUDIOS repo, leaving the project's own files alone.
//
//   node scripts/update-kit.mjs           install the current version (no-op if already current)
//   node scripts/update-kit.mjs --check   only report local vs remote version
//   node scripts/update-kit.mjs --force   reinstall even if the version matches
//
// How it works: the kit repo is fetched as a git remote named `kit`; every path listed under
// `system` in kit.json is replaced with the remote copy (`git checkout kit/<branch> -- <path>`).
// Nothing else is touched. Paths under `keep` are restored afterwards. A save point (commit) is
// made before and after, so `/undo` can always go back. The first line of output is machine
// readable: RESULT: UPDATED | UP_TO_DATE | UPDATE_AVAILABLE | NO_ACCESS | NETWORK | NOT_A_REPO.

import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';

const args = new Set(process.argv.slice(2));
const CHECK = args.has('--check');
const FORCE = args.has('--force');

function git(...a) {
  return execFileSync('git', a, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}
function tryGit(...a) {
  try { return git(...a); } catch { return null; }
}
function fail(result, message, code) {
  console.log(`RESULT: ${result}`);
  console.log(message);
  process.exit(code);
}

if (tryGit('rev-parse', '--is-inside-work-tree') !== 'true') {
  fail('NOT_A_REPO', 'This folder is not a project yet. Say "start" first; the update comes later.', 2);
}

const local = JSON.parse(readFileSync('kit.json', 'utf8'));
const remoteUrl = `https://github.com/${local.repo}.git`;
const ref = `kit/${local.branch}`;

// Point the `kit` remote at the repo named in kit.json (add it, or fix it if it drifted).
if (tryGit('remote', 'get-url', 'kit') === null) git('remote', 'add', 'kit', remoteUrl);
else if (git('remote', 'get-url', 'kit') !== remoteUrl) git('remote', 'set-url', 'kit', remoteUrl);

// Fetch with retries: classroom Wi-Fi drops connections. Only a real permission error is NO_ACCESS.
const ACCESS_ERROR = /Authentication failed|could not read Username|Repository not found|Permission denied|Invalid username|403/i;
const FETCH_TRIES = 3;
const RETRY_PAUSE_MS = 2000;
function pause(ms) { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }
let fetchError = '';
for (let attempt = 1; attempt <= FETCH_TRIES; attempt++) {
  try {
    execFileSync('git', ['fetch', '--quiet', 'kit', local.branch], { stdio: ['ignore', 'ignore', 'pipe'], env: { ...process.env, GIT_TERMINAL_PROMPT: '0' } });
    fetchError = '';
    break;
  } catch (e) {
    fetchError = String(e.stderr || e.message || 'fetch failed');
    if (ACCESS_ERROR.test(fetchError) || attempt === FETCH_TRIES) break;
    pause(RETRY_PAUSE_MS);
  }
}
if (fetchError) {
  if (ACCESS_ERROR.test(fetchError)) fail('NO_ACCESS', `The kit at ${remoteUrl} didn't let us in. Your GitHub account needs access to it — ask AISTUDIOS, then try again.`, 3);
  fail('NETWORK', 'Could not reach GitHub right now. Check the connection and try again in a minute. Nothing was changed.', 4);
}

const remote = JSON.parse(git('show', `${ref}:kit.json`));
const same = remote.version === local.version;

if (CHECK) {
  console.log(`RESULT: ${same ? 'UP_TO_DATE' : 'UPDATE_AVAILABLE'}`);
  console.log(`installed ${local.version} · available ${remote.version}`);
  process.exit(0);
}
if (same && !FORCE) {
  console.log('RESULT: UP_TO_DATE');
  console.log(`The kit is already at version ${local.version}.`);
  process.exit(0);
}

// Save point first, so nothing in progress is ever lost.
if (git('status', '--porcelain') !== '') {
  git('add', '-A');
  git('commit', '-q', '-m', 'save point: before kit update');
}
const before = git('rev-parse', 'HEAD');

// Replace each system path with the remote copy. Use the REMOTE list, so files the kit added
// since this project was created come in too; a path gone from the kit is removed here as well.
const system = remote.system || local.system;
for (const p of system) {
  tryGit('rm', '-r', '-q', '--ignore-unmatch', '--', p);
  tryGit('checkout', '-q', ref, '--', p);
}
for (const p of remote.keep || local.keep || []) tryGit('checkout', '-q', before, '--', p);

// Dependencies the new kit needs that this project doesn't have yet.
const pkgLocal = JSON.parse(readFileSync('package.json', 'utf8'));
const pkgRemote = JSON.parse(git('show', `${ref}:package.json`));
const missing = [];
for (const field of ['dependencies', 'devDependencies']) {
  for (const [name, range] of Object.entries(pkgRemote[field] || {})) {
    if (!(pkgLocal.dependencies || {})[name] && !(pkgLocal.devDependencies || {})[name]) missing.push(`${name}@${range}`);
  }
}
const notes = [];
if (missing.length) {
  try {
    execFileSync('npm', ['install', '--no-audit', '--no-fund', '--silent', ...missing], { stdio: ['ignore', 'ignore', 'pipe'] });
    notes.push(`Installed new dependencies: ${missing.join(', ')}.`);
  } catch {
    notes.push(`New dependencies could not be installed automatically: ${missing.join(', ')}. Run: npm install ${missing.join(' ')}`);
  }
}
if (existsSync('astro.config.mjs') && tryGit('diff', '--quiet', ref, '--', 'astro.config.mjs') === null) {
  notes.push('astro.config.mjs differs from the kit. It belongs to the project, so it was left alone — compare by hand if the board or the dev server misbehave.');
}

git('add', '-A');
if (git('status', '--porcelain') === '') {
  console.log('RESULT: UP_TO_DATE');
  console.log(`Version ${remote.version} was already installed file by file.`);
  process.exit(0);
}
git('commit', '-q', '-m', `kit update: ${local.version} → ${remote.version}`);
const stat = git('diff', '--stat', before, 'HEAD').split('\n').pop().trim();

console.log('RESULT: UPDATED');
console.log(`Kit updated ${local.version} → ${remote.version} (${stat}).`);
console.log('Changed files:');
console.log(git('diff', '--name-status', before, 'HEAD'));
for (const n of notes) console.log(`NOTE: ${n}`);
