---
name: design-quality
description: What "high quality" means in a built landing page and how to reach it in code — fidelity to Figma, typographic and spacing discipline, media treatment, the tells of generic AI-made pages to avoid, how to compare screenshots to a design like a designer, and the quality signals of premium reference sites (e.g. lassie.ai). Load before building the first section of any project and when reviewing visual output.
---

# Design quality — the bar, and how to hit it

The designer's Figma is good. Our job is to lose nothing in translation and to add the things Figma can't show (motion, states, responsiveness) at the same level of taste.

## 1. Fidelity: compare like a designer, not like a diff tool

When you look at `brief/shots/page-<id>-1440.png` next to `brief/figma/<id>.png`, check in this order — it's the order a designer's eye goes:

1. **Proportion** — Does the section have the same height-to-width feel? Is the media the same size relative to the text?
2. **Vertical rhythm** — Space above the heading, heading→text, text→CTA, CTA→media. Off by 8 px is visible to a designer.
3. **Type** — Size relationships (h1 vs lede vs body), weight, line-height (tight display, relaxed body), letter-spacing on display sizes (usually slightly negative), line breaks (a headline breaking into 3 lines instead of 2 is a failure — adjust `max-width` on the heading).
4. **Alignment** — Everything sits on the same grid columns/edges. Text and media edges line up. Buttons align with the text's left edge.
5. **Colour and contrast** — The background tone (warm vs cold white matters), muted text really muted, borders subtle.
6. **Media** — Crop and focal point, corner radius, aspect ratio, no distortion, no squished logos.
7. **Details** — Icon size and stroke, button padding and radius, hover states exist, focus visible.

Report findings as a designer would: "Heading is ~15% too small and breaks into three lines; add 24 px above the CTA; image corners should be 24 px, not 12." Then fix.

## 2. Typography discipline

- Display sizes with tight leading (1.0–1.15) and negative tracking (−0.01 to −0.03 em). Body 1.5–1.65 leading, no tracking.
- Body measure 55–70 characters. Ledes ≤ 60 ch. Never full-width paragraphs on desktop.
- Hierarchy through **size and weight contrast**, not colour rainbows. Two families max (display + body), optionally a mono for labels.
- Real typographic characters: curly quotes, en/em dashes, `&nbsp;` before the last word of a headline to avoid orphans when needed.
- Eyebrow labels: small, tracked-out caps or mono — not bold coloured pills unless the design has them.

## 3. Space and layout

- One spacing system (the 8-pt tokens). Section padding is the big token (`--section-padding` ≈ 96–128 px desktop, 64–80 mobile) — premium pages breathe.
- Consistent container: the same max-width and gutters in every section unless the design intentionally goes full-bleed.
- Grids with intention: 12-col mental model; cards align; nothing "roughly centred".
- Mobile is not a shrunken desktop: stack in reading order, keep the hero headline big (it's the brand), reduce section padding, make touch targets ≥ 44 px, avoid horizontal scroll.

## 4. Media treatment

- One consistent grade across all photos (warm/cool, contrast). If the Figma photos have a treatment (blur, duotone), match it with CSS filters or ask for treated exports.
- Corner radius comes from the tokens and is consistent by element type (cards vs media vs buttons).
- Video as texture (blurred nature, slow abstract) is a signature of premium sites; always muted, poster provided, no controls.
- Product UI as "proof cards" (small floating receipts/notifications) works when they're small, real-looking and few.

## 5. The tells of generic AI-made pages (never ship these)

- Purple/blue gradient backgrounds and glowing blobs nobody asked for.
- Every card identical with an icon in a coloured circle, three per row, drop shadow.
- Gradient text on headlines. Rainbow accent colours. Emoji as icons.
- Centred everything; hero text + generic illustration; "Lorem ipsum" or "Your journey starts here" copy.
- Bounce/elastic entrance animations; things sliding in from left and right alternately.
- Rounded-full pills on everything; 16 px radius on everything; inconsistent radii.
- Default system font when the design specifies a brand face.
- Fake testimonials, fake logos, fake stats — if the content isn't provided, mark `TODO`, don't invent.

## 6. What premium sites do (learned from lassie.ai and its peers)

- A **calm surface**: warm off-white (`#F9F8F5`-ish) or a deep near-black (`#120C08`-ish), never pure `#FFF`/`#000` unless the brand is that.
- **One serif or one distinctive grotesk at light weight** for headlines, with italics used as emphasis inside a headline ("You're a doctor. *Not a machine.*"). Body in a quiet sans. A mono for small data labels.
- **Big statements, small copy.** Short headlines, few words per section; the media carries the story.
- **Scroll storytelling**: one pinned section where media morphs while captions change; 98% of the page still uses simple reveals.
- **Proof as objects**: stat count-ups, floating UI cards with real-looking data, a map/canvas, a video testimonial with a play pill.
- **Smooth scroll** (Lenis), slow eases, generous padding, a **floating pill nav**, a **curtain footer**. Everything moves at the pace of reading.
- **Fluid proportional layout** so the desktop is exactly the Figma frame at any width (see `astro-conventions` → proportional scaling).
- Performance is invisible but felt: fonts preloaded, hero media prioritised, no layout shift.

## 7. States and edge cases (Figma often doesn't show them)

Every interactive element needs hover, focus-visible, active; links in body text need an underline or a clear affordance; forms need error, success and loading states; accordions need open/closed; long headlines must wrap gracefully at 390 px; empty or short content must not collapse the layout. When Figma is silent, choose the quiet option and tell the designer in one line.

## 8. Quick self-review before showing a section

- Would the designer recognise their frame instantly? (If you have to explain the differences, it isn't done.)
- Is there any value that isn't a token?
- Is there any element without a hover/focus state?
- Does the mobile shot look designed, not merely "responsive"?
