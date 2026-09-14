---
name: status
description: Five-line state report — sections built, motion, last save point, links, open items. Used by the help skill and at session start; also when the designer asks "status" or "where were we" without wanting options.
---

# status — five lines, no more

1. Read `brief/PROJECT.md` (client, motion level) and `brief/sections.json` (built flags, motion fields, todos, log).
2. Preview: `curl -s -o /dev/null -w "%{http_code}" http://localhost:4321`; start `npm run dev` in the background if down.
3. Unsaved work: `git status --porcelain` → if changes, offer to save (`git add -A && git commit -m "save point: <what>"`, + push if origin).
4. Links from `brief/HANDOFF.md` if it exists.

Report exactly in this shape:

> **<Client> landing** — <N of M> sections built · motion on <K> · last save point "<name>".
> Preview: http://localhost:4321 · Board: http://localhost:4321/board · Live: <URL or "not shipped yet">.
> Open items: <todos, or "none">.
> **Next:** <plain-words action, e.g. "say *next* and I'll build Features">.

If nothing exists yet: "Fresh project — say **start** and we'll begin."

For clickable next actions, hand over to the `help` skill.
