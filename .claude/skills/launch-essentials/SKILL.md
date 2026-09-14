---
name: launch-essentials
description: The non-design things every landing page needs before launch and how to add them in this kit — contact/lead forms without a backend (Formspree, Web3Forms, Basin) with success/error states, analytics (GA4/Plausible) and EU cookie consent, SEO/social meta and OG image, favicon set, robots and sitemap, 404 page, legal pages, embeds (Calendly, HubSpot, YouTube/Vimeo lite), and accessibility of each. Load when a form, tracking, consent, meta, domain, or embed is mentioned.
---

# Launch essentials — the boring parts, done once and done right

## 1. Forms without a server

Static site → the form posts to a form service. Preferred (no account code in the page, spam protection, email notifications): **Web3Forms** (free, only needs an access key tied to the receiving email) or **Formspree** (`https://formspree.io/f/<id>`). The client's email receives submissions; they can add Slack/Sheets later.

Component `src/components/ContactForm.astro`:

```astro
---
const endpoint = import.meta.env.PUBLIC_FORM_ENDPOINT; // e.g. https://api.web3forms.com/submit
const accessKey = import.meta.env.PUBLIC_FORM_KEY;       // Web3Forms key (public by design)
---
<form class="form" method="POST" action={endpoint} data-form novalidate>
  {accessKey && <input type="hidden" name="access_key" value={accessKey} />}
  <input type="checkbox" name="botcheck" class="visually-hidden" tabindex="-1" autocomplete="off" />
  <div class="form__field">
    <label for="name">Name</label>
    <input id="name" name="name" type="text" autocomplete="name" required />
  </div>
  <div class="form__field">
    <label for="email">Email</label>
    <input id="email" name="email" type="email" autocomplete="email" required aria-describedby="email-error" />
    <p id="email-error" class="form__error" hidden>Please enter a valid email.</p>
  </div>
  <div class="form__field">
    <label for="message">Message</label>
    <textarea id="message" name="message" rows="4"></textarea>
  </div>
  <button class="btn btn--primary" type="submit">Send</button>
  <p class="form__status" role="status" aria-live="polite"></p>
</form>
<script>
  document.querySelectorAll('[data-form]').forEach((form) => {
    const status = form.querySelector('.form__status');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      const btn = form.querySelector('button[type=submit]');
      btn.disabled = true; status.textContent = 'Sending…';
      try {
        const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error();
        form.reset(); status.textContent = 'Thanks — we’ll be in touch shortly.';
      } catch { status.textContent = 'Something went wrong. Please email us directly.'; }
      finally { btn.disabled = false; }
    });
  });
</script>
```
Set the endpoint/key as Vercel environment variables — `npx vercel env add PUBLIC_FORM_ENDPOINT production preview`, same for `PUBLIC_FORM_KEY` — so the live site and the preview links have them. **You never write `.env`** (it's the designer's file; the permission rules block it). For the local preview, request the same keys in `brief/settings.json` (label + help in plain words) and the designer pastes the values on the board → **Settings**; they land in `.env` on their computer. Ask the designer only: "Which email should receive the messages?" Then set up the service with that email (Web3Forms: enter the email on their site → key arrives by email → the designer pastes it on the board → Settings, never in chat).

Consent: a form that collects personal data needs a privacy notice link next to the button ("By sending you agree to our privacy policy").

## 2. Analytics + EU cookie consent

Default recommendation: **Plausible** or **Fathom** (cookieless → no banner needed in most EU cases; simple script tag). If the client insists on **GA4/GTM/Meta Pixel**: those set cookies → a consent banner is required for EU visitors, and the scripts must load **only after consent**.

Minimal, honest consent (no dark patterns): `src/components/CookieConsent.astro` with two equal buttons (Accept / Reject), stored in `localStorage` (`consent=granted|denied`), loading the tracking script via a small function only on `granted`. Consent Mode v2 for GA4: set `gtag('consent','default',{ad_storage:'denied',analytics_storage:'denied'…})` first, update on accept. Keep the banner small, bottom, non-blocking, keyboard accessible, with a link to the privacy page.

## 3. Meta, social, favicon

- `Base.astro` already outputs title/description/canonical/OG/twitter. Feed it good values from `index.astro`: title = "Brand — promise in 6 words"; description ≤ 155 chars, written like an ad, no keyword stuffing.
- **OG image**: `public/og.jpg`, 1200 × 630, < 300 kB. Make it from the hero: screenshot at 1200×630 (`npm run shots -- --width 1200` then crop with `sharp`), or ask the designer for a Figma export (they'll prefer this — it's a design asset).
- **Favicon**: `public/favicon.svg` (done) + `public/apple-touch-icon.png` (180 px) + optional `public/favicon.ico` (32 px) for old browsers. Ask for the logo mark as SVG.
- `lang` on `<html>` from the brief (es/ca/en). Multi-language landings → one page per language (`/es/`, `/en/`) with `hreflang` links; only if the brief asks.

## 4. Robots, sitemap, 404, legal

- `public/robots.txt`:
  ```
  User-agent: *
  Allow: /
  ```
- Sitemap: `npx astro add sitemap` → adds `@astrojs/sitemap`; requires `site` in config; add `Sitemap: https://<domain>/sitemap-index.xml` to robots. Only worth it for multi-page sites.
- `src/pages/404.astro`: short, on-brand, with a link home. Vercel serves it automatically for unknown paths.
- Legal: `src/pages/privacy.astro` (+ `terms`/`legal-notice` if the client is in Spain: *Aviso legal* and *Política de privacidad* are expected). Content comes from the client; put a `TODO` placeholder page and a link in the footer so the structure exists.

## 5. Embeds

- **Calendly / HubSpot meetings**: prefer a link/button to the scheduling page (fast, no consent issues). Inline embed only if the design shows it; load it lazily with `loading="lazy"` on the iframe and a min-height to avoid layout shift.
- **YouTube / Vimeo**: use a facade — poster image + play button that injects the iframe on click (saves ~1 MB and a cookie banner). Component `src/components/VideoEmbed.astro`.
- **Maps**: static image (Mapbox Static / Google Static) with a link to the map, unless interaction is required.
- Any third-party script gets `defer`/`async` and, if it sets cookies, goes behind consent.

## 6. Performance defaults already in the kit

Astro images (AVIF/WebP, srcset), fonts preloaded with swap, GSAP/Lenis only, static output, no framework runtime. Keep it that way: every added script must justify itself.
