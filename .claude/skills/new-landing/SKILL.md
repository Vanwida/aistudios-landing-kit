---
name: new-landing
description: Start a new landing page project. Two-round questionnaire with clickable options (the client, then the site's architecture), reference-site analysis in between, then project setup — install, preview, git, GitHub. Use when the designer says "start", "new project", "new landing", "let's begin", or when brief/PROJECT.md does not exist.
argument-hint: [client name]
---

# new-landing — brief, architecture, setup

Goal: understand the job well enough that nothing downstream has to guess — and get the designer looking at a running preview and the board within minutes. **Ask with options.** Use the question tool (AskUserQuestion) for every question that has a finite set of answers; put the recommended option first and label it *(recommended)*. Two or three questions per call, never more. Open text only for names, links and copy.

## Before asking anything

1. If `brief/PROJECT.md` exists and is filled in, say so and run `status` instead. Stop.
2. Quiet environment check: `node -v` (≥ 22.12), `git --version`, `gh --version`. Note what's missing; you'll handle it in Setup. If Node is missing or old: "This computer needs Node.js 22 — install it from nodejs.org (the LTS button), then say *start* again." Stop.
3. One warm line: "Let's set up the brief. A few quick questions — most are just clicking an option."

## Round 1 — the client (≈ 2 minutes)

1. **Client & offer** (open text): "Who is the client and what do they sell or do, in one line?" (Use `$ARGUMENTS` if given.)
2. **The one action** (options): Book a demo / Buy / Sign up / Contact or call / Download. Then, only if a form is implied: **Where does it go?** Form on the page *(recommended)* / Link to another site / Email / Phone.
3. **The visitor** (open text, one sentence): "Who lands on this page?"
4. **Tone** (options, multi-select, pick up to three): Calm · Bold · Warm · Precise · Playful · Luxurious · Technical.
5. **Design source** (options): I have a finished Figma / I have references, no Figma yet *(most common)* / Nothing yet — design from the brief.
   - Finished Figma → ask for the link (open text). Skip Round 1b.
6. **Practical** (options where possible): language(s) of the page (multi-select: es · en · ca · other); domain (existing / new / unknown); deadline (open text); integrations (multi-select: contact form · analytics · booking embed · none).

## Round 1b — references (if they have any)

"Paste up to three sites you want this to feel like, and a few words on what you like about each." For each URL, run the **`inspire`** skill now (screenshots, motion probe, Style & Motion brief into `brief/DESIGN.md`). Tell the designer it takes a couple of minutes and what it's doing. The answers to Round 2 are pre-filled from this analysis.

## Round 2 — the site's architecture (≈ 3 minutes, all options)

Every option that the inspiration analysis can answer is pre-filled and marked *(from <reference>)*. The designer confirms or changes. Ask in groups of 2–3:

1. **Sections** (multi-select from the standard list, pre-selected per the reference): Header · Hero · Logos/social proof · Story or Value · Features · How it works · Stats · Testimonials · Pricing · FAQ · CTA · Footer. Then: "Anything else?" (open text, optional).
2. **Navigation**: Floating pill, centred *(from lassie.ai)* / Classic bar, full width / Minimal — logo + one button / Hidden menu (hamburger) only.
3. **Menu behaviour**: Condenses on scroll / Hides on scroll down, returns on scroll up / Static / Full-screen overlay menu.
4. **Hero type**: Full-bleed video / Big image / Text only, typographic / 3D or generative canvas.
5. **Hero extras** (multi-select): Rotating ticker line · Email field + button in the hero · Play-video pill · None.
6. **Scroll feel**: Smooth, inertial (Lenis) / Native.
7. **Motion level**: 1 Calm — things gently appear / 2 Editorial — reveals, parallax, a pinned moment / 3 Showcase — hero sequence, scroll story, morphing media.
8. **Signature moment** (if level ≥ 2, multi-select): Pinned scroll story · Media that grows to full-bleed · Count-up stats · Parallax proof cards · Curtain footer · Marquee · None yet, decide later.
9. **Page load**: Choreographed intro (headline lines rise, media fades in) / Nothing special.
10. **Theme**: Light / Dark / Light with a dark section or two.
11. **Fonts**: Use the reference's feel with free equivalents *(from …)* / The client has brand fonts (I'll ask for the files) / Decide in the design step.

## Write the brief (quietly)

- `brief/PROJECT.md` from `templates/PROJECT.md`: the Round 1 answers in the designer's words, plus an **Architecture** section with every Round 2 answer.
- `brief/sections.json` from `templates/sections.json`: the chosen sections in order, ids kebab-case, `built: false`, notes from the architecture answers (nav type on Header, hero type and extras on Hero, signature moments on their sections, "curtain" on Footer).
- `brief/DESIGN.md` from `templates/DESIGN.md` if `inspire` didn't already create it.

Then show the summary **on the board**, not in chat: "I've written it all up — open http://localhost:4321/board once the preview is running. Anything to correct, just tell me."

## Setup (background — no narration of commands)

```
npm install
npx playwright install chromium
git init -b main                      # if no .git
git add -A && git commit -m "save point: project start"
git checkout -b draft                 # all work on draft; main = live
npm run dev                           # background; wait for http://localhost:4321 → 200
```

### GitHub — done now, never skipped

The agency always works on GitHub. Do it here, one browser step, narrated one line at a time:

1. `gh --version`. Missing → if Homebrew exists: `brew install gh` (say: "Installing a small helper for GitHub, one minute."). No Homebrew → "One install only you can do: download GitHub CLI from cli.github.com and run the installer, then tell me *done*." Wait.
2. `gh auth status`. Not logged in → say **before** running it: "A browser window will open with a one-time code. Log into GitHub and click **Authorise** — that connects your account. Tell me when it's done." Then `gh auth login --web --git-protocol https`. Confirm with `gh auth status`.
3. Ask once (options): "Where should the project live on GitHub?" Your own account *(recommended)* / The agency's organisation (I'll ask its name). Remember the answer in `brief/PROJECT.md`.
4. `gh repo create <agency-or-user>/<client>-landing --private --source=. --remote=origin --push` then `git push -u origin draft`.
5. Say: "The project is also saved online on GitHub — that's the agency's copy, with full history. You never need to open it."

If GitHub truly can't be done now (no account, IT block): say so in one line, write it under Open items in `brief/PROJECT.md`, and continue. `ship` will pick it up. That's the only acceptable skip — and it's never silent.

## Close

Two lines:

> "Brief done and the project is running. **Preview:** http://localhost:4321 · **Board:** http://localhost:4321/board — the board shows everything we decided and fills up as we go.
> Next: say **design it** and I'll draft the Figma from what we just decided." *(or, if they have a finished Figma: "say **import** and I'll bring the design in.")*
