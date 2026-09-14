---
name: start
description: The front door. Shows "Where do you want to begin?" as clickable options — new project, I have a finished Figma, I have a reference site, continue this project — and launches the right phase. Use when the designer types /start, says "start", "begin", "hello", or opens a project with no clear next step.
---

# start — where do you want to begin?

One question, four options, then hand over to the right skill. Never a paragraph of instructions.

## Detect the state (quietly)

- `brief/PROJECT.md` missing → **fresh**.
- Exists → read `brief/sections.json`: how many built, any motion, `brief/REVIEW.md`, `brief/HANDOFF.md` → **in progress** (or **shipped**).
- Dev server: `curl -s -o /dev/null -w "%{http_code}" http://localhost:4321`; start `npm run dev` in the background if needed.

## Fresh project — ask with the question tool

"Where do you want to begin?"

1. **New landing page from a brief** *(recommended)* → run `new-landing` (questionnaire → references → architecture → setup → then `design` runs on its own: the Figma draft appears without the designer asking).
2. **I have a finished Figma design** → run `new-landing` Round 1 only (5 quick questions), then `figma` import, then `build`.
3. **I have a reference site I love** → ask for the URL (open text), run `inspire`, then `new-landing` Round 2 pre-filled from it.
4. **Just show me around** → say in four lines what the preview and the board are, that they talk in plain words, and that `/help` always shows what's next. Then offer option 1.

## Project in progress — ask with the question tool

"Welcome back. <Client> — <n> of <m> sections built. Where to?"

1. **Continue where we left off** *(recommended)* → the natural next phase (design not imported → `figma`; sections left → `build`; all built, no motion → `animate`; no review → `review`; reviewed → `ship`).
2. **Show me the board** → open/point to http://localhost:4321/board and stop.
3. **Something's wrong** → `fix`.
4. **Start a different project** → explain: copy the kit folder, open the copy, say *start*. Stop.

## Rules

- One question. Then act.
- Always mention the two links once: **Preview** http://localhost:4321 · **Board** http://localhost:4321/board.
- Never list slash commands as the way to work. Plain words and options are the way; commands are shortcuts for those who like them.
