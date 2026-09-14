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

import { readFile, stat } from 'node:fs/promises';
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

export default function board() {
  return {
    name: 'landing-kit-board',
    hooks: {
      'astro:config:setup': ({ command, injectRoute, updateConfig, config, logger }) => {
        if (command !== 'dev') return; // build + preview: nothing injected, nothing served
        const root = new URL('.', config.root).pathname;
        injectRoute({ pattern: '/board', entrypoint: './src/board/Board.astro' });
        updateConfig({ vite: { plugins: [briefFileServer(root)] } });
        logger.info('Project board at /board (preview only — never built)');
      },
    },
  };
}
