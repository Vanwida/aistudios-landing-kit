---
name: figma-to-code
description: How to translate a Figma file into this kit — using the Figma MCP tools (get_metadata, get_variable_defs, get_design_context, get_screenshot) or exported PNGs — into tokens.css, brief/DESIGN.md and brief/sections.json, and how to read a frame as a spec for a section. Load when working with Figma links, variables, frames, or exported designs.
---

# Figma → code, the kit way

Principle: Figma is the **source of truth for values**; this kit is the **source of truth for structure**. Take numbers, text and assets from Figma; put them into our tokens and section pattern. Never paste generated code from Figma tools into the project.

## Figma MCP tools (remote server, `.mcp.json`)

Names may vary slightly by version — check the tool list. Typical set:

| Tool | Use it for |
|---|---|
| `get_metadata` | The layer tree of a page/frame: names, types, positions, sizes. → section list, order, frame ids. |
| `get_variable_defs` | Variables/styles used in a node: colours, numbers, strings. → tokens. |
| `get_design_context` (a.k.a. get_code) | A detailed description/code of a node: exact text, sizes, spacing, fonts, asset references. → **spec** for one section. |
| `get_screenshot` | Rendered image of a node. → visual reference; save the description in DESIGN.md, and ask the designer for a PNG export if the image can't be saved locally. |

Call them on the **smallest node that contains what you need** (a section frame, not the whole page) — big nodes return huge payloads and get truncated.

Link parsing: `https://www.figma.com/design/<fileKey>/<name>?node-id=12-345` → `fileKey`, `nodeId = "12:345"`.

## Step A — the section list (`brief/sections.json`)

1. `get_metadata` on the page frame (desktop). Top-level children in vertical order are the sections. Use the designer's frame names; normalise to short names (`Hero`, `Logos`, `Features`, `HowItWorks`, `Testimonials`, `Faq`, `Cta`, `Footer`; the nav is `Header`).
2. Record each section's `nodeId` (so the build step can fetch its spec) and its height at 1440.
3. If there is a mobile page/frame, match sections by name and record the mobile `nodeId` too.
4. Write `brief/sections.json` following `templates/sections.json`: one object per section — `id` (kebab-case), `name`, `file` (PascalCase.astro), `figma: {desktop, mobile}` node ids, `built: false`, `inProgress: false`, `motion: null`, `notes`, `todos: []`. If the file already exists (from the brief), **merge**: keep its order and notes, add node ids, add sections that exist only in Figma at the end and say so.

## Step B — tokens (`src/styles/tokens.css`)

1. `get_variable_defs` on the page frame. Map by meaning, not by Figma name:
   - Colours → `--color-bg`, `--color-bg-alt`, `--color-surface`, `--color-text`, `--color-text-muted`, `--color-primary`, `--color-primary-contrast`, `--color-accent`, `--color-border`. Extra brand colours → `--color-brand-<name>`.
   - Text styles → `--font-display`, `--font-body`, `--font-mono`; sizes into the `--text-*` scale (see below); weights/tracking/leading tokens.
   - Spacing → snap to the 8-pt scale `--space-1…10`; section padding → `--section-padding`.
   - Radii → `--radius-sm/md/lg/full`. Shadows → `--shadow-*`.
   - Grid: container width, gutter, column gap → `--container-max`, `--gutter`, `--grid-gap`.
2. **No variables in the file?** (very common) Read them from `get_design_context` on 3 representative nodes (hero, a card section, footer): collect every fill, font, size. Deduplicate; you'll find ~6 colours, 2 fonts, 6–8 sizes. That *is* the token set.
3. Type scale: Figma gives desktop sizes. Build fluid clamps: `min` = mobile size (from the mobile frame, or desktop × 0.55–0.7 for display, × 0.9 for body), `max` = desktop size. Formula for the middle term: `calc(min + (max - min) * ((100vw - 390px) / 1050))` simplified to `Arem + Bvw`. Keep the existing token names; change values.
4. Keep every token that exists in the file (sections rely on them). Add, never rename.

## Step C — the design summary (`brief/DESIGN.md`)

Fill the **From Figma** section: fonts (names + where to get them), colour roles, spacing unit, container, grid, radii, imagery notes (photo style, illustration, icons set), component inventory (buttons, cards, inputs, accordion, nav) with states seen in Figma (hover, active, disabled).

## Step D — reading a frame as a spec (during `/build`)

`get_design_context` on the section node. Extract, in this order:

1. **Content**: every text string, in reading order; link/button labels; image layers (names + sizes).
2. **Structure**: columns, alignment, stacking, what repeats (cards → a list).
3. **Measurements**: section padding top/bottom, gaps, max widths, image aspect ratios, radii → map each to the nearest token; a non-token value used once → section-scoped variable.
4. **Type**: which text style each string uses → `--text-*` token; weights; case; tracking.
5. **States**: anything named hover/active/open in the layer tree.
6. **Mobile**: from the mobile node if present; otherwise apply the standard stacking rules and say so in sections.json notes.

Then write the Astro section from scratch in our pattern. If the tool returned Tailwind/React code, translate the *numbers* only.

## Step E — assets

Ask the designer to export (they're fast at this): logos/icons **SVG**; photos **JPG/PNG @2x** (or WebP); videos as files; into `src/assets/<section>/`. Frames as **PNG @1x** into `brief/figma/<id>.png` (+ `<id>-mobile.png`). If `get_design_context` returns asset URLs that can be downloaded, save them to the same places with descriptive names (`hero-video-poster.jpg`, not `image 12.png`).

## Sanity checks before finishing

- `tokens.css` has real hex values and font names; no `#000000` placeholders left unless the brand is truly black on white.
- Section ids in `sections.json` are unique kebab-case and match the planned file names.
- `DESIGN.md` names the display and body fonts and where they come from.
- You looked at at least the hero PNG and can describe it in one sentence.
