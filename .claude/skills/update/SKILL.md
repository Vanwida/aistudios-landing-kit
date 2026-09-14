---
name: update
description: Bring this project's copy of the kit up to date from the AISTUDIOS repo — system files (manual, skills, agents, board, motion runtime, scripts, guides) are replaced with the current version; the project's own files (sections, tokens, pages, assets, brief) are never touched. Use when the designer says "update the kit", "new version of the kit", "is the kit up to date", "get the latest kit".
argument-hint: [check]
---

# /update — the latest version of the system, without touching the design

The kit is maintained in one place (see `repo` in `kit.json`). This project was created from a copy of it. This skill replaces the **system files** in this project with the current ones and leaves everything the designer made alone. Which files are "system" is the `system` list in `kit.json` — the remote one, so new files arrive too.

Explain it once, in Figma terms: "It's like a design-system library update: the shared components refresh, your own layers stay exactly as they are."

## Steps

1. `node scripts/update-kit.mjs --check` when they only ask *whether* there's a new version. Read the two lines and say them plainly: "You have 1.0.0; 1.2.0 is available. Say *update the kit* to install it."
2. Otherwise run `node scripts/update-kit.mjs`. It makes a save point first, replaces the system files, installs any dependency the new kit needs, and commits `kit update: <old> → <new>`.
3. Read the first line, `RESULT:`, and respond:
   - **UPDATED** — say the version change and the number of files in one sentence. If anything under `src/board/`, `src/scripts/`, `scripts/` or `.claude/` changed, restart the dev server (`npm run dev` in the background) so the board and motion pick it up, and tell them the skills are reloaded when they start a new conversation. Repeat any `NOTE:` lines in plain words.
   - **UP_TO_DATE** — "Already on the latest version (1.2.0)."
   - **NO_ACCESS** — "The kit's home on GitHub didn't let us in. Ask AISTUDIOS to give your GitHub account access to the kit, then say *update the kit* again." Nothing was changed.
   - **NETWORK** — "GitHub couldn't be reached right now. Let's try again in a minute." Nothing was changed. (The script already retried three times.)
   - **NOT_A_REPO** — the project hasn't been set up yet; run `new-landing` first.
4. End with what they'll see and what's next: "Nothing on the page changed. Carry on where you were — say *next* / *animate* / *ship*."

## Rules

- Never edit a system file by hand to solve a project problem — it would be overwritten by the next update. If a project genuinely needs a different behaviour, do it in a project file and note it in `brief/PROJECT.md`.
- `astro.config.mjs` and `package.json` belong to the project; the script only reports differences and adds missing dependencies.
- Nothing is ever lost: the update is a commit. `/undo` takes the project back to before it.
