---
name: qa-checklist
description: The pre-ship quality checklist for a landing page built with this kit — responsive layouts at 390/834/1440/1920, accessibility (WCAG AA basics), performance (images, fonts, LCP, CLS), SEO and social meta, links/forms/404, motion and console checks — with the commands to run each check and the fix for each common failure. Load when running /review or verifying a build.
---

# QA checklist — run all, fix what you can, report the rest

Work from a running dev server (`http://localhost:4321`) and a passing `npm run build`. Produce `brief/REVIEW.md` with three lists: **Fixed automatically**, **Needs the designer**, **Nice to have**. Be specific ("Features card 3 title wraps to 3 lines at 834") — vague findings are useless.

## 1. Build & console

- `npm run build` passes with no warnings about missing assets or unclosed tags.
- `npm run shots` prints no console errors at any width. Fix every error (404 asset, undefined variable, GSAP target not found → guard with `if (el)`).

## 2. Responsive (look at every screenshot)

`npm run shots` (390/834/1440) and `npm run shots -- --width 1920`.

- No horizontal scroll at 390: `document.documentElement.scrollWidth <= innerWidth` (check via the shots script console or a quick Playwright eval). Usual culprits: a fixed-width element, an image without `max-width`, `100vw` with scrollbars, a marquee track.
- Text never overflows its box or gets cut; headlines wrap at natural points; no orphaned single words on key headlines (use `&nbsp;` or `max-width`).
- Tap targets ≥ 44 × 44 px on mobile; nav works on mobile (menu opens/closes, closes on link click).
- Grids collapse in reading order; nothing hidden that carries meaning.
- 1920: the layout stays contained (containers, not stretched); hero media doesn't pixelate (serve larger widths).
- Section padding scales (`--section-padding` clamp) — no giant empty gaps on mobile.

## 3. Accessibility (AA basics)

- One `<h1>`; heading levels don't skip; landmarks: `<header>`, `<main>`, `<footer>`, `<nav aria-label>`.
- Every `<img>` has `alt` (meaningful text, or `alt=""` if decorative). Videos decorative → `aria-hidden="true"`; informative → text alternative nearby.
- Colour contrast: body text ≥ 4.5:1, large text ≥ 3:1, UI borders/icons ≥ 3:1. Check tokens with a contrast formula (`node -e` quick script) — muted text on tinted backgrounds fails most often.
- Keyboard: every link/button reachable with Tab, visible focus (global `:focus-visible` exists — don't remove), accordions/menus operable with Enter/Space, skip link works.
- Reduced motion: with `prefers-reduced-motion`, everything is visible and static (`npm run shots` uses reduced motion — if something is missing in shots, it's this).
- Forms: `<label>` for every field, error messages associated (`aria-describedby`), submit button is a `<button>`.
- Language set on `<html lang>`; page title meaningful.

## 4. Performance

- Hero image/video: `loading="eager" fetchpriority="high"` / `preload="metadata"` + poster. All other images lazy (default).
- Images sized: no image rendered at more than 2× its displayed size; `widths`/`sizes` set for large images; total image weight of the page < 2 MB on desktop, < 1 MB mobile (`ls -la dist/_astro | sort -k5 -n`).
- Fonts: ≤ 2 families, ≤ 4 files, `woff2`, `font-display: swap`, display face preloaded.
- Layout shift: images have intrinsic dimensions (Astro `<Image>` does this); fonts have metric fallbacks; nothing injected above content after load.
- JS: only GSAP/Lenis (+ Three only if approved). `dist/` total JS < 150 kB gzip without Three.
- Optional score: `npx lighthouse http://localhost:4321 --preset=desktop --only-categories=performance,accessibility,seo --quiet --chrome-flags="--headless" --output=json --output-path=brief/lighthouse.json` (skip if it takes > 2 min). Target ≥ 90 each.

## 5. SEO & social

- `<title>` (≤ 60 chars, brand + promise), `<meta name="description">` (≤ 155 chars), canonical, `lang`.
- `og:title`, `og:description`, `og:image` (absolute URL, 1200 × 630 in `public/og.jpg` — generate one from the hero if missing and mark "Needs the designer" to approve), `twitter:card`.
- `noindex` removed for production (kit default is on).
- `public/robots.txt` exists (`User-agent: *\nAllow: /\nSitemap: <site>/sitemap-index.xml` if a sitemap integration is added; otherwise omit the sitemap line).
- Favicon (`favicon.svg` + optional `apple-touch-icon.png` 180 px).
- `astro.config.mjs` `site` is the real domain.

## 6. Links, forms, content

- No `href="#"` or empty links; external links `rel="noopener"`; mail/phone links (`mailto:`, `tel:`) correct.
- Form submits to a real endpoint and shows success/error states (see `launch-essentials`). Test with a real submission if the endpoint is set.
- No lorem ipsum, no `TODO` text visible; legal links (privacy/terms) exist if a form or analytics is present.
- Copy: consistent capitalisation of buttons; no double spaces; typographic quotes/dashes.

## 7. Motion

- `npm run shots -- --scroll --width 1440` and `--width 390`: nothing stuck invisible; pinned sections show progression; no overlap glitches at the end of a pin.
- Every animated element also exists visibly without JS.
- No motion on reduced-motion.

## 8. Cross-browser sanity

- Safari specifics: `100svh` used instead of `100vh` for full-height sections; `backdrop-filter` has `-webkit-` prefix (Astro/Vite autoprefixes when `browserslist` present — add `"browserslist": ["defaults"]` to package.json if not); videos have `playsinline`.
- Check `color-mix()` and `clip-path` usage degrade acceptably (they're fine in current browsers).

## Report format (`brief/REVIEW.md`)

```
# Review — <date>
Build: pass · Console: clean · Widths checked: 390/834/1440/1920 · Lighthouse: 96/100/100 (if run)

## Fixed automatically (N)
- <what, where>

## Needs the designer (N)
- <question in plain words> — why it matters in 5 words

## Nice to have (N)
- <suggestion>
```
