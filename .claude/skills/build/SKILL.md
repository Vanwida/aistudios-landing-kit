---
name: build
description: Build the next section of the landing page (or a named one) from Figma/the brief — write the Astro section, wire it into the page, screenshot it at three widths, compare with the Figma export, iterate, and create a save point. Use when the designer says "build", "next", "make the hero", "do the features section".
argument-hint: [section name]
---

# /build — one section, done properly

Sections are built **one at a time, top to bottom**, and each one is finished (matches Figma at 3 widths, saved) before the next starts. This is what keeps the designer calm: they always see a growing page, never a broken one.

Read the `astro-conventions` and `design-quality` skills before the first section of a project.

## Step 1 — pick the section

- `$ARGUMENTS` names a section → that one.
- Otherwise the first section in `brief/sections.json` with `"built": false`.
- If `brief/sections.json` doesn't exist → "We need the design first. Say **design it** and I'll draft the Figma, or **import** if you already have one." Stop.
- If the section's `figma.desktop` node id is empty **and** there is no `brief/figma/<id>.png` → ask with options: "No design for **<Name>** yet." → *Draft it in Figma first (recommended)* → run `design` for that section / *Build it from the reference brief* → continue, and note `"notes": "built from brief, no Figma"`.
- Set `"inProgress": true` on the section (the board shows "building"). If it is the very first section, remove the `KitReady` placeholder from `src/pages/index.astro`.

Tell the designer in one line: "Building **Hero** now — I'll show you screenshots when it's ready (about a minute)."

## Step 2 — gather the spec (quietly)

1. `brief/sections.json` entry: name, id, purpose, notes.
2. `brief/figma/<id>.png` (and `<id>-mobile.png` if present) — **look at it.** This is the target.
3. If Figma MCP is connected and the section's node id is recorded in sections.json: `get_design_context` for exact text, sizes, spacing, and `get_screenshot` as a second reference. Treat the returned code as a spec only.
4. `brief/DESIGN.md`: tokens summary, motion level, inspiration rules.
5. Copy for the section from `brief/PROJECT.md` / Figma. Never invent copy; if missing, use a clearly marked short placeholder and add `"copy for <section>"` to the section's `todos` in sections.json.
6. Assets in `src/assets/`. If an image the section needs is missing, use `src/assets/placeholder.svg` and add `"asset: <name>"` to `todos` — never stop the build for a missing image.

## Step 3 — write the section

- Create `src/sections/<Name>.astro` following `src/sections/_Example.astro` and `.claude/rules/sections.md`.
- Mobile first. Match the mobile frame if one exists; otherwise derive the mobile layout from the desktop one with the standard rules (stack columns, keep type scale fluid, keep the same order unless the design says otherwise).
- Add `data-reveal` / `data-reveal-group` on the natural entrance elements (heading, text, cards). Anything beyond entrance reveals waits for the `animate` step.
- Add the import and tag to `src/pages/index.astro` in the right order.
- Header/nav and footer are sections too (`Header.astro` uses the `header` slot of `Base.astro`, `Footer.astro` the `footer` slot).

## Step 4 — the visual check (mandatory)

1. Make sure the dev server is running on 4321 (start in background if not).
2. `npm run shots -- --section <id>` → three PNGs in `brief/shots/`.
3. **Look at each screenshot next to the Figma export.** Then delegate the comparison to the `design-critic` agent with the paths of both images per width, and read its report.
4. Fix what the critic found. Repeat up to **3 rounds**. Typical fixes: spacing rhythm, heading size, line length, image crop, alignment to the grid, button sizing.
5. Console errors reported by the shots script must be fixed before moving on.

If after 3 rounds something still doesn't match, stop and ask the designer to look at the preview and say what's off — in their words. Then fix.

## Step 5 — save point

```
npm run build          # must pass
git add -A && git commit -m "section: <name>"
```

Update `brief/sections.json`: `"built": true`, `"inProgress": false`, `notes`, `todos`, and append to `log` (`{"date": "...", "text": "hero built, 2 rounds"}`). The board reads this.

If `origin` exists: `git push` (quietly).

## Step 6 — show the designer

Point them to the board (the section card shows the Figma frame next to the three screenshots) and say:

> "**Hero** is built and matches the frame at desktop, tablet and mobile. See it on the preview (http://localhost:4321) and side by side with your Figma on the board (http://localhost:4321/board). If anything feels off, tell me what — in your words. When you're happy, say **next** and I'll build **Features**."

If there are TODOs: one line listing them ("Still missing: the team photo — I've put a placeholder.").

## If the designer asks for a change

Small change ("more space above the title", "the button should be black") → do it, re-shoot that width, confirm in one line. Do not re-run the whole check for tiny changes.

Design change that contradicts Figma → do it, but say once: "Done. Note that Figma still shows the old version — you may want to update it later."
