---
name: help
description: Where am I and what's next — reads the project state, says it in three lines, and offers the next actions as clickable options (build next, animate, review, ship, fix, undo, board). Use when the designer types /help, says "help", "what now", "what's next", "where were we", "I'm lost", "status".
---

# help — where you are, and what you can do now

Never a manual. Three lines of state, then options. The designer clicks; you run the matching skill.

## 1. State (quietly)

Read `brief/PROJECT.md`, `brief/sections.json`, `brief/REVIEW.md`, `brief/HANDOFF.md`; `git status --porcelain` (unsaved work?); `git log -1 --format=%s` (last save point); dev server up? (start it in the background if not).

## 2. Say it — exactly three lines

> **<Client> landing** — <n> of <m> sections built · motion on <k> · last save point "<name>".
> Preview: http://localhost:4321 · Board: http://localhost:4321/board <· Live/preview link if any>
> Open items: <todos from sections.json, or "none">.

Fresh project → one line: "Nothing built yet — let's begin." then the `start` options.

## 3. Options (question tool) — build the list from the state, max 4, recommended first

Pick the four most relevant:

- **Build the next section: <name>** — when sections remain → `build`.
- **Continue drafting the Figma** — when `design` was started but sections lack node ids → `design`.
- **Import the design from Figma** — when a Figma link exists but tokens are still defaults → `figma`.
- **Add motion** — when all sections are built and motion level ≥ 1 → `animate`.
- **Run the review** — when built + animated and no `brief/REVIEW.md` for this version → `review`.
- **Get a preview link for the client** / **Go live** — after review → `ship` / `ship prod`.
- **Something looks wrong** → `fix`.
- **Go back to a save point** → `undo`.
- **Save my work now** — when there are unsaved changes → `git add -A && git commit -m "save point: <what>"` (+ push if origin) and confirm in one line.
- **Show me the board** → point to the board, stop.

After they click, run the skill. Don't re-explain.

## Rules

- If they typed a question in plain words ("how do I change the headline?"), answer that in two lines first, then offer the options.
- Never say "type /build" — say "say **next**" or offer the option.
- Never point to a `.md` file. The board is where they look.
