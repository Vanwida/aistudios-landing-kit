# Example — Style & Motion brief: lassie.ai

_This is what `/inspire https://www.lassie.ai/` should produce (captured 14 Sep 2026, desktop 1440). Use it as the quality target for the class exercise and as a model for the format. We replicate the **structure, rhythm, techniques and quality** — never the brand, copy, photos, videos or logo._

## In one sentence
Warm editorial calm for a serious product: light serif headlines with italic emphasis, paper-white surfaces, blurred nature video as texture, small "proof" UI cards, and slow scroll storytelling where one media card holds the screen while the story advances.

## Stack facts (from the probe)
- Next.js + Tailwind (irrelevant for us), **Lenis** smooth scroll, no GSAP global (animations bundled — effects are what matter, not the library).
- **Proportional scaling**: `html { font-size: 10px }` at 1440 and scaled with the viewport → the desktop layout is the Figma frame at any width (see `astro-conventions` → proportional scaling).
- 6 `<video>` elements (hero + story chapters + testimonial), 2 `<canvas>` (a dotted map in *Locations*, one in the story section), 3 fixed/sticky blocks: the nav pill, the pinned story viewport, and the **fixed footer** (curtain reveal).
- Page height ≈ 16,450 px at 1440 — long, but 60 % of it is pin distance, not content.

## Layout system
- Contained content ≈ 1200 px inside full-bleed media; generous section padding (≈ 160–270 px between big moments).
- Hero is exactly one viewport (`100svh`); story chapters and *Locations* are also full-viewport blocks; feature/FAQ sections are conventional stacked blocks.
- Floating **pill nav**, fixed top-centre: logo · Company · Demo · Login (Login as a filled pill).

## Typography
- Display: **ABC Marist** (commercial serif), weight **350**, tight leading (0.95–1.05), tracking ≈ −0.02 em; **italic for emphasis inside the headline** ("You're a doctor. *Not a machine.*"). h1 ≈ 86 px, h2 ≈ 58 px at 1440.
- Body: **DM Sans**, regular, ≈ 16–18 px, muted colour for secondary copy. Labels/tickers: **DM Mono**.
- Free equivalents for the exercise: **Instrument Serif** (display + italic) · **DM Sans** · **DM Mono** (all on Google Fonts / Fontsource).

## Colour & surface
- Background `#F9F8F5` (warm paper), text near-black `#120C08`, tint `rgba(227,221,207,.4)` for cards, pure white only in the footer. No accent colour beyond photography; buttons are dark pills. Borders hairline, shadows almost absent.

## Media treatment
- **Blurred, slow nature/office video** (wildflowers, sunlight, a person from behind) — texture, not subject. Muted, looping, poster provided.
- Media in **large rounded cards** (radius ≈ 24–32 px) that can grow to full-bleed.
- **Proof cards**: small UI receipts ("Posted $12,430 in payments", "Confirmed 42 appointments") floating over photos; a dotted **map canvas** for "2,500+ doctors nationwide"; a video testimonial with a *Watch Dr. Kwon's story* play pill.

## Motion vocabulary (ordered by impact)
1. **Pinned scroll story** (chapters "answers your questions" → "keeps you in the loop" → "does your paperwork"): the section holds for ~3 viewports; the centre media card **morphs** (scale + radius → wide), captions **swap** left/right with fades. → recipe 3.3 (+3.11 for media crossfade).
2. **Hero**: full-bleed video, headline lines rise on load, a **rotating ticker** of stat pills under the subline, email + *Get started* pinned to the bottom of the viewport. → recipes 3.1 + 3.6.
3. **Infographic**: giant **count-up** "98%" + floating cards/photos at **parallax** speeds around the statement. → 3.5 + 3.4.
4. **Locations**: full-viewport block with a **canvas dotted map** animating points + testimonial **carousel**. → canvas only if approved (3.12); otherwise a static dotted-map SVG with CSS pulse.
5. **Curtain footer**: the white footer is fixed beneath the page and revealed as the last section scrolls away. → 3.8.
6. **Nav pill** condenses/blurs on scroll → 3.9. **Reveals** everywhere else (`data-reveal`), slow (0.9–1.2 s), small travel.
7. FAQ **accordion** with smooth height (CSS grid-rows trick), CTA section with a soft image.

## Section-by-section map
| # | Section | What happens visually | Motion |
|---|---|---|---|
| 1 | Header | fixed centred pill nav | condense on scroll |
| 2 | Hero (100svh) | video bg, serif headline w/ italic, subline, ticker pills, email + CTA at bottom | load timeline, ticker, video |
| 3 | Story (pinned ≈ 3 × 100vh) | "AI that runs the doctor's office" → 3 chapters, one media card centre, captions swap | pin + scrub, media morph |
| 4 | Infographic (100svh) | "98% of posting handled autonomously" + "the more it learns…" | count-up, parallax cards |
| 5 | Locations (100svh) | "Trusted by 2,500+ doctors" map + testimonials + video pill | canvas/SVG map, carousel |
| 6 | How it works | 3 feature cards with line icons | stagger reveal |
| 7 | FAQ | 6 questions, accordion | accordion |
| 8 | CTA | "A breath of fresh air for your office" + image + button | reveal |
| 9 | Footer (curtain) | white, links, socials, copyright | curtain reveal |

## Quality rules to copy
- One serif at light weight, italics as the only "decoration".
- Warm paper background, near-black text, no accent colour — photography supplies colour.
- Motion is slow and scroll-paced; only one section is "spectacular".
- Media as texture (blur, slow), UI proof cards small and few.
- Proportional layout so desktop is pixel-faithful; mobile has its own simpler story (no pin).
- Everything breathes: 2–4 words per label, short headlines, big padding.

## What NOT to copy
- The Lassie name, logo, copy, videos, photos, testimonials, stats, fonts' licence (ABC Marist is commercial).
- For the exercise: fictional brand, free fonts, stock clips (Pexels: "wildflowers slow", "sunlight office blur"), invented but plausible product copy.
