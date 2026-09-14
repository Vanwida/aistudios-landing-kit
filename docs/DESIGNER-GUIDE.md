# The Designer's Guide — ten ideas that explain everything

You already know how to design a landing page. This guide explains the *other* half — what happens between "design done" and "site live" — using things you already understand from Figma. Ten ideas, each in a few lines.

## 1. A website is a folder of files

Just like a Figma file has pages and frames, a website is a folder with files: one file per section of the page (`Hero.astro`, `Features.astro`…), a file with the colours and type (`tokens.css`), and a folder with the images. When you open the folder in Claude Code, Claude edits those files. Nothing magical.

## 2. The browser is the viewer; "localhost" is your private preview

`http://localhost:4321` is the page running on *your* computer only — like a Figma prototype preview. It refreshes itself every time Claude changes a file. It is not on the internet until you ship.

## 3. Tokens = Figma variables

Every colour, font size, spacing and radius lives in one file, with names like `--color-primary` or `--space-6`. Sections use the names, never raw values. Change the value once, the whole site updates — exactly like Figma variables. `/figma` fills this file from your design.

## 4. Sections = components

One section of the page = one file. Claude builds them one at a time, top to bottom, and each one is finished (matches your frame at desktop, tablet and mobile) before the next. This is also why two designers can work on the same site without stepping on each other.

## 5. Fidelity beats creativity

Claude's job is to match your Figma, not to improve it. When Figma doesn't say (hover states, tablet layout, what moves), Claude picks the quiet option and tells you in one line. Your job is to look and say what's off — in your words: "more air above the title", "the photo crop is wrong", "too fast".

## 6. Screenshots are how Claude sees

After every section, Claude takes screenshots at 390 / 834 / 1440 and compares them with your exported frame. A second "critic" looks with fresh eyes and lists the differences. So you should always **export your section frames as PNG** into `brief/figma/` — it's the reference everything is checked against.

## 7. Save points = version history

Every finished section, motion pass and review creates a save point (developers call it a *commit*). `/undo` lists them; you can jump back, and forward again. Nothing is ever lost.

## 8. GitHub = the Figma cloud, for code

GitHub keeps a copy of the project online with all the save points — like your Figma file living in the cloud. Every time Claude saves, the copy is updated ("saved online"). The agency can see it; a teammate can pick it up; nothing depends on your laptop.

Words you'll hear developers use, translated:
- **Repository (repo)** — the project's online home. One per landing.
- **Commit** — a save point with a name.
- **Diff** — "what changed between two save points", like Figma's *compare changes*: lines added in green, removed in red. You'll never read one; Claude does.
- **Branch** — a parallel copy to work in, like a Figma branch. Claude works in `draft`; `main` is what's live. You never choose.
- **Merge** — applying a branch's changes to `main`. Claude does it when you say *go live*. If two people changed the same section, Claude reconciles it and tells you in one sentence.
- **Pull request (PR)** — a *review request*: "here's what changed, approve it to make it live." Only used if your agency wants a review gate (`/ship review`).

## 9. Vercel = the Publish button

Vercel takes the files from GitHub and puts them on the internet, with HTTPS and a URL, in about a minute. Every save online gets a **preview link** (send it to the client); *go live* updates the real domain. Your first time, you log in with your browser; after that it's invisible.

## 10. Motion is a vocabulary, not a library

You don't need to know GSAP or Three.js. You need to know the *words*: reveal, stagger, parallax, pin, scrub, morph, ticker, marquee, curtain footer, magnetic hover. `/inspire` finds them in sites you love; `/animate` proposes a short menu in those words; you say yes or no. The taste rules are built in: slow, few, intentional, and always a calm version for people who prefer less motion.

---

### How to talk to Claude (the only "prompting" you need)

- Give it a brief, not a vibe: the `/new-landing` questions are the brief.
- Show, don't describe: paste a link, export a frame, point at a screenshot.
- React like a creative director: "the hero feels cramped", "this button is too loud", "the story section should hold longer".
- One thing at a time. Let it finish a section before asking for the next.
- If you don't understand what it said, say so. It will re-explain without jargon.
- When it asks a question, a short answer is fine. "Yes", "the second one", "black".

### What high quality looks like (the bar)

Warm surfaces, one distinctive display face, generous space, media that carries the story, motion that moves at the pace of reading, and nothing that looks like a template. If it looks like every AI page you've seen — purple gradients, three identical cards with icons in circles, bouncing elements — it isn't done. Say "this looks generic" and Claude knows what to change.
