/*
  Landing Kit — MOTION CORE
  ---------------------------------------------------------------
  Loaded once from the Base layout. Sets up:
    • GSAP + ScrollTrigger (registered, ready for any section)
    • Lenis smooth scroll, synced with GSAP's ticker
    • Automatic "reveal on scroll" for any element with [data-reveal]
    • Respect for prefers-reduced-motion

  Section components add their own animations in their own <script>
  by importing { gsap, ScrollTrigger } from this file (see motion skill).
*/

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

export const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Mark the document so CSS knows JS is running (see global.css [data-reveal]).
document.documentElement.classList.add('js');
if (prefersReducedMotion) document.documentElement.classList.add('reduced-motion');

// ---------- Smooth scroll (Lenis) ----------
export let lenis = null;

if (!prefersReducedMotion) {
  lenis = new Lenis({
    lerp: 0.1,          // 0.05 = floaty, 0.15 = snappy
    smoothWheel: true,
  });

  // Keep ScrollTrigger in sync with Lenis
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Anchor links scroll smoothly through Lenis
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: 0 });
    });
  });
}

// ---------- Reveal on scroll ----------
// Usage in any section:  <h2 data-reveal>…</h2>
// Optional: data-reveal-delay="0.2"  data-reveal-y="40"  data-reveal-group (stagger children)
export function initReveals(scope = document) {
  if (prefersReducedMotion) return;

  // Grouped stagger: <ul data-reveal-group> <li>…</li> <li>…</li> </ul>
  scope.querySelectorAll('[data-reveal-group]').forEach((group) => {
    const items = Array.from(group.children);
    gsap.set(items, { opacity: 0, y: 24 });
    ScrollTrigger.create({
      trigger: group,
      start: 'top 85%',
      once: true,
      onEnter: () =>
        gsap.to(items, {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.08,
          overwrite: 'auto',
        }),
    });
  });

  // Single elements
  scope.querySelectorAll('[data-reveal]').forEach((el) => {
    const delay = parseFloat(el.dataset.revealDelay || '0');
    const y = parseFloat(el.dataset.revealY || '24');
    gsap.set(el, { opacity: 0, y });
    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: () =>
        gsap.to(el, { opacity: 1, y: 0, duration: 0.9, delay, ease: 'power3.out', overwrite: 'auto' }),
    });
  });
}

initReveals();

// Recalculate trigger positions once images/fonts have loaded (prevents misfires).
window.addEventListener('load', () => ScrollTrigger.refresh());
