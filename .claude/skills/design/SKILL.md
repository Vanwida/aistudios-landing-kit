---
name: design
description: Draft the landing page design in Figma from the brief, the architecture answers and the inspiration — variables (tokens), page frames at 1440 and 390, one section frame per section with layout, real copy and placeholder media — for the designer to refine. Uses the Figma MCP write tools; falls back to SVG the designer pastes into Figma. Runs on its own at the end of new-landing when there is no finished Figma; also when the designer says "design it", "make the Figma", "draft the design", "start designing", or wants the draft redone.
argument-hint: [section]
---

# design — Claude drafts the Figma, the designer refines it

AI does the production; the designer directs and judges. This skill turns the brief + architecture + inspiration into a **first Figma draft** the designer opens, reacts to and refines. It is a draft to be edited, not a final. Quality bar: it should look like a competent junior designer's first pass in the reference's style — never like a generic template (read the `design-quality` skill first).

> **Status: untested in the wild.** The Figma MCP server can create frames, auto layout, components and variables from an MCP client (Figma's docs), but tool names and limits change during its beta. Discover the tools at runtime; if creation isn't possible, use the SVG fallback below and say so plainly.

## Inputs (read them all before drafting)

- `brief/PROJECT.md` — offer, visitor, tone, and the **Architecture** answers (sections, nav, hero type, extras, motion level, theme, fonts).
- `brief/DESIGN.md` — the Style & Motion brief from `inspire` (layout system, type category + free equivalents, colour roles, media treatment, section-by-section map). If missing, ask for one reference (options: "paste a site" / "no reference — use a calm editorial default") and run `inspire` first.
- `brief/sections.json` — the section list, in order.
- Copy: from `brief/PROJECT.md` or the exercise brief. If copy is missing for a section, write **short, plausible placeholder copy in the client's voice** and mark it `[draft copy]` — never lorem ipsum.

## Step 1 — the design system (tokens first)

Decide, then write into `brief/DESIGN.md` under **Draft design system**:

- Type: display family + weight, body family, label/mono family (free equivalents unless brand fonts were given). A scale: h1, h2, h3, lede, body, label at 1440, and the mobile pair.
- Colour: bg, bg-alt, surface, text, muted, primary, primary-contrast, accent, border — as hex. Warm or cool paper, never pure #FFF/#000 unless the brand is.
- Spacing unit (8), section padding (desktop/mobile), container width (1200 or 1440), radii (media, cards, buttons).

These same values go into `src/styles/tokens.css` later via the `figma` import — the draft and the code share one system by construction.

## Step 2 — the Figma file

Ask the designer, with options: **Where should I draw?** "Create a new empty Figma file and paste me the link *(recommended)*" / "Use this existing file" (they paste the link). Extract the file key.

Check which Figma tools can **write** (list the `mcp__figma__*` tools; look for anything that creates or updates nodes, frames, variables, components, or applies a design system). If none exist or the designer isn't authenticated: `/mcp` → figma → Authenticate; re-check. Still none → **SVG fallback** (Step 5).

## Step 3 — draft, section by section (not the whole page at once)

For each section in `brief/sections.json`, in order, at **1440 first**, then **390**:

1. Create the section frame named exactly like the section id (`hero`, `how-it-works`) inside a page frame `Desktop 1440` (and `Mobile 390`), with auto layout, the container width from the system, and the section padding.
2. Lay out the content from the architecture map: headline, sub-copy, buttons (as a reusable Button component created once), media as a placeholder rectangle with the intended aspect ratio and a label ("video: blurred nature loop", "photo: clinic front desk"), lists as auto-layout stacks, cards as a Card component.
3. Apply the design system: colour variables, text styles, spacing, radii. Real copy in place. Italic emphasis in headlines if the reference does it.
4. Record the node id in `brief/sections.json` (`figma.desktop` / `figma.mobile`).
5. After every two sections, stop and say: "Hero and Story are drafted — have a look in Figma. Move things, change anything; tell me if I should change direction before I continue." Wait. Adjust the system if their edits imply it (they moved the container wider? update the container token).

Header and Footer are sections too. Header includes the nav type chosen; Footer the curtain note (visual only).

## Step 4 — hand it over

> "The whole page is drafted in Figma — desktop and mobile. It's yours now: refine anything, and it stays the source of truth. When you're happy, say **import** and I'll bring the final design into the kit."

Also export nothing yourself; the `figma` import will read the refined file. Ask them to export section frames as PNG into `brief/figma/` when they're done (they know Export).

## Step 5 — SVG fallback (when Figma can't be written)

Figma pastes SVG as editable layers (text stays text when the font is installed). So:

1. For each section, generate `brief/design/<id>-1440.svg` (and `-390.svg`): a 1440-wide artboard with the layout as rectangles, real text with the chosen font families and sizes, colours from the system, placeholder media rectangles with labels. Keep it clean: grouped per element, sensible names (`<g id="headline">`).
2. Tell the designer: "Figma can't be written to from here, so I've drawn the draft as files. In Figma: File → Place image… or simply open each `.svg` in a browser, select all, copy, and paste into your Figma page. They come in as editable layers."
3. Continue as in Step 4.

## Rules

- Draft from the inspiration's *system* (rhythm, type category, surfaces, media treatment), never its copy, photos, logo or brand.
- Never invent product facts, stats or testimonials as if real — mark them `[draft copy]`.
- Two sections, then check in. The designer must feel they're directing, not reviewing a finished thing.
- Fidelity applies **after** they refine: the refined Figma is the truth for `build`. Until then, the draft is negotiable.
- Update `brief/sections.json` and the board as you go; the board shows the Figma exports once they exist.
