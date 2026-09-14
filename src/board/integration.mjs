/*
  Landing Kit — PROJECT BOARD integration
  ---------------------------------------------------------------
  Adds the designer's project board at http://localhost:4321/board
  and serves the files in brief/ (Figma exports, screenshots) at /brief/*.

  DEV ONLY, BY CONSTRUCTION:
    • the route is injected only when Astro runs `astro dev`
    • the /brief file server is a dev-server middleware; it does not exist in a build
  `npm run build` produces no /board page and no /brief files. Nothing here can go live.
*/

import { readFile, writeFile, chmod, stat } from 'node:fs/promises';
import path from 'node:path';

const MIME = {
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.gif': 'image/gif', '.svg': 'image/svg+xml', '.md': 'text/markdown; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
};

function briefFileServer(root) {
  const briefDir = path.resolve(root, 'brief');
  return {
    name: 'landing-kit-brief-files',
    apply: 'serve', // Vite: dev server only
    configureServer(server) {
      server.middlewares.use('/brief', async (req, res, next) => {
        try {
          const url = new URL(req.url || '/', 'http://localhost');
          const rel = decodeURIComponent(url.pathname).replace(/^\/+/, '');
          const file = path.resolve(briefDir, rel);
          if (!file.startsWith(briefDir + path.sep)) return next();
          const ext = path.extname(file).toLowerCase();
          if (!MIME[ext]) return next();
          const s = await stat(file);
          if (!s.isFile()) return next();
          res.setHeader('Content-Type', MIME[ext]);
          res.setHeader('Cache-Control', 'no-store');
          res.end(await readFile(file));
        } catch {
          next();
        }
      });
    },
  };
}

/*
  SETTINGS — values the designer pastes on the board (a form key, a Vercel token…).
  Claude asks for a value by adding a request to brief/settings.json; the board shows a field for it;
  this endpoint writes the value into .env on this computer. Claude never sees the value.
  Dev only · localhost only · same-origin only · only keys that were requested · never reads values back.
*/
const ENV_FILE = '.env';
const SETTINGS_FILE = 'brief/settings.json';
const KEY_RE = /^[A-Z][A-Z0-9_]{1,63}$/;
const VALUE_MAX = 4096;
const BODY_MAX = 65536;
const LOCAL_ADDRESSES = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1']);
const LOCAL_HOST_RE = /^(localhost|127\.0\.0\.1)(:\d+)?$/;

async function readSettingsRequests(root) {
  try {
    const j = JSON.parse(await readFile(path.resolve(root, SETTINGS_FILE), 'utf8'));
    return Array.isArray(j.settings) ? j.settings : [];
  } catch {
    return [];
  }
}

// Replace, add or remove one KEY=value line; everything else in the file stays as it is.
function upsertEnvLine(text, key, value) {
  const lines = text ? text.replace(/\n$/, '').split('\n') : [];
  const idx = lines.findIndex((l) => l.startsWith(`${key}=`));
  if (value === null) {
    if (idx >= 0) lines.splice(idx, 1);
  } else {
    const quoted = /[\s#"'`$\\]/.test(value) ? `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"` : value;
    const line = `${key}=${quoted}`;
    if (idx >= 0) lines[idx] = line; else lines.push(line);
  }
  return lines.length ? lines.join('\n') + '\n' : '';
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => { data += chunk; if (data.length > BODY_MAX) { reject(new Error('too large')); req.destroy(); } });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function settingsServer(root) {
  const envPath = path.resolve(root, ENV_FILE);
  const send = (res, status, body) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.end(JSON.stringify(body));
  };
  return {
    name: 'landing-kit-settings',
    apply: 'serve', // Vite: dev server only
    configureServer(server) {
      server.middlewares.use('/board/env', async (req, res, next) => {
        if (req.method !== 'POST') return next();
        const host = req.headers.host || '';
        const origin = req.headers.origin;
        const site = req.headers['sec-fetch-site'];
        const local = LOCAL_ADDRESSES.has(req.socket?.remoteAddress || '') && LOCAL_HOST_RE.test(host);
        const sameOrigin = (!origin || origin === `http://${host}`) && (!site || site === 'same-origin');
        if (!local || !sameOrigin) return send(res, 403, { ok: false, message: 'Settings can only be saved from the board, on this computer.' });
        if (!String(req.headers['content-type'] || '').startsWith('application/json')) return send(res, 415, { ok: false, message: 'Unexpected request.' });
        try {
          const { key, value } = JSON.parse(await readBody(req));
          const requests = await readSettingsRequests(root);
          if (typeof key !== 'string' || !KEY_RE.test(key) || !requests.some((r) => r && r.key === key)) {
            return send(res, 400, { ok: false, message: 'That setting was not requested by Claude.' });
          }
          let clean = null;
          if (value !== null) {
            if (typeof value !== 'string') return send(res, 400, { ok: false, message: 'Paste the value as text.' });
            clean = value.trim();
            if (!clean) return send(res, 400, { ok: false, message: 'The value is empty.' });
            if (clean.length > VALUE_MAX || /[\r\n]/.test(clean)) return send(res, 400, { ok: false, message: 'That does not look like a single value.' });
          }
          let current = '';
          try { current = await readFile(envPath, 'utf8'); } catch { /* no .env yet */ }
          await writeFile(envPath, upsertEnvLine(current, key, clean), { mode: 0o600 });
          await chmod(envPath, 0o600);
          return send(res, 200, { ok: true, key, set: clean !== null });
        } catch {
          return send(res, 400, { ok: false, message: 'Could not save. Try again.' });
        }
      });
    },
  };
}

export default function board() {
  return {
    name: 'landing-kit-board',
    hooks: {
      'astro:config:setup': ({ command, injectRoute, updateConfig, config, logger }) => {
        if (command !== 'dev') return; // build + preview: nothing injected, nothing served
        const root = new URL('.', config.root).pathname;
        injectRoute({ pattern: '/board', entrypoint: './src/board/Board.astro' });
        updateConfig({ vite: { plugins: [briefFileServer(root), settingsServer(root)] } });
        logger.info('Project board at /board (preview only — never built)');
      },
    },
  };
}
