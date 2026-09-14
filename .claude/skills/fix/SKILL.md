---
name: fix
description: Something looks wrong or is broken — the preview is blank, an error appeared, a section looks different from Figma, the build fails, motion doesn't play. Structured diagnosis and repair with a plain-language explanation. Use when the designer says "it's broken", "error", "blank page", "this looks wrong", "it doesn't work".
argument-hint: [what you see]
---

# /fix — calm, structured repair

The designer is probably stressed. Your first sentence lowers the temperature: "No problem — this is normal, let me look." Then work, don't chat.

## Step 1 — understand what they see (max 2 questions)

If `$ARGUMENTS` is empty, ask **one** of these, whichever fits:
- "What do you see — a blank page, an error message, or something that looks wrong?"
- "Which section, and what's different from Figma?"

Never ask for error text, logs or file names. You can get those yourself.

## Step 2 — gather evidence (quietly)

In this order, stop as soon as you find the cause:

1. Dev server: `curl -s -o /dev/null -w "%{http_code}" http://localhost:4321`. Not 200 → check if it's running (`lsof -i :4321`); start it (`npm run dev` in background) or read its output for the error.
2. Build: `npm run build` — the compiler error usually names the file and line. Common: an unclosed tag (Astro 7 is strict), invalid nesting, a missing import, a typo in a path, an asset that isn't there.
3. Screenshots: `npm run shots -- --section <id>` and **look**. The script prints console errors too.
4. Recent changes: `git diff` and `git log --oneline -5` — what changed since the last save point?
5. Motion not playing: is `prefersReducedMotion` on in the OS? Does the element still have `[data-reveal]` but no `.js` class on `<html>` (script not loaded)? ScrollTrigger start positions off after images loaded (`ScrollTrigger.refresh()`)?

If it isn't obvious in 3 minutes, delegate to the `debugger` agent with everything you found.

## Step 3 — fix

- Fix the root cause, not the symptom. Don't add `!important`, don't wrap things in try/catch to hide errors, don't delete a section to make an error go away.
- If the fix is risky, save first (`git add -A && git commit -m "before fix: <what>"`).
- Re-verify the same way you found it (build passes, screenshot looks right, no console errors).

## Step 4 — explain in one sentence, human terms

Good:
> "Fixed. A tag in the Features section wasn't closed properly — the page couldn't render past it. It's all back."

Bad: pasting the error, naming line numbers, explaining the compiler.

Then: "You're good to continue — say **next** or tell me what else looks off."

## If it happened 3 times the same way

Stop patching. Say what pattern you see and propose a structural fix ("The pinned section keeps breaking on mobile; I suggest we replace the pin with simple stacked reveals under 768px — same story, no fragility."). Ask, then do.

## If you cannot fix it

Say so plainly, save the current state, and give the designer a way out: `/undo` to the last save point. Write what you tried in `brief/sections.json` under the section, so whoever picks it up (a developer, or you tomorrow) doesn't start from zero.
