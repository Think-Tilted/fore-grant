# Fore Grant

> Internal project — scaffolded by `project-scaffold` for Think Tilted.

## Stack

- **Framework:** Astro 6 (static output)
- **Styling:** Tailwind CSS v4
- **TypeScript:** strictest config
- **Hosting:** Netlify (free tier)
- **Deploy:** release-triggered via GitHub Actions build hook

## Project slug

`fore-grant`

## Key paths

```
src/pages/          → routes (Astro file-based routing)
src/layouts/        → shared layouts (BaseLayout.astro)
src/components/     → reusable components
src/styles/         → global CSS (Tailwind)
public/             → static assets (favicon, images)
netlify.toml        → Netlify config (headers, redirects, build)
.env.example        → env var reference
```

## Environment variables

| Variable | Where set | Purpose |
|----------|-----------|---------|
| `PUBLIC_SITE_URL` | Netlify (set by scaffold) | Canonical site URL |

Copy `.env.example` to `.env` for local dev. Netlify env vars are set via the account env API (site-scoped).

## Local development

```bash
npm install
npm run dev          # starts Astro dev server on localhost:4321
npm run build        # production build to dist/
npm run preview      # preview production build locally
```

## Deploying

This project deploys via **release-triggered builds**:

```bash
gh release create v1.0.0 --generate-notes
```

This hits a Netlify build hook stored as the GitHub Actions secret `NETLIFY_BUILD_HOOK_URL`. Pushes to `main` also auto-deploy via Netlify's GitHub integration.

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

## Upgrading to Tier 2

To add Supabase (database + auth):
```bash
project-scaffold upgrade fore-grant
```

This creates a Supabase project and sets env vars on Netlify. You then need to manually add the Supabase client code — see `templates/tier2/` in the scaffold repo for reference files.

## Adding a custom domain

```bash
project-scaffold add-domain fore-grant example.com
```

## Tearing down

```bash
project-scaffold teardown fore-grant
```

This deletes the GitHub repo, Netlify site, and state file.
