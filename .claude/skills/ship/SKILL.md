---
name: ship
description: Put the landing page online — save point, push to GitHub (preview link), or merge to main for production on Vercel; first time sets up GitHub + Vercel; also custom domains and review requests. Use when the designer says "ship", "publish", "put it online", "deploy", "go live", "send the client a link", "update the live site".
argument-hint: [prod | review | domain <name> | setup]
---

# /ship — from your computer to a link

Read the `deploy-vercel` skill for the commands, the branch policy and the failure table. This file is the conversation. The designer never hears the words branch, merge, commit or push — they hear **save point**, **saved online**, **preview link**, **live**.

## Mental model to give the designer (first time only)

> "Two places matter: **GitHub** keeps a copy of the project online — like the Figma file in the cloud, with full version history. **Vercel** turns that copy into a website. Every time we save, GitHub gets the latest and Vercel gives us a preview link. When we say *go live*, Vercel updates the real site. You never have to touch either of them."

## Step 0 — gates (quietly)

1. `npm run build` passes. If not → the `fix` skill first.
2. Unsaved work → save point: `git add -A && git commit -m "ship: <what changed>"`.
3. For **prod** only: `brief/REVIEW.md` exists for this version (or at least once). If not: "Let's run the review first — say **review**; two minutes, and it catches what clients notice." Also make sure `noindex` is removed from `<Base>` in `index.astro` and `site` in `astro.config.mjs` is the real domain (or the Vercel URL for now).

## Step 1 — first time on this project? (`/ship setup`, or automatic)

If there is no `origin` remote or no `.vercel/project.json`, run the **First-time setup** from `deploy-vercel`, narrating each browser moment in one line *before* it happens ("A browser window will open — log into GitHub and click Authorise."). If GitHub can't be set up today (no account, IT blocks `gh`), fall back to Vercel-only and say: "We'll add GitHub later — nothing changes for you."

## Step 2 — the ship itself

- **`/ship`** (default) → `git push` → preview link → "Here's the preview link for the client: https://… It's private-ish (not searchable) and updates every time we save online."
- **`/ship prod`** → ask once: "This updates the live site. Go ahead?" → merge `draft` into `main` per the policy → push → "Live: https://… — works from any phone or laptop."
- **`/ship review`** → `gh pr create --base main --head draft --title "<client> landing — <date>" --body "<plain-language summary + list of sections + link to preview>"` → "Review request sent. Whoever approves it on GitHub makes it live; I'll keep working meanwhile."
- **`/ship domain <name>`** → the domain steps from `deploy-vercel`; give the designer the exact DNS lines to forward to the client.

If the GitHub → Vercel connection isn't there, deploy directly with `npx vercel --yes` / `npx vercel --prod --yes` (same links, one command more for Claude, nothing for the designer).

## Step 3 — verify the live/preview site (don't skip)

`npm run shots -- --url <url> --name <preview|live>` → look at all three. Fonts, images and video must load; no console errors. `WebFetch` the URL to check `<title>`, description and OG image resolve.

## Step 4 — record and tell

Write to `brief/HANDOFF.md` (create from `templates/HANDOFF.md`): preview URL, production URL, date, one line of what changed. Then one short message with the link and the next step ("Send it to the client. When they come back with changes, tell me what they said and I'll adjust — then `/ship` again.").

## Multi-designer projects

If `brief/PROJECT.md` lists more than one designer, each machine works on `draft-<firstname>` (create on first run). `/ship prod` merges that branch. Conflicts: resolved by the policy, reported in one sentence, never delegated to the designer.
