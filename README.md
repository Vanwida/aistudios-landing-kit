# AISTUDIOS Landing Kit

**From a brief to a Figma draft to a live landing page — Claude does the production, you direct.**
For designers. No terminal, no git, no code.

## Start (five minutes)

1. **Copy this folder** and rename the copy after the client: `acme-landing`. Never work inside the original kit.
2. Open the **Claude** desktop app → **Code** → *Open folder* → choose `acme-landing`. Set the permission mode to **Auto**.
3. Type **`/start`** and pick where you want to begin. Then just talk.

Two places to look while you work:

- **Preview** — http://localhost:4321 — the page, updating live.
- **Board** — http://localhost:4321/board — your project: the brief, each section with your Figma frame next to the built screenshots, the tokens as swatches, the review, the links, the save points. It only exists on your computer; it's never published.

## How it goes

Claude asks you questions with **clickable options** — the client, then the site's architecture (sections, navigation, hero type, motion level…). If you give it a reference site, the options come pre-filled from it. Then Claude **drafts the design in Figma**; you refine it in Figma the way you always have. Say **import**, and Claude brings your refined design into the kit. Say **next**, and it builds one section at a time, showing you screenshots next to your frame. Then **animate**, **review**, **ship**.

Two words to remember:

| You type | You get |
|---|---|
| `/start` | "Where do you want to begin?" — new project · I have a Figma · I have a reference · continue |
| `/help` | "Where are you and what's next?" — the next actions as options, plus "something's wrong" |

Everything else is plain words: *design it · import · next · animate · review · ship · go live · undo · this looks wrong*. (Slash shortcuts exist for each — `/design`, `/figma`, `/build`, `/animate`, `/review`, `/ship`, `/fix`, `/undo` — but you never need them.)

## What you never have to do

Type terminal commands · install libraries · read code · understand git, branches or merges · configure Vercel · resolve conflicts · read a `.md` file.

## What only you can do

Decide the design · refine the Figma draft · export assets from Figma · log into Figma, GitHub and Vercel in your browser the first time · judge whether it *feels* right.

## Folders you'll actually open

```
brief/figma/    your section frames exported as PNG (Claude compares against these)
src/assets/     images and logos exported from Figma
public/video/   videos
```
Everything else is Claude's.

## Requirements (once per computer)

Node.js 22 (nodejs.org → LTS) · Git (macOS installs it on first use) · GitHub CLI (cli.github.com) · Chrome · accounts: Claude with Claude Code, GitHub, Vercel, Figma.

## Keep this open

**`GUIDE.html`** — double-click it and leave the tab open while you work: what to type for each step, what to type when something happens, with a copy button on every phrase.

New version of the kit? Tell Claude **update the kit**. Your design, sections and brief stay as they are.

## Read this next

**`HANDBOOK.html`** — double-click it. The ten ideas behind how websites work, in Figma terms; what to say when you're stuck; a glossary.
_(The `docs/*.md` files are the same material in plain text — that copy is for Claude.)_
