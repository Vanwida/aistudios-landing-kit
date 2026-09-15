// @ts-check
import { defineConfig } from 'astro/config';
import board from './src/board/integration.mjs';

// Landing Kit — Astro configuration.
// Static output (the default): the site builds to plain HTML/CSS/JS files
// that Vercel serves. No server, no adapter needed.
export default defineConfig({
  // Set this to the final domain in /ship (used for sitemap + canonical URLs).
  // Example: site: 'https://www.client-domain.com'
  site: 'https://example.com',

  // Astro defaults to 'jsx' whitespace compression, which removes spaces
  // between inline elements (<strong>Hi</strong> there -> "Hithere").
  // Keep classic behaviour so text always reads as written.
  compressHTML: true,

  devToolbar: { enabled: false },

  server: { port: 4321, host: true },

  // The designer's project board at /board — exists only in `astro dev`, never in a build.
  integrations: [board()],
});
