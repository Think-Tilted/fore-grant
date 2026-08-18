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
  alive, **Google Sheets is the database**, accessed only through a server-side
  Astro API route (`src/pages/api/sponsor.ts`, compiled into a Netlify Function
  by the `@astrojs/netlify` adapter). Visitors and Jess never interact with raw
  Sheets UI for the sponsor flow; this route is the only reader/writer.

- No auth system, no RLS, no idle/pause risk, no monthly cost — matches the
  brief's "crazy simple" goal and "limited to no scope creep."

### Architecture

```
Static Astro pages (About, Contact, Sponsor form UI)
        │
        ▼
Astro API route (src/pages/api/*, compiled to a Netlify Function)
        │
        ▼
Google Sheet (source of truth — sponsors, tiers, capacity)
```

- **Writes** (sponsor sign-up): form → `/api/sponsor` route → Sheets API
  append, after re-checking current tier capacity server-side.
- **Reads** (tier availability, optional tournament pairings): an API route or
  page queries the Sheet and renders normal HTML — no spreadsheet UI ever
  shown to visitors.

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
- **Backend:** Astro API routes (compiled to Netlify Functions) + Google
  Sheets API (no database)

- **Deploy:** release-triggered only (see below — auto-deploy-on-push is
  disabled to conserve Netlify build credits)

## Project slug

`fore-grant`

## Key paths

```
src/pages/          → routes (Astro file-based routing)
src/pages/api/      → server-rendered API routes (e.g. sponsor.ts), opted out
                      of static prerendering per-route; @astrojs/netlify
                      compiles these into Netlify Functions automatically —
                      there is no hand-written netlify/functions/ directory
src/layouts/        → shared layouts (BaseLayout.astro)
src/components/     → reusable components
src/styles/         → global CSS (Tailwind)
public/             → static assets (favicon, images); public/scripts/ holds
                      plain unprocessed JS served as external files (needed
                      so client scripts satisfy the CSP's `script-src 'self'`
                      — Astro's bundler otherwise inlines small module
                      scripts referenced from src/, which inline-script CSPs
                      block)
netlify.toml        → Netlify config (headers, redirects, build)

.env.example        → env var reference
brief.md            → original project brief (reference)
ROADMAP.md          → build plan / phase tracking
```

## Environment variables

| Variable | Where set | Purpose |
|----------|-----------|---------|
| `PUBLIC_SITE_URL` | Netlify (set by scaffold) | Canonical site URL |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Netlify + local `.env` | Service account `client_email` for Sheets API auth |
| `GOOGLE_PRIVATE_KEY` | Netlify + local `.env` | Service account `private_key` for Sheets API auth |
| `GOOGLE_SHEET_ID` | Netlify + local `.env` | Google Sheet ID used as sponsor/tier database |
| `GOOGLE_SHEET_TAB` | Netlify + local `.env` | Sheet tab name to read/append (`Sheet1`) |


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
`NETLIFY_BUILD_HOOK_URL`. Unlike the scaffold default, **auto-deploy-on-push
to `main` is disabled** via `netlify.toml`:

```toml
[build]
  ignore = "exit 0"
```

Exit code `0` tells Netlify "nothing changed, skip this build" — so every
push-triggered build is skipped, on every branch, without burning a Netlify
build credit on routine commits. This does **not** affect the release build
hook: Netlify guarantees the `ignore` command never cancels a build-hook
deploy, regardless of exit code (see
[Netlify docs](https://docs.netlify.com/build/configure-builds/ignore-builds)).
Only `gh release create` (or manually curling the build hook) deploys to
production.

This was verified end-to-end on the live site: pushing commits to `main`
produced zero new deploys, while hitting the build hook produced a deploy
that built and published successfully. (An earlier attempt used the Netlify
API's `stop_builds` site setting instead — that was reverted because it also
silently disabled the build hook itself, breaking releases entirely. The
`netlify.toml` `ignore` command is the correct, docs-backed mechanism and is
now documented as a general pattern in `project-scaffold`'s readme.)

### Manually triggering a deploy without a release

```bash
curl -X POST "$NETLIFY_BUILD_HOOK_URL"
```


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
