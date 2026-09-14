---
name: inspire
description: Analyse a reference website the designer admires and turn it into a Style & Motion brief (layout system, typography, colour, media treatment, motion vocabulary, quality signals) saved in brief/DESIGN.md. Use when the designer pastes a URL and says "like this", "this feel", "this quality", or asks to replicate a site's motion.
argument-hint: <url> [what you like about it]
---

# /inspire — turn a reference site into a brief we can build from

A designer says "I want it to feel like this site." Your job is to see what they see — and what they don't consciously see — and write it down precisely enough that `/build` and `/animate` can reproduce the *quality*, not the content.

**We replicate structure, rhythm, technique and quality. We never copy a site's copy, logo, photos, videos, or brand.** The client's own content goes in.

## Inputs

`$ARGUMENTS` = one URL, optionally followed by what they like. If several URLs, analyse each, then write a short "combined direction" paragraph.

## Step 1 — capture (run quietly)

1. `WebFetch` the URL. Note: headline, sub-headline, CTA labels, section order, copy tone, any visible library names (gsap, lenis, three, framer, webflow, next).
2. Screenshots: `npm run shots -- --url <url> --name <hostname>` (3 widths, saved in `brief/inspiration/`), then `npm run shots -- --url <url> --name <hostname> --scroll --width 1440` (6 frames down the page — this shows what changes as you scroll). **Look at every image.**
3. **Motion probe**: `npm run probe -- --url <url>` (and `--width 390` for mobile). It scrolls the page 24 times and reports which elements change transform / opacity / clip-path / filter, whether the change is continuous (scrubbed) or one-off (entrance), and inside which section — plus libraries, fonts, sticky elements and surfaces. Read `brief/inspiration/<host>-probe-1440.md`. This is how you find the particularities a human notices ("the image zooms inside its frame while the section is pinned", "captions swap in a sticky block").
4. **Live investigation (if browser tools are available)**: when Claude Code has the Chrome extension or a browser tool connected, open the site there and behave like a curious human: scroll slowly, hover buttons and cards, resize to phone width, open the menu. Use the browser's JavaScript tool to run the same checks the probe does (`window.gsap`, `document.querySelectorAll('video, canvas')`, computed styles of the `h1`). Note hover effects and cursor changes — the probe can't see those.
5. If everything fails (some sites block headless browsers), ask the designer to scroll the site slowly while you ask three questions: "What stays fixed while you scroll? What moves at a different speed than the page? Is there a moment where the page 'holds' and something transforms?"

## Step 2 — analyse like a senior designer + creative developer

Go section by section from the top. For each section, record:

- **Role** (hero / proof / story / features / testimonial / FAQ / CTA / footer)
- **Layout**: columns, alignment, max-width feel (contained vs full-bleed), density, how much white space.
- **Typography**: display font category (serif / grotesk / geometric / mono), weight feel (light/regular/bold), size relationships (how big is the h1 relative to body), italics or mixed styles for emphasis, tracking, line length.
- **Colour & surface**: background tone (pure white vs warm off-white vs dark), how accents are used (sparingly? big blocks?), borders vs shadows vs flat.
- **Media**: photos vs illustration vs UI screenshots vs video; treatment (blurred, muted, high-contrast, rounded corners radius feel, full-bleed vs cards).
- **Motion** — the important part. Use this vocabulary and name **which** apply, **where**, and **how intense**:
  - *Smooth scroll* (Lenis-style inertia)
  - *Entrance reveal* (fade-up on scroll, staggered lists)
  - *Text reveal* (lines/words/chars appearing, masked)
  - *Parallax* (layers moving at different speeds, floating cards)
  - *Pinned scroll story* (a section holds while text swaps and media transforms)
  - *Scrub* (animation tied 1:1 to scroll position — progress, morphing, horizontal scroll)
  - *Media morph* (a card grows to full-bleed, image crossfades on scroll)
  - *Count-up* numbers, *ticker/rotating text*, *marquee*
  - *Sticky nav pill*, *curtain footer* (footer revealed from beneath the last section)
  - *Hover micro-interactions* (magnetic buttons, image tilt, underline draws)
  - *Ambient* (looping video, gradient drift, particles, canvas/3D)
  - *Page load sequence* (hero elements choreographed in)
- **Quality signals**: what makes it feel expensive? (e.g. "generous 128px section padding", "one typeface family, three sizes", "every image has the same warm grade", "motion is slow — 0.9–1.2s eases — and never bounces").

## Step 3 — write the Style & Motion brief

Open `brief/DESIGN.md` and fill the **Inspiration** section (keep the rest). Structure:

```
## Inspiration — <hostname>
Captured: <date> · Screens: brief/inspiration/<hostname>-*.png

### In one sentence
<the feel, e.g. "Warm editorial calm: serif light headlines, off-white paper, blurred nature video, slow scroll storytelling.">

### Layout system
…

### Typography
Display: <category + weight feel + what to do with italics>. Body: <…>. Labels: <mono? caps?>.
Suggested free equivalents (if the original fonts are commercial): <Google/Fontsource names>.

### Colour & surface
…

### Media treatment
…

### Motion vocabulary (ordered by impact)
1. <effect> — where — intensity — implementation note (GSAP/CSS/Lenis)
2. …

### Section-by-section map
| # | Section | What happens visually | Motion |
|---|---|---|---|

### Quality rules to copy
- …

### What NOT to copy
- brand, copy, photos, videos, logo, exact colours (if brand-specific)
```

Where a technique needs a specific implementation, name the recipe from the `motion` skill (e.g. "pinned story → recipe *Pinned scroll story*").

## Step 4 — tell the designer

Three short paragraphs: the one-sentence feel; the 3–4 motion effects that define it (plain words); and one honest note about effort ("the pinned story section is the expensive part — about half of the motion work"). Then: "This is now the direction for the design and the quality target for the build — it's on the board under Design & inspiration. Next: say **design it** and I'll draft the Figma from it (or **import** if you already have a finished Figma)."

When `inspire` runs inside `new-landing`, skip this closing line — the architecture questions come next, pre-filled from what you just found.
