---
name: figma
description: Bring the Figma design into the project — design tokens (colours, type, spacing, radii) into src/styles/tokens.css, the section list into brief/sections.json, and a design summary into brief/DESIGN.md. Use when the designer shares a Figma link, says "connect Figma", "import the design", or after /new-landing when a Figma file exists.
argument-hint: [figma link]
---

# /figma — from the Figma file to tokens and a section plan

Goal: after this skill, the project *knows* the design — the exact colours, fonts, type scale, spacing and the list of sections in order — so `/build` never guesses.

## Step 0 — connection check

Check whether the Figma MCP tools are available (any tool starting with `mcp__figma__`). If not:

> "I need access to your Figma file. Type `/mcp`, choose **figma**, and click **Authenticate** — a browser window will ask you to log into Figma and approve. Then say **import** again."

If they say it doesn't work or they don't have access, use the **fallback path** at the end of this skill. Never block on this for more than one try.

## Step 1 — get the link

Use `$ARGUMENTS` or the link in `brief/PROJECT.md`. If none: "Paste the Figma link to the landing page frame (select the desktop frame → right-click → Copy link)." A link looks like `https://www.figma.com/design/<fileKey>/<name>?node-id=12-345`. Extract `fileKey` and `nodeId` (replace `-` with `:` when the tool asks for `12:345`).

## Step 2 — read the structure (delegate to `figma-translator`)

Delegate to the `figma-translator` agent with the fileKey, nodeId and this instruction: "Produce tokens.css, DESIGN.md and sections.json following the figma-to-code skill." Wait for the result, then verify the three files exist and look sane (tokens have real values; sections are in top-to-bottom order).

If you do it yourself, follow the `figma-to-code` skill exactly.

## Step 3 — exports the designer must do (they know this part)

Figma's MCP gives us structure and values, not always the final image assets. Ask for one batch export, in Figma's own terms:

> "One thing only you can do: in Figma, select each image, logo and illustration on the page and export them:
> - Logos and icons → **SVG**
> - Photos → **PNG or JPG at 2x**
> - Videos → drop the original files
>
> Put them all in the folder **`src/assets/`** (Finder: open the project folder → `src` → `assets`). Also export each *section frame* as **PNG at 1x** into **`brief/figma/`**, named like the section (`hero.png`, `features.png`). Those are what I compare my work against."

If they need a pause, say the next step will wait: "Say **next** when the exports are in."

## Step 4 — confirm the section plan

Show the section list (names only, numbered) and ask with the question tool: "Is this the right order and are these the right names?" → *Yes, go* / *I'll tell you what to change*. Names become file names (`Hero.astro`) and ids (`hero`), so keep them short. If `brief/sections.json` already existed from the brief, merge: keep the designer's order, add Figma node ids.

## Step 5 — close

> "Design imported: <N> colours, <N> text styles, <N> spacing values, <N> sections — the tokens are on the board as swatches. Next: say **next** and I'll build the hero."

---

## Fallback path (no Figma MCP)

Works surprisingly well, because designers are precise about their own work.

1. Ask for the section frames exported as PNG 1x into `brief/figma/` (desktop **and** mobile frames if they exist: `hero.png`, `hero-mobile.png`).
2. **Look at each PNG.** Build the token set by asking for the values you cannot see reliably — one question at a time:
   - "Which fonts are used, and where do I get the files? (Google Fonts name, or drop the .woff2 files into `public/fonts/`)"
   - "Paste the hex codes for: background, main text, primary button, accent."
   - "What's the base spacing unit — 8px? And the desktop container width — 1200? 1440?"
   - Type sizes: read them from the PNG proportions and confirm the h1 size at desktop.
3. Write `tokens.css`, `DESIGN.md`, `sections.json` exactly as the `figma-to-code` skill describes.
4. Continue at Step 4.
