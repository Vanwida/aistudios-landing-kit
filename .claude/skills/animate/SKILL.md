---
name: animate
description: Add motion to the landing page (or one section) according to the motion level and the Style & Motion brief — proposes a short "motion menu" in plain words, then implements it with GSAP, ScrollTrigger, Lenis or CSS, respecting reduced motion and performance rules. Use when the designer says "animate", "add motion", "make it move", "scroll effect", "like the reference site".
argument-hint: [section name]
---

# /animate — motion that feels expensive, not busy

Motion is where "AI-made" pages usually give themselves away: too much, too fast, too bouncy. High-quality sites move **less, slower, and with intention**. Read the `motion` skill (recipes + rules) before doing anything.

## Step 1 — scope

- `$ARGUMENTS` names a section → only that section.
- Otherwise: all built sections that don't yet have motion beyond `data-reveal`.
- Motion level and vocabulary come from `brief/PROJECT.md` (level 1/2/3) and `brief/DESIGN.md` (Inspiration → Motion vocabulary). If neither exists, assume level 2.

## Step 2 — propose a motion menu (designer approves)

Use the question tool: one multi-select question per 3–4 effects, each option one plain-words line, all pre-selected (they untick what they don't want). Example for a level-3 page:

> Here's what I propose — say yes, or cross out what you don't want:
> 1. **Hero** — headline lines rise in one after another, then the video fades up (1.2 s total).
> 2. **Story section** — holds in place while you scroll; the media card grows to full width and the three captions swap.
> 3. **Stats** — the big number counts up when it enters the screen.
> 4. **Testimonials** — cards drift slightly at different speeds (subtle parallax).
> 5. **Footer** — revealed from beneath the last section like a curtain.
> Everything else keeps the gentle fade-up it already has.

Wait for their answer. **One message, one decision.** If the level is 1, skip the menu: just confirm the reveals are tuned and stop.

## Step 3 — implement (delegate heavy work to `motion-designer`)

For each approved effect, use the matching recipe in the `motion` skill. Delegate the implementation of pinned stories, scrub timelines and any canvas/3D to the `motion-designer` agent (it preloads the recipes). Small effects (count-up, parallax, hover) you can do inline.

Rules that always apply (from the `motion` skill):
- Guard everything with `prefersReducedMotion`.
- Animate `transform`/`opacity`/`clip-path` only. Eases: `power2.out`/`power3.out` for entrances, `none` for scrubs, never `bounce`/`elastic` unless the brand is playful and the designer asked.
- Durations 0.6–1.2 s for entrances; stagger 0.06–0.12 s.
- Pinned sections: `pin: true`, `scrub: true` (or `scrub: 0.5` for a slight lag), `anticipatePin: 1`, and a mobile fallback (usually: no pin, simple stacked reveals).
- Call `ScrollTrigger.refresh()` after images/videos load (motion.js already does it on `load`).
- Three.js only if explicitly approved; always with a poster fallback and `IntersectionObserver` pause when off-screen.

## Step 4 — verify

1. `npm run shots -- --scroll --width 1440` → 6 frames down the page. **Look at them**: elements should be visible where they should be; nothing stuck at opacity 0; pinned sections should show intermediate states.
2. `npm run shots -- --scroll --width 390` for mobile.
3. No console errors. `npm run build` passes.
4. Ask the designer to scroll the preview slowly, top to bottom, and tell you: "Is anything too fast, too much, or moving when it shouldn't?" Tune from their words: "too much" → reduce distance and duration by ~30%; "too fast" → +0.2 s and a softer ease; "feels cheap" → remove one effect, slow the rest.

## Step 5 — save point

`git add -A && git commit -m "motion: <scope>"` (+ `git push` if `origin` exists). Update each section's `"motion"` field in `brief/sections.json` with the effect name(s) ("reveal", "pinned story + morph", "count-up + parallax"…) and append to `log`.

Close with: "Motion is in. Scroll the preview slowly and tell me how it feels. Next: say **review** when the page is complete, or **next** for the next section."
