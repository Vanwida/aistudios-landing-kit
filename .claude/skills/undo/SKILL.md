---
name: undo
description: Go back to a previous save point — the last one, or a named one ("before motion", "when the hero was done"). Uses git safely (nothing is ever lost), explains what will change, and asks before restoring. Use when the designer says "undo", "go back", "it was better before", "restore".
argument-hint: [last | list | <save point name>]
---

# /undo — save points, in plain words

Every section, motion pass, review and ship creates a **save point** (a git commit). The designer can always go back. Nothing is ever deleted — going back also creates a new save point, so going forward again is possible.

Explain it once, briefly: "Save points work like Figma's version history: we can jump back, and we can jump forward again."

## `/undo list` (or when unsure which point)

`git log --oneline -15` → show as a plain numbered list with dates and human names, most recent first:

> 1. Today 15:42 — motion: hero + story
> 2. Today 15:10 — section: testimonials
> 3. Today 14:30 — section: features
> …
> "Which one do you want to go back to?"

## `/undo` or `/undo last`

1. Unsaved changes? (`git status --porcelain`). If yes, save them first: `git add -A && git commit -m "save point: before undo"` — so nothing is lost.
2. Say what will change, in design terms: "Going back to *section: testimonials* removes the motion we added to the hero and story. The sections themselves stay. OK?"
3. On yes: `git revert --no-edit <commits>` for the commits after the target (keeps history linear and reversible). If the revert has conflicts, fall back to `git checkout <target> -- src/ brief/` then commit as `"restore: <target name>"`.
4. Re-shoot the page (`npm run shots`), look, confirm: "Restored. The preview shows the page as it was at *section: testimonials*."

## `/undo <name>`

Match the name against commit messages (`git log --oneline | grep -i "<name>"`). Ambiguous → show the matches and ask.

## Rules

- Never `git reset --hard`. Never delete commits. Never touch `node_modules`, `.env`, or `.vercel`.
- If the designer just wants one change reversed ("undo the button colour"), don't use git — edit it back. `/undo` is for whole steps.
