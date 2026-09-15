---
name: astro-conventions
description: Project conventions for this Astro landing kit — folder structure, the section component pattern, design tokens and CSS rules, images and video, fonts, header/footer slots, scripts, and the optional Figma-proportional scaling mode. Load before writing or editing any .astro, .css or script file.
---

# Astro conventions for the Landing Kit

## Folder map (what goes where)

```
src/
  pages/index.astro        the page: only imports and lists sections, in order
  layouts/Base.astro       <head>, meta/OG, fonts, skip link, header/footer slots, loads motion.js
  sections/<Name>.astro    ONE section = ONE file (Hero, Features, Faq, Cta, Header, Footer…)
  components/              small reusable pieces: Container, Button, (Card, Accordion, Marquee…)
  styles/tokens.css        design tokens = Figma variables (colours, type, space, radius, motion)
  styles/global.css        reset + base typography + layout primitives + utilities
  scripts/motion.js        GSAP/ScrollTrigger/Lenis core + data-reveal (loaded once)
  scripts/<feature>.js     optional shared behaviours (accordion, form, scenes/)
  board/                   the designer's project board (/board) — dev only, never built; extend it, don't add pages
  assets/                  images exported from Figma (imported by sections → optimised by Astro)
public/
  fonts/                   self-hosted .woff2
  video/                   .mp4/.webm + poster images
  favicon.svg, og.jpg, robots.txt
brief/                     Claude's notes (PROJECT.md, DESIGN.md, sections.json, REVIEW.md, HANDOFF.md) + figma/, shots/, inspiration/ — humans see them on the board
scripts/                   shots.mjs (screenshots), probe.mjs (motion probe), handoff-page.mjs (client page)
```

## The section pattern (copy `_Example.astro`)

```astro
---
import Container from '../components/Container.astro';
import { Image } from 'astro:assets';
import photo from '../assets/features/photo.jpg';
interface Props { title?: string }
const { title = 'Default title from the brief' } = Astro.props;
---
<section id="features" class="section features" aria-labelledby="features-title">
  <Container>
    <h2 id="features-title" data-reveal>{title}</h2>
    …
  </Container>
</section>
<style>
  .features { --card-radius: var(--radius-lg); }        /* section-scoped vars OK */
  .features__grid { display: grid; gap: var(--grid-gap); }
  @media (min-width: 768px) { .features__grid { grid-template-columns: repeat(3, 1fr); } }
</style>
<script>
  import { gsap, ScrollTrigger, prefersReducedMotion } from '../scripts/motion.js';
  …
</script>
```

Naming: file `PascalCase.astro`, id and class `kebab-case`, BEM-ish classes `block__element--modifier`. The section id == the id in `brief/sections.json`.

Header and footer: `Header.astro` renders `<header>` and is placed with `<Header slot="header" />` in `index.astro`; `Footer.astro` with `slot="footer"`. Everything else goes inside `<main>` automatically.

## CSS rules

- Tokens for everything: `color: var(--color-text-muted)`, `padding-block: var(--section-padding)`, `gap: var(--space-5)`. A magic number in a section is a bug.
- Fluid type is built in (`--text-*` use `clamp()`), so headings rarely need media queries.
- Mobile first: base = 390 design; `@media (min-width: 768px)` tablet; `@media (min-width: 1024px)` desktop; `@media (min-width: 1440px)` wide only if the design changes there.
- Layout with `display: grid` / `flex` and `gap`. No floats, no absolute positioning for layout (only for overlays and decorative layers).
- Text measure: body copy `max-width: 60–70ch`. Headlines `text-wrap: balance` (already global).
- Never `!important`. Never inline styles except `style={{ '--i': index }}` for stagger indices.
- Hover states on every interactive element, using `var(--duration-fast) var(--ease-out)`. Focus states are global — don't remove outlines.
- Dark sections: set `--color-bg`, `--color-text`, `--color-text-muted`, `--color-border` on the section root (local override) instead of restyling children.

### Optional mode: Figma-proportional scaling

Some premium sites (lassie.ai, many agency sites) scale the *whole* layout with the viewport so the desktop looks exactly like the Figma frame at any width. To enable it for a project, add to `global.css`:

```css
html { font-size: clamp(8px, 0.6944vw, 12px); }   /* 10px at 1440 → 1rem = 10px */
```
and then write sizes in `rem` where `1rem = 10px` at 1440 (a 64px heading → `6.4rem`). Update `--text-*` and `--space-*` tokens accordingly. Trade-off: type scales with the window (great for fidelity, slightly worse for people who zoom). Use it when the brief says "exactly like the reference" and the reference does this. Mobile keeps its own clamp floor.

## Images

- Import from `src/assets/` and use `<Image>` (`astro:assets`). Always pass `alt`; pass `widths={[480, 960, 1440]}` and `sizes` for anything wider than 480 px in the layout. Astro emits WebP/AVIF and srcset automatically.
- Hero LCP image: `loading="eager" fetchpriority="high"`. Everything else default (lazy).
- SVG logos/icons: import and use as `<Image>` or inline the SVG for `currentColor` control (`import Logo from '../assets/logo.svg?raw'` then `<Fragment set:html={Logo} />`).
- Background images that are content → `<Image>` with `object-fit`. Pure texture → CSS `background-image` from `public/`.
- Exported Figma assets are often huge: if a source PNG is > 2 MB, ask the designer for a JPG/WebP export or convert with `sharp` (`node -e` one-liner) and say so.

## Video

`public/video/<name>.mp4` (H.264, ≤ 1080p, ≤ 8 MB) + `<name>.webm` if available + `<name>.jpg` poster.

```html
<video class="hero__video" autoplay muted loop playsinline preload="metadata" poster="/video/hero.jpg" aria-hidden="true">
  <source src="/video/hero.webm" type="video/webm" />
  <source src="/video/hero.mp4" type="video/mp4" />
</video>
```
Decorative videos get `aria-hidden="true"`; informative ones get a caption nearby.

## Fonts

1. Google Fonts → `npm install @fontsource-variable/<name>` (or `@fontsource/<name>`) and `import '@fontsource-variable/<name>';` at the top of `global.css`'s import list *in `Base.astro`* (`import '@fontsource-variable/dm-sans';`). Then set `--font-body: 'DM Sans Variable', …`.
2. Commercial fonts (from the client) → `.woff2` files in `public/fonts/`, `@font-face` in `global.css` with `font-display: swap`, and `<link rel="preload" as="font" type="font/woff2" crossorigin href="/fonts/…">` in `Base.astro` head slot for the display face.
3. Always provide a metric-similar fallback in the stack to reduce layout shift.

## Page-level

- `index.astro` passes `title`, `description`, `ogImage`, `lang` to `Base`. Remove `noindex` before production.
- Anchor navigation: sections have ids; nav links use `#id`; Lenis handles smooth scrolling.
- Forms, analytics, consent: see the `launch-essentials` skill.
- Keep `astro.config.mjs` `site` updated at `/ship`.

## Commands (the only ones you need)

```
npm run dev       # preview at http://localhost:4321 (run in background)
npm run build     # must pass before ship
npm run shots     # screenshots → brief/shots/ (see scripts/shots.mjs header for flags)
```
