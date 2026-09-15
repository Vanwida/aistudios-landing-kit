# AISTUDIOS Landing Kit

**From a brief to a Figma draft to a live landing page — Claude does the production, you direct.**
For designers. No terminal, no git, no code.

## Start (five minutes)

1. Make an **empty folder** named after the client — `acme-landing` — and open it in the **Claude** desktop app → **Code** → *Open folder*. Set the permission mode to **Auto**.
2. Paste: **`Create a new landing from the AISTUDIOS kit: Vanwida/aistudios-landing-kit`**. Claude downloads the current kit into the folder and creates the project on GitHub (the first time, a GitHub login opens in your browser).
3. **Start a new conversation**, type **`/start`** and pick where you want to begin. Then just talk.

(Got the kit as a zip instead? Unzip it, rename the folder after the client, open it, type `/start`. Same thing — say **update the kit** later to get the current version.)

### For Claude — creating a project from this template

You are in an empty folder and the designer pasted the sentence above. Do this, narrating one line at a time, never the commands:

1. `gh auth status` — if not logged in, say a browser window will open, then `gh auth login --web --git-protocol https`.
2. Repo name = the folder name (lowercase, hyphens). Ask once, with options, where it should live: their own account *(recommended)* / the agency's organisation (ask its name).
3. `gh repo create <owner>/<name> --template Vanwida/aistudios-landing-kit --private`
4. GitHub copies the template in the background: poll `gh api repos/<owner>/<name>/contents/kit.json` every 2 s until it answers (up to 60 s).
5. `git clone https://github.com/<owner>/<name>.git .` (into this folder). Then `git checkout -b draft`.
6. Say: "The kit is in. **Start a new conversation** so I can load it, then type **/start**." Stop.

If `gh repo create` fails, it is almost always the GitHub login: run `gh auth status`, and if needed `gh auth login --web --git-protocol https`, then try again. 

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

## Licence

MIT. Use it, change it, use it for client work, ship it. The only condition is that the copyright notice stays in the copy (it is the `LICENSE` file — leave it there).

The kit is the system. **What you build with it is yours**: your sections, your tokens, your copy, your images, your client's site. Nothing you make is covered by this licence.

The kit keeps improving. Say **update the kit** in any project to pull the current system files, or start a new project and you get the latest automatically.

## Read this next

**`HANDBOOK.html`** — double-click it. The ten ideas behind how websites work, in Figma terms; what to say when you're stuck; a glossary.
_(The `docs/*.md` files are the same material in plain text — that copy is for Claude.)_
