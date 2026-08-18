# Rural Route 3 Auto LLC website

A mobile-first Astro 4 marketing site for Rural Route 3 Auto LLC in Marshall, Minnesota. The site is deliberately call-first, lightweight, locally optimized, and built around the shop's real logo and waiting-room photo.

## Run locally

Requires Node.js 18.17.1 or newer (Node 20 LTS is recommended).

```bash
npm install
copy .env.example .env
npm run dev
```

Open the local URL printed by Astro. The page works without Resend credentials, but form submissions will show a clear "not configured" message until the environment variables are set.

Production commands:

```bash
npm run check
npm run build
npm run preview
```

This project uses Astro's Node adapter because a secret Resend API key cannot be shipped in static browser JavaScript. The marketing page and sitemap are prerendered; only `/api/contact` runs on the server.

## Configure the contact form

1. Create a Resend account and verify the domain that will send email.
2. Copy `.env.example` to `.env`.
3. Set `RESEND_API_KEY` to the secret API key.
4. Set `RESEND_FROM_EMAIL` to an address on the verified sending domain.
5. Set `CONTACT_TO_EMAIL` to Brandon's preferred inbox.
6. Add the same variables to the production host. Do not commit `.env`.

The API validates and normalizes every field with Zod, strips control characters, sends plain-text email (so user input is never rendered as HTML), uses a hidden honeypot, and applies a small in-memory rate limit. On a multi-instance/serverless host, replace the in-memory limiter with the host's shared rate-limiting service if abuse becomes a problem.

## Replace the photos

Source images live in `src/assets/`:

- `rr3-logo.jpg` — header mark.
- `waiting-room.jpg` — authentic shop photo and social preview source.
- `photos/mechanic-engine.jpg` — sample engine-repair hero image.
- `photos/car-on-lift.jpg` — sample full-service shop image.
- `photos/engine-detail.jpg` — sample engine-diagnostics image.
- `photos/tire-service.jpg` — sample tire-service image.

Replace a file in place to keep every reference working, or update the imports at the top of `src/pages/index.astro`. Keep the same general aspect ratios when possible. Astro automatically optimizes imported local images during the production build.

For best hero quality, use a real vertical shop photo at least 1,200 pixels wide. Avoid generic stock images—real bays, real people, and real vehicles will convert better for a local shop.

The sample service photos were downloaded from Pexels and are stored locally so the site does not depend on third-party image hotlinks:

- Engine technician by Artem Podrez: https://www.pexels.com/photo/a-mechanic-fixing-a-car-engine-8985860/
- Vehicle on lift by Artem Podrez: https://www.pexels.com/photo/car-on-lift-at-auto-the-repair-shop-8985667/
- Engine detail by Anna Shvets: https://www.pexels.com/photo/an-auto-mechanic-repairing-the-car-engine-4315572/
- Tire service by Mattia Linari: https://www.pexels.com/photo/mechanic-working-on-car-tire-in-workshop-31097241/

These photos illustrate services; they do not depict Rural Route 3 Auto or its staff. Replace them with Brandon's real shop photos before launch when possible.

## Replace the review slots

The three intentionally labeled preview reviews are in the `reviewSlots` array near the top of `src/pages/index.astro`. Replace each `prompt` and `source` with a verified review and the reviewer's display name/platform. Remove the small “Preview testimonial slots” note after the reviews are verified.

Do not publish invented testimonials or mark up old, unavailable reviews as current Google reviews. The visible 5.0 rating is based on the supplied business information; re-check it immediately before launch.

## Before launch: NAP and SEO checklist

The exact Name, Address, and Phone used throughout the site is:

```text
Rural Route 3 Auto LLC
2779 300th St
Marshall, MN 56258
(507) 828-7206
```

Confirm Brandon's exact preferred/legal public business-name spelling and compare this block character-for-character with the reinstated Google Business Profile before launch. Then:

- Replace the temporary `https://rr3auto.com` value in `.env`, `public/robots.txt`, and the JSON-LD in `src/pages/index.astro` if the final domain differs.
- Re-check the map pin and written directions with Brandon.
- Confirm the hours, including holiday hours.
- Confirm the coordinates in schema: `44.4867007, -95.7388543`.
- Replace the review slots with current, verified customer quotes.
- Test the click-to-call link on both iPhone and Android.
- Send a real form submission and verify it reaches the correct inbox.
- Add a privacy policy if analytics, ad pixels, or additional data collection is introduced.

## Main files

- `src/pages/index.astro` — page content, schema, interactions, and form behavior.
- `src/styles/global.css` — design system and custom styling.
- `src/pages/api/contact.ts` — validated Resend endpoint.
- `src/pages/sitemap.xml.ts` — generated sitemap.
- `astro.config.mjs` — hybrid output and Node deployment adapter.

## Deployment

Deploy to any host that can run the Astro Node standalone adapter (for example a Node service or container). Run `npm run build`, then start the generated server with:

```bash
node ./dist/server/entry.mjs
```

Set `HOST=0.0.0.0` and `PORT` as required by the host, along with all four environment variables shown in `.env.example`.

### Astro 4 security note

This sample intentionally follows the requested Astro 4.x constraint. Astro 4 is no longer the current major release and `npm audit` now reports upstream advisories that are only resolved by a major Astro/Node-adapter upgrade. Before a public production launch, upgrade Astro and `@astrojs/node` to supported current majors, re-run the checks, and re-test the form. Do not expose the Astro development server to the public internet.
