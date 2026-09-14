---
name: deploy-vercel
description: How this kit goes online — the GitHub-first flow (draft/main branches, preview per push, production on merge) with Vercel's Git integration, the Vercel-CLI-only fallback, custom domains and DNS, and every failure mode with its fix. Also the branch/merge policy Claude applies without asking the designer. Load when shipping, connecting GitHub, or setting up a domain.
---

# Deploy — GitHub + Vercel, without the designer ever seeing git

## The policy (Claude decides; the designer never chooses branches)

- **`main`** = what is live in production. Nobody edits it directly.
- **`draft`** = the working branch. Every save point (commit) happens here and is **pushed immediately** → GitHub always has the latest work, and Vercel builds a **preview URL** for it.
- **`/ship`** (preview) = push `draft` → share the preview URL.
- **`/ship prod`** = merge `draft` into `main` (fast-forward when possible), push → production deploy. Then go back to `draft`.
- Several designers on one project: each works on `draft-<firstname>`; `/ship prod` merges that branch into `main`. Because one section = one file, conflicts are rare. When one happens, Claude resolves it: keep the change from the branch being shipped for files it touched; keep `main`'s version for files it didn't; if both changed the same section, keep the newest save point's version and tell the designer in one sentence which section was affected so they can check the preview. Never leave conflict markers in files. Never ask the designer to resolve a conflict.
- **Pull requests** are optional and only for agencies that want a review gate: `/ship review` opens a PR from `draft` to `main` with a plain-language summary (what changed, screenshots attached from `brief/shots/`). The reviewer merges on GitHub; Claude never blocks on it.
- Never `--force`. Never rewrite history. Never delete branches without asking.

Vocabulary for the designer (say these, never the git words): "save point" (commit), "saved online" (pushed), "preview link" (branch deploy), "live" (production), "review request" (PR).

## First-time setup for a project (once)

Prerequisites on the machine (check quietly): `git`, `gh` (GitHub CLI), `node ≥ 22.12`, `npx vercel` (comes via npx). Install `gh` on macOS with `brew install gh` if Homebrew exists; otherwise tell the designer to download it from cli.github.com (one click installer).

1. **GitHub login** (once per machine): `gh auth status` → if not logged in, `gh auth login --web --git-protocol https` → tell them: "A browser window will open and show a one-time code — click Authorise. That connects your GitHub account." Wait, then re-check.
2. **Create the repo** (once per project), from the project folder:
   ```
   git init -b main                 # if not already
   git add -A && git commit -m "save point: project start"
   gh repo create <agency>-<client>-landing --private --source=. --remote=origin --push
   git checkout -b draft && git push -u origin draft
   ```
   Repo name: lowercase, hyphens. Under the agency's GitHub organisation if the designer has one (`gh repo create <org>/<name> …`); ask once which, then remember in `brief/PROJECT.md`.
3. **Vercel login** (once per machine): `npx vercel login` → prints a link / opens the browser → "Log in to Vercel (or create the account with 'Continue with GitHub'), then come back." Wait, then `npx vercel whoami` to confirm.
4. **Create + connect the Vercel project** (once per project):
   ```
   npx vercel link --yes            # creates the Vercel project from this folder
   npx vercel git connect           # links it to the GitHub repo → deploys on every push
   ```
   The first `git connect` may ask to install the Vercel GitHub app: a browser page appears — "Click Install, choose the account/organisation, allow the repository." If `git connect` refuses (permissions), the fallback is the Vercel dashboard: *Add New → Project → Import* the repo (2 clicks) — or use the CLI-only flow below.
   Production branch is `main` by default. Vercel detects Astro automatically (build `astro build`, output `dist`). No adapter needed for static output.
5. Push once more (`git push`) and check that a preview deployment appears: `npx vercel ls` or the Vercel MCP tools if authenticated. Note the preview URL in `brief/HANDOFF.md`.

## Every-day shipping

```
git add -A && git commit -m "<save point name>"     # after each section / motion / review
git push                                              # → preview deploy of draft (URL: npx vercel ls, or Vercel MCP)
```
Production:
```
git checkout main && git pull --ff-only
git merge --ff-only draft || git merge --no-edit draft   # resolve per the policy if it conflicts
git push
git checkout draft
```
Get the production URL from `npx vercel ls --prod` / project settings, or `npx vercel inspect <deployment-url>`.

If the Git integration isn't set up (or is broken), deploy directly: `npx vercel --yes` (preview) / `npx vercel --prod --yes` (production). Same result, no GitHub involved.

## CLI-only fallback (no GitHub at all)

Some agencies don't have GitHub yet. Then: `npx vercel login` → `npx vercel --yes` → `npx vercel --prod --yes`. Keep local save points (git commits) anyway so `/undo` works. Suggest adding GitHub later ("so the agency has a copy and teammates can join").

## Custom domain

1. `npx vercel domains add <domain>` (adds to the project) — or dashboard → Project → Settings → Domains.
2. Tell the designer what to send to whoever manages the client's DNS, exactly:
   - For `www.client.com`: a **CNAME** record `www` → `cname.vercel-dns.com`
   - For the bare `client.com`: an **A** record `@` → `76.76.21.21`
   (Vercel shows the exact values after step 1 — copy them from the output; they can change.)
3. Redirect bare → www (or the reverse) in the Vercel domain settings. HTTPS is automatic. Propagation: minutes to a few hours.
4. Update `site` in `astro.config.mjs`, re-ship to production.

## Environment variables

Static landings usually have none. If a form endpoint or analytics ID must stay out of the code: `npx vercel env add PUBLIC_FORM_ENDPOINT production preview`, and read it in Astro via `import.meta.env.PUBLIC_FORM_ENDPOINT`. For the local preview, request the key in `brief/settings.json` and the designer pastes the value on the board → **Settings** (it lands in `.env`, which you never read or write).

## Failure modes → fixes

| Symptom | Cause | Fix |
|---|---|---|
| `vercel login` prints a URL but nothing happens | headless shell can't open the browser | tell the designer to open the printed URL themselves; or `npx vercel login --github` |
| Login impossible on this machine | corporate restrictions | designer creates a token at vercel.com/account/tokens; you request `VERCEL_TOKEN` in `brief/settings.json` (label: "Vercel token") and they paste it on the board → Settings; deploy with `set -a; . ./.env; set +a; npx vercel --prod --yes` — the shell reads the token, you never see it, and it never appears in chat |
| Build passes locally, fails on Vercel: "cannot find module ./Hero.astro" | file name case (macOS is case-insensitive, Linux isn't) | rename to match the import exactly; commit; push |
| Fonts/images missing live | referenced with a wrong path (`src/assets` used as a URL) | import through `astro:assets`, or move to `public/` and use `/file.ext` |
| "Error: No existing credentials found" | `.vercel` folder missing / other machine | `npx vercel link --yes` again |
| Push rejected (non-fast-forward) | someone else pushed to the same branch | `git pull --rebase` then push; if conflicts, apply the policy |
| `gh: command not found` | GitHub CLI not installed | install (brew/download) or use the CLI-only fallback for today |
| Vercel MCP tools missing | not authenticated | `/mcp` → vercel → Authenticate (optional; CLI works without it) |
