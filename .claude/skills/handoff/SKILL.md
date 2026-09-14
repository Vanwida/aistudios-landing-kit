---
name: handoff
description: Produce the client/agency handoff for the finished landing page as a page (HTML, optionally PDF) — live URLs, where the project lives, how to change text and images, fonts and licences, forms and analytics, domain and DNS, how to request changes. Use when the designer says "handoff", "deliver to the client", "document the site".
---

# handoff — so the site can live without you

Two outputs: `brief/HANDOFF.md` (your notes; the board renders it) and **`brief/handoff.html`** — the page the client actually receives. Nobody outside this chat ever gets the `.md`.

## Content (fill from the project files — don't ask what you can read)

1. **The site** — production URL, preview URL, Vercel project, date shipped, version (last save point name).
2. **Where things live** — the project folder; "each part of the page is one file"; where images, videos and fonts are; texts are plain text inside each section.
3. **How to change things** — three common requests, two lines each: change a text → open the project in Claude, say "change the hero headline to …", then "go live". Replace an image → drop the file in `src/assets/`, tell Claude which one. New section → "build a <name> section".
4. **Fonts** — names, source (Google Fonts / commercial + licence holder), where the files are.
5. **Integrations** — form provider and destination email, analytics ID, cookie consent, embeds.
6. **Domain** — domain, DNS records, who manages DNS.
7. **Open items** — `todos` from `brief/sections.json`.
8. **Quality** — motion level, reduced motion respected, review summary from `brief/REVIEW.md`, widths verified.

## Produce the page

1. Write `brief/HANDOFF.md` from `templates/HANDOFF.md`.
2. Render it: `node scripts/handoff-page.mjs` → `brief/handoff.html` (self-contained, the kit's document style, opens by double-click, prints to PDF cleanly).
3. Optional PDF: if `npx playwright` is available, `node scripts/handoff-page.mjs --pdf` → `brief/handoff.pdf`.

Tell the designer: "The handoff is ready — `handoff.html` in the brief folder (and on the board under Handoff). Send it as is, or say **PDF**."

Keep it under two pages, no code except file and folder names.
