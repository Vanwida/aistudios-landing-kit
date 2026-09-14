---
name: review
description: Full quality pass before shipping — responsive layouts, accessibility, performance, SEO/meta, links and forms, copy, console errors. Fixes what can be fixed automatically, writes brief/REVIEW.md, and reports in plain words. Use when the designer says "review", "check everything", "is it ready", or before /ship.
---

# /review — the pre-flight check

Delegate the audit to the `qa-reviewer` agent (it preloads the `qa-checklist` skill and runs the full list), then handle the results here with the designer.

## Step 1 — run

Tell the designer: "Running the full check — responsive, accessibility, speed, SEO, links. About two minutes."

Delegate to `qa-reviewer` with: project root, the list of sections from `brief/sections.json`, and the instruction to write `brief/REVIEW.md` with three lists: **Fixed automatically**, **Needs the designer** (with the exact question), **Nice to have**.

## Step 2 — fix what the agent could not

Go through "Needs the designer" one item at a time — one question per message — e.g.:
- "The hero image has no description for screen readers. In one sentence, what does it show?"
- "The form sends to nowhere yet. Which email should receive the messages?"
- "Two links go to `#`. Where should *Book a demo* and *Careers* go?"

Apply answers immediately.

## Step 3 — report

Keep it human:

> "Review done. Fixed 11 things automatically (image sizes, missing descriptions, a heading order issue, the tablet layout of Features). Two things need you: [questions]. Speed score is good — the page loads in under 2 seconds on a phone.
> When those two are answered, say **ship** and I'll get you a link."

Save point: `git add -A && git commit -m "review: fixes"`.

## Rules

- Never "fix" by removing content or motion the designer asked for; propose instead.
- Contrast issues: propose the closest token change and ask, since colour is a brand decision.
- A review that finds nothing is suspicious; check that the agent actually ran the screenshots and the build.
