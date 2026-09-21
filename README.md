# AISTUDIOS Landing Kit

From a brief and a Figma file to a live site. Claude does the production. You direct.

For designers. No Terminal, no git, no code.

## How the work goes

1. **Ask** — one specific thing
2. **Claude does it** — builds it, screenshots it, reports back
3. **Look** — the preview is the source of truth
4. **Adjust** — say what’s off, in your own words
5. **Save point** — Claude saves. You can always go back
6. **Ship** — a preview link to share. Going live comes later

The kit is that loop, with the steps already written: a manual, one skill per phase, a board.

## Before you start

Once per computer:

- [Claude desktop](https://claude.ai/download) with Claude Code — sign in, open the Code tab, open any folder, say hello. If it answers, you’re set
- [Node.js 22](https://nodejs.org/) — the LTS button. Install once
- [Git](https://git-scm.com/) — on a Mac it installs itself the first time; say yes. On Windows, install it from that site
- [GitHub CLI](https://cli.github.com/) — a small installer. Claude uses it to connect GitHub in the browser. Click through; no commands
- [Chrome](https://www.google.com/chrome/) — where the preview lives, and where you sign in
- Accounts: [GitHub](https://github.com/), [Vercel](https://vercel.com/), [Figma](https://www.figma.com/) — your own. Sign in once in the browser when Claude asks. Vercel’s free plan is for personal work; client work needs the paid plan

## Your first project

1. **Make an empty folder named after the client** — `acme-landing`, for example. That name is the project. Desktop, Documents — anywhere.
2. **Open it in Claude** — Claude app → Code → Open folder. Set permission mode to **Auto** (the control at the bottom of the chat).
3. **Paste this, once:**

   `Create a new landing from the AISTUDIOS kit: Vanwida/aistudios-landing-kit`

   Claude drops the kit into that folder and creates the GitHub repo. First time, GitHub opens in the browser: sign in, click **Authorize**, come back. The folder keeps the client’s name. That’s the project — not a folder called `landing-kit`.

4. **Start a new conversation** and type `/start`. Pick the option that fits: a brief, a finished Figma, or a site you like. After that, just talk.

Got a zip instead? Unzip it, rename the folder after the client (that name is the project), open it in Claude, type `/start`. Later, say **update the kit** for the current version.

## The path, in order

From the brief to a link you can share. One section at a time. A reference site is optional. The real URL comes later.

The kit’s phrases are in English. Claude understands any language, but these are the ones that are tested. Claude runs everything else — no Terminal.

| Step | You | What happens |
|---|---|---|
| Brief | Answer the questions. A reference site is optional | Preview and board open. Keep those two tabs open from here |
| Figma draft | Nothing — it starts on its own. Refine in Figma | Frames at 1440 and 390, real copy. It’s a draft |
| Import | Export each section as PNG into `brief/figma/`, then say **import** | Colours, fonts, spacing, section list. Figma is the source of truth from here |
| Build | Say **next** (or *build the next section…*) | One section, screenshots next to your frame. When it matches, **next** |
| Motion | After the last section, say **animate** | A list of effects as options. Untick what you don’t want |
| Review | Say **review** | Phone, tablet, accessibility, speed, links |
| Ship | Say **ship** | A preview link to share. **Go live** is the real URL, later |

Two words to remember:

| You type | You get |
|---|---|
| `/start` | “Where do you want to begin?” — from a brief · I have a Figma · I have a reference · continue |
| `/help` | “Where are you and what’s next?” — the next actions as options |

Everything else is plain words: *import · next · animate · review · ship · go live · undo · this looks wrong*.

## Where to look

- **Preview** — http://localhost:4321 — the page, updating live
- **Board** — http://localhost:4321/board — the brief, each section with your Figma frame next to the screenshots, colours and fonts, the review, the links, the save points. Only on your computer; never published

Folders you’ll actually open:

```
brief/figma/    section frames as PNG (Claude compares against these)
src/assets/     images and logos
public/video/   videos
```

Everything else is Claude’s.

## Keep this open

**`GUIDE.html`** — double-click it. What to type at each step, and when something happens, with a copy button on every phrase.

**`HANDBOOK.html`** — the ten ideas, in Figma words; what to say when you’re stuck; a glossary.

New version of the kit? Tell Claude **update the kit**. Design, sections and brief stay put.

## What you never have to do

Type Terminal commands · install libraries · read code · understand git · configure Vercel · resolve conflicts.

## What only you can do

Decide the design · refine the Figma draft · export assets from Figma · sign in to Figma, GitHub and Vercel in the browser the first time · judge whether it *feels* right.

## For Claude — creating a project from this template

You are in an empty folder and the designer pasted the create sentence. Do this, narrating one line at a time, never the commands:

1. `gh auth status` — if not logged in, say a browser window will open, then `gh auth login --web --git-protocol https`.
2. Repo name = the folder name (lowercase, hyphens). Ask once, with options, where it should live: their own account *(recommended)* / the agency’s organisation (ask its name).
3. `gh repo create <owner>/<name> --template Vanwida/aistudios-landing-kit --private`
4. GitHub copies the template in the background: poll `gh api repos/<owner>/<name>/contents/kit.json` every 2 s until it answers (up to 60 s).
5. `git clone https://github.com/<owner>/<name>.git .` (into this folder). Then `git checkout -b draft`.
6. Say: “The kit is in. **Start a new conversation** so I can load it, then type **/start**.” Stop.

If `gh repo create` fails, it is almost always the GitHub login: run `gh auth status`, and if needed `gh auth login --web --git-protocol https`, then try again.

## Licence

MIT. Use it, change it, use it for client work, ship it. The only condition is that the copyright notice stays in the copy (the `LICENSE` file — leave it there).

The kit is the system. **What you build with it is yours**: your sections, your tokens, your copy, your images, your client’s site. Nothing you make is covered by this licence.
