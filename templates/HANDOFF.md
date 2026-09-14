# HANDOFF — <Client> landing page

## The site
- Live: <https://…>  (since <date>, version "<last save point>")
- Preview: <https://…>
- Hosting: Vercel project `<name>` · Code: GitHub `<org/repo>` (branch `main` = live)

## Where things live
- The project folder: `<folder name>`. Each part of the page is one file in `src/sections/` (Hero.astro, Features.astro…).
- Images and logos: `src/assets/`. Videos: `public/video/`. Fonts: `public/fonts/`.
- Texts are plain text inside each section file — easy to change.

## How to change things (with Claude Code open in the folder)
- **Change a text** → say: "In the hero, change the headline to …" → then `/ship prod`.
- **Replace an image** → drop the new file in `src/assets/`, say which one it replaces → `/ship prod`.
- **Add a section** → `/build <name>` → `/review` → `/ship prod`.
- **Undo** → `/undo` shows the save points; pick one.

## Fonts
- <Font> — <Google Fonts | licensed to <client> | files in public/fonts>

## Integrations
- Form: <provider> → submissions go to <email> · Analytics: <none | Plausible | GA4 id …> · Cookie consent: <no (cookieless) | yes>
- Embeds: <…>

## Domain
- <domain> managed by <who>; DNS: <records set>; HTTPS automatic.

## Open items
- <from SECTIONS.md TODOs>

## Quality
- Last review: <date> — <Lighthouse or summary>; motion level <n>; reduced-motion respected; responsive 390/834/1440/1920.
