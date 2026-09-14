---
paths:
  - "src/sections/**/*.astro"
  - "src/components/**/*.astro"
---

# Rules for section and component files

- Follow the shape of `src/sections/_Example.astro`: frontmatter → `<section id="…">` → `<Container>` → semantic HTML → scoped `<style>` → optional `<script>`.
- The `id` on `<section>` is the kebab-case section name from `brief/sections.json` (e.g. `hero`, `how-it-works`). It is used by screenshots and anchor links. Never change it after the section is built.
- Exactly one `<h1>` on the whole page (in the hero). Every other section starts with an `<h2>`; sub-items use `<h3>`.
- No hard-coded colours, font sizes, font families, spacing or radii. Use `var(--token)` from `src/styles/tokens.css`. A one-off value becomes a section-scoped custom property declared on the section root.
- Mobile first: base styles are the 390px layout; add `@media (min-width: 768px)` for tablet and `@media (min-width: 1024px)` for desktop. Never `max-width` queries.
- Images: `import` from `src/assets/` and render with `<Image>` from `astro:assets`, with `widths` and `sizes`. Decorative images get `alt=""`; meaningful images get a real description. The hero's main image/video gets `loading="eager"` and `fetchpriority="high"`; everything else lazy.
- Video: `<video autoplay muted loop playsinline preload="metadata" poster="…">`. Never autoplay with sound.
- Motion: standard reveals via `data-reveal` / `data-reveal-group`. Custom motion in the section's `<script>`, importing `{ gsap, ScrollTrigger, prefersReducedMotion }` from `../scripts/motion.js`. Always guard with `if (!prefersReducedMotion)`. Animate only `transform`, `opacity`, `clip-path`, `filter`. Never animate `width`, `height`, `top`, `left`, `margin`.
- Astro 7's compiler is strict: every non-void element must be closed, and nesting must be valid HTML (no `<div>` inside `<p>`, no `<a>` inside `<a>`).
- Text must be editable by a human later: keep copy as plain text in the markup (or props), not buried in JavaScript.
- Keep each section file under ~250 lines. If it grows past that, extract a component into `src/components/`.
