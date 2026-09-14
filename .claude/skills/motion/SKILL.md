---
name: motion
description: Motion knowledge for landing pages — the rules that make animation feel premium, the decision tree (CSS vs GSAP vs ScrollTrigger vs Three.js), and copy-ready recipes for GSAP 3.15 + ScrollTrigger + Lenis in this kit (hero intro, text line reveal, pinned scroll story with media morph, parallax, count-up, rotating ticker, marquee, curtain footer, sticky nav pill, magnetic hover, ambient canvas/3D). Load whenever writing or reviewing any animation.
---

# Motion — recipes and rules for this kit

The kit already loads GSAP + ScrollTrigger + Lenis once (`src/scripts/motion.js`) and gives every section free entrance reveals via `[data-reveal]` / `[data-reveal-group]`. Everything below builds on that: import `{ gsap, ScrollTrigger, prefersReducedMotion }` from `../scripts/motion.js` inside a section's `<script>`.

## 1. The taste rules (what separates premium from "AI-made")

1. **Fewer effects, more intention.** A page needs 2–4 signature moments, not motion on everything. Reveals everywhere + one or two hero moments is the premium default.
2. **Slow and smooth.** Entrances 0.6–1.2 s. Eases `power2.out` / `power3.out` / `expo.out`. Scrubs use `ease: 'none'`. No bounce, elastic or back eases unless the brand is playful *and* the designer asked.
3. **Small distances.** Reveal travel 16–40 px. Parallax ±5–12%. Big movements only in scrubbed, scroll-tied sequences where the user controls the speed.
4. **Stagger, don't sync.** Lists and grids stagger 0.06–0.12 s. Hero elements enter in reading order.
5. **Once is enough.** Entrance reveals play once (`once: true`); they don't replay on scroll-up.
6. **Motion follows hierarchy.** The headline moves first and most; decoration moves last and least.
7. **Nothing moves under a reading eye.** No ambient motion behind body text. Ambient loops belong in the hero or in media cards.
8. **Reduced motion is a first-class variant**, not a bug fix: `prefersReducedMotion` → static, everything visible.
9. **Mobile gets a simpler story.** Pinned/scrubbed sections usually become stacked reveals under 1024 px. Test at 390.
10. **Performance is part of the feel.** Only `transform`, `opacity`, `clip-path`, `filter`. `will-change` only on elements about to animate, removed after. No layout properties, ever.

## 2. Decision tree

- Hover / focus / simple state change → **CSS transitions** (`var(--duration-fast)`, `var(--ease-out)`).
- Something appears when scrolled into view → **`data-reveal`** (free). Custom entrance → `ScrollTrigger.create({ once: true })` + `gsap.to`.
- Something changes *as* you scroll (tied to scroll position) → **ScrollTrigger `scrub`**.
- A section holds while things happen inside it → **ScrollTrigger `pin`** + timeline with `scrub`.
- Looping ambient texture → **looping video** (`<video>`) first; CSS keyframes second; **canvas/Three.js last** and only for a hero when the brief says 3D/particles.
- Choreographed intro on load → **GSAP timeline** on `DOMContentLoaded` (hero only).
- Smooth inertia scroll → already on (Lenis). Turn off per project by removing the Lenis block in `motion.js` if the client's site must feel "native".

## 3. Recipes

All recipes assume this scaffold inside a section's `<script>`:

```js
import { gsap, ScrollTrigger, prefersReducedMotion } from '../scripts/motion.js';
const root = document.querySelector('#SECTION_ID');
if (root && !prefersReducedMotion) {
  // recipe here
}
```

### 3.1 Hero intro timeline (page load)

```js
const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 1 } });
tl.from(root.querySelectorAll('.hero__title .line'), { yPercent: 110, stagger: 0.08 })   // see 3.2 for lines
  .from(root.querySelector('.hero__lede'), { y: 16, opacity: 0 }, '-=0.6')
  .from(root.querySelector('.hero__cta'), { y: 12, opacity: 0 }, '-=0.7')
  .from(root.querySelector('.hero__media'), { opacity: 0, scale: 1.04, duration: 1.4 }, '-=0.9');
```
Remove `data-reveal` from hero elements (the timeline owns them). Wrap each title line in `<span class="line">` inside an `overflow:hidden` mask, or use SplitText (3.2).

### 3.2 Text line reveal (masked lines) — SplitText is free in GSAP ≥ 3.13

```js
import { SplitText } from 'gsap/SplitText';
gsap.registerPlugin(SplitText);
SplitText.create(root.querySelector('h2'), {
  type: 'lines',
  mask: 'lines',          // wraps lines in overflow-hidden masks
  autoSplit: true,        // re-splits on resize / font load
  onSplit(self) {
    return gsap.from(self.lines, {
      yPercent: 110, duration: 1, ease: 'power3.out', stagger: 0.08,
      scrollTrigger: { trigger: root, start: 'top 80%', once: true },
    });
  },
});
```
Use for headlines only (h1/h2). Body text just fades.

### 3.3 Pinned scroll story (media holds, captions swap, media morphs)

HTML shape: `.story` (the pinned viewport, `min-height: 100svh`) containing `.story__media` (one element, centred) and `.story__steps` with N `.story__step` captions absolutely positioned (left/right/bottom). Section height is set by the pin distance, not by content.

```js
const steps = gsap.utils.toArray(root.querySelectorAll('.story__step'));
const media = root.querySelector('.story__media');
const mm = gsap.matchMedia();

mm.add('(min-width: 1024px)', () => {
  gsap.set(steps, { autoAlpha: 0, y: 24 });
  gsap.set(steps[0], { autoAlpha: 1, y: 0 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: root, start: 'top top', end: () => `+=${steps.length * 100}%`,
      pin: true, scrub: 0.6, anticipatePin: 1,
    },
    defaults: { ease: 'none' },
  });

  // media morph: small rounded card → wide
  tl.fromTo(media, { scale: 0.55, clipPath: 'inset(0% 0% round 32px)' },
                   { scale: 1,    clipPath: 'inset(0% 0% round 0px)', duration: 1 }, 0);

  steps.forEach((step, i) => {
    if (i === 0) return;
    tl.to(steps[i - 1], { autoAlpha: 0, y: -24, duration: 0.3 }, i - 0.3)
      .fromTo(step, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.3 }, i - 0.1);
    // optional: swap the media source per step
    // tl.call(() => swapMedia(i), null, i);
  });

  return () => tl.scrollTrigger?.kill();   // cleanup when the media query stops matching
});

mm.add('(max-width: 1023px)', () => {
  // Mobile: no pin. Stack steps with plain reveals (CSS puts them in normal flow under 1024px).
  gsap.set(steps, { clearProps: 'all' });
});
```
Give `.story__media` `transform-origin: center` and `will-change: transform`. Videos inside: `autoplay muted loop playsinline`. Add a mobile CSS layout where the steps are static, stacked under the media.

### 3.4 Parallax (floating cards / images at different speeds)

```js
gsap.utils.toArray(root.querySelectorAll('[data-parallax]')).forEach((el) => {
  const speed = parseFloat(el.dataset.parallax || '0.15');   // 0.1 subtle, 0.3 strong
  gsap.to(el, {
    yPercent: -100 * speed, ease: 'none',
    scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: true },
  });
});
```
Markup: `<img data-parallax="0.2">`, `<div class="card" data-parallax="-0.1">` (negative = moves the other way).

### 3.5 Count-up number

```js
const el = root.querySelector('[data-count]');
const target = parseFloat(el.dataset.count);        // e.g. 98
const suffix = el.dataset.suffix || '';             // e.g. "%"
const obj = { v: 0 };
ScrollTrigger.create({
  trigger: el, start: 'top 80%', once: true,
  onEnter: () => gsap.to(obj, {
    v: target, duration: 1.8, ease: 'power2.out',
    onUpdate: () => { el.textContent = Math.round(obj.v) + suffix; },
  }),
});
```
Keep the final value in the HTML too, so it reads right without JS.

### 3.6 Rotating ticker (one line cycles through phrases — hero stat pills)

```js
const items = gsap.utils.toArray(root.querySelectorAll('.ticker__item'));  // stacked absolutely in a fixed-height, overflow-hidden box
gsap.set(items, { yPercent: 100, autoAlpha: 0 });
const tl = gsap.timeline({ repeat: -1 });
items.forEach((item) => {
  tl.to(item, { yPercent: 0, autoAlpha: 1, duration: 0.6, ease: 'power3.out' })
    .to(item, { yPercent: -100, autoAlpha: 0, duration: 0.5, ease: 'power3.in' }, '+=1.8');
});
```

### 3.7 Marquee (logos / phrases) — CSS only

```css
.marquee { overflow: hidden; mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent); }
.marquee__track { display: flex; gap: var(--space-8); width: max-content; animation: marquee 40s linear infinite; }
.marquee:hover .marquee__track { animation-play-state: paused; }
@keyframes marquee { to { transform: translateX(-50%); } }
@media (prefers-reduced-motion: reduce) { .marquee__track { animation: none; } }
```
Duplicate the items once inside `.marquee__track` (so `-50%` loops seamlessly).

### 3.8 Curtain footer (footer revealed from beneath the last section)

```css
main { position: relative; z-index: 1; background: var(--color-bg); margin-bottom: var(--footer-h, 0px); box-shadow: 0 40px 80px rgb(0 0 0 / .08); }
footer.curtain { position: fixed; inset: auto 0 0 0; z-index: 0; }
```
```js
const footer = document.querySelector('footer.curtain');
const setH = () => document.documentElement.style.setProperty('--footer-h', footer.offsetHeight + 'px');
setH(); window.addEventListener('resize', setH);
```
Skip on mobile if the footer is taller than the viewport.

### 3.9 Sticky nav pill (centered floating nav that condenses on scroll)

```js
const nav = document.querySelector('.nav');
ScrollTrigger.create({
  start: 'top -80', onUpdate: (self) => nav.classList.toggle('nav--scrolled', self.scroll() > 80),
});
```
CSS transitions handle the size/blur change (`backdrop-filter: blur(12px)`, padding, background alpha).

### 3.10 Magnetic button (desktop only)

```js
if (matchMedia('(hover: hover)').matches) {
  root.querySelectorAll('.btn--primary').forEach((btn) => {
    const strength = 0.25;
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      gsap.to(btn, { x: (e.clientX - r.left - r.width / 2) * strength, y: (e.clientY - r.top - r.height / 2) * strength, duration: 0.4, ease: 'power3.out' });
    });
    btn.addEventListener('pointerleave', () => gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' }));
  });
}
```

### 3.11 Media crossfade on scroll (image A → B as a section passes)

```js
gsap.to(root.querySelector('.media__b'), {
  opacity: 1, ease: 'none',
  scrollTrigger: { trigger: root, start: 'top 60%', end: 'bottom 40%', scrub: true },
});
```
Stack `.media__a` and `.media__b` absolutely; `.media__b` starts at `opacity: 0`.

### 3.12 Ambient canvas / Three.js hero (only when approved)

Rules: dynamic import (keeps the page light), cap pixel ratio at 2, pause when off-screen, resize-aware, poster image behind the canvas as fallback, never on reduced motion, and a simple version on mobile (or none).

```js
if (!prefersReducedMotion && matchMedia('(min-width: 768px)').matches) {
  const canvas = root.querySelector('canvas');
  const { default: initScene } = await import('../scripts/scenes/hero-scene.js');   // your scene file
  const scene = initScene(canvas);      // returns { start, stop, resize }
  new IntersectionObserver(([e]) => (e.isIntersecting ? scene.start() : scene.stop()), { threshold: 0.05 }).observe(root);
  window.addEventListener('resize', scene.resize);
}
```
`npm install three` only after the designer says yes. A minimal scene: one mesh or a particle field, `renderer.setPixelRatio(Math.min(devicePixelRatio, 2))`, `requestAnimationFrame` loop stopped on `stop()`.

## 4. Astro specifics

- Scripts in `.astro` components are bundled modules and run once per page load — safe to import GSAP in every section; Astro dedupes.
- Don't use `is:inline` for motion scripts (loses bundling and imports).
- If the project ever uses view transitions (`<ClientRouter />`), move initialisation into `document.addEventListener('astro:page-load', …)`. Single landings don't need it.
- Images loading late shift trigger positions: `motion.js` calls `ScrollTrigger.refresh()` on `load`; if a section loads media lazily, call it again when that media loads.

## 5. Checklist before calling motion done

- [ ] Every effect is guarded by `prefersReducedMotion`.
- [ ] Pinned/scrubbed sections have a mobile variant and were tested at 390.
- [ ] `npm run shots -- --scroll --width 1440` shows nothing stuck invisible.
- [ ] No console errors; `npm run build` passes.
- [ ] The designer scrolled it slowly and said it feels right.
