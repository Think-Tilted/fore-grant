# Fore Grant

A simple, mostly-static website for the Grant Golf Tournament, built pro bono for
Jess. See [`brief.md`](./brief.md) for the original project brief.

## Project vision

The site replaces last year's flyer → Google Form → shared spreadsheet flow, which
was clunky for sponsors and hard to manage. The goal is something dead simple to
run, with **no ongoing infrastructure cost or maintenance burden**, that still
gives Jess a clean way to see sign-ups and (optionally) manage tournament-day
logistics.

### Core features

1. **Sponsor sign-up form** — online registration with sponsor tiers, each with a
   finite number of spots. The site tracks remaining capacity per tier and
   automatically shows a tier as sold out once it's full, blocking further
   sign-ups for that tier.
2. **About Grant & the Foundation** — static content pages (text, images,
   supporting content). Low-maintenance, no CMS needed.
3. **Optional: tournament organization** — groups, pairings, tee times, and order
   displayed on the site, sourced from a spreadsheet so non-technical users
   (Jess) can update it by just editing a sheet. Stretch goal, not required for
   launch.

### Why this stack (no Supabase)

This project intentionally runs as a **Tier 1 scaffold (static Astro, no
database)**, even though the sponsor form needs some server-side state
(tier capacity checks). We considered Tier 2 (Supabase) but ruled it out:

- **Supabase free-tier projects pause after 1 week of inactivity.** A golf
  tournament sign-up has bursty traffic (a flurry after the flyer goes out, then
  silence) — a real risk of the DB pausing right when someone tries to sign up.
- The client's own mental model is already "data lives in a tracker sheet" — so
  instead of adding Postgres as a translation layer that then needs to be kept
  alive, **Google Sheets is the database**, accessed only through server-side
  Netlify Functions. Visitors and Jess never interact with raw Sheets UI for the
  sponsor flow; the Functions are the only reader/writer.
- No auth system, no RLS, no idle/pause risk, no monthly cost — matches the
  brief's "crazy simple" goal and "limited to no scope creep."

### Architecture

```
Static Astro pages (About, Contact, Sponsor form UI)
        │
        ▼
Netlify Functions (serverless)
        │
        ▼
Google Sheet (source of truth — sponsors, tiers, capacity)
```

- **Writes** (sponsor sign-up): form → Netlify Function → Sheets API append,
  after re-checking current tier capacity server-side.
- **Reads** (tier availability, optional tournament pairings): Function or page
  queries the Sheet and renders normal HTML — no spreadsheet UI ever shown to
  visitors.
- **Admin view for sponsors:** Jess just opens the Google Sheet directly — no
  custom admin UI needed, it's the interface she already knows.
- **Admin view for tournament org (if built):** a small passphrase-protected
  Astro page that reads/writes the same Sheet, but with a friendlier editing UI
  (dropdowns, validation) than raw spreadsheet cells — since pairings/tee times
  are easier to get wrong by hand.

Known tradeoff: no strict transactional guarantees on the Sheet, so there's a
small race-condition window if two sponsors submit for the last spot in a tier
at the same instant. Acceptable risk for this use case — worst case Jess
manually resolves it.

## Stack

- **Framework:** Astro 6 (static output)
- **Styling:** Tailwind CSS v4
- **TypeScript:** strictest config
- **Hosting:** Netlify (free tier)
- **Backend:** Netlify Functions + Google Sheets API (no database)
- **Deploy:** release-triggered only (see below — auto-deploy-on-push is
  disabled to conserve Netlify build credits)

## Project slug

`fore-grant`

## Key paths

```
src/pages/          → routes (Astro file-based routing)
src/layouts/        → shared layouts (BaseLayout.astro)
src/components/     → reusable components
src/styles/         → global CSS (Tailwind)
public/             → static assets (favicon, images)
netlify/functions/  → serverless functions (sponsor form, sheet reads)
netlify.toml        → Netlify config (headers, redirects, build)
.env.example        → env var reference
brief.md            → original project brief (reference)
ROADMAP.md          → build plan / phase tracking
```

## Environment variables

| Variable | Where set | Purpose |
|----------|-----------|---------|
| `PUBLIC_SITE_URL` | Netlify (set by scaffold) | Canonical site URL |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | Netlify (added manually) | Service account JSON for Sheets API access |
| `SPONSOR_SHEET_ID` | Netlify (added manually) | Google Sheet ID used as sponsor/tier database |

Copy `.env.example` to `.env` for local dev. Netlify env vars are set via the
account env API (site-scoped).

## Local development

```bash
npm install
npm run dev          # starts Astro dev server on localhost:4321
npm run build        # production build to dist/
npm run preview      # preview production build locally
```

## Deploying

This project deploys via **release-triggered builds only**:

```bash
gh release create v1.0.0 --generate-notes
```

This hits a Netlify build hook stored as the GitHub Actions secret
`NETLIFY_BUILD_HOOK_URL`. Unlike the scaffold default, **auto-deploy-on-push to
`main` has been manually disabled** on this site's Netlify settings (Stop
builds) to avoid burning Netlify build credits on every commit — only
published releases (or a manual build-hook trigger) deploy to production.

## Security headers

Security headers are configured in `netlify.toml`:
- `Content-Security-Policy` — restrictive CSP (self + inline styles for Tailwind)
- `Strict-Transport-Security` — HSTS with 1-year max-age
- `X-Frame-Options` — DENY
- `X-Content-Type-Options` — nosniff
- `Referrer-Policy` — strict-origin-when-cross-origin

**See [`SECURITY.md`](./SECURITY.md)** for the security model and rules (secrets,
headers, dependencies) for this static site.

## Adding pages

Create a new `.astro` file in `src/pages/`:

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
---
<BaseLayout title="New Page">
  <h1>New Page</h1>
</BaseLayout>
```

The route is derived from the file path: `src/pages/about.astro` → `/about`.

## State file

This project's infrastructure state is tracked at:
```
~/.think-tilted/projects/fore-grant.json
```

Use `project-scaffold status fore-grant` to view it.

## Adding a custom domain

Once purchased (`teeingoffforegrant.com` or `fore-grant.com`, on Jess's
account):

```bash
project-scaffold add-domain fore-grant <domain>
```

## Tearing down

```bash
project-scaffold teardown fore-grant
```

This deletes the GitHub repo, Netlify site, and state file.
