# Fore Grant — Build Roadmap

The project brief lives in [`brief.md`](./brief.md). This is the build order —
how the pieces get assembled and how we know each phase is done.

> Rule: every phase ends in a working, testable state. No half-wired layers.
> Keep it dead simple — this is a pro bono project with zero appetite for scope
> creep or ongoing infra cost.

---

## Phase 0 — Scaffold ✅

- [x] Run `project-scaffold create` (Tier 1, public, no domain) → GitHub repo
      `Think-Tilted/fore-grant` + Netlify site created, first deploy triggered
- [x] Clone repo locally into `_pocStuff/fore-grant/`
- [x] Move `brief.md` into the repo for reference
- [x] Rewrite `readme.md` with actual project vision + architecture
- [x] `ROADMAP.md` created (this file)

**Done:** repo exists locally, readme reflects the real plan, not scaffold
boilerplate.

---

## Phase 1 — Deploy hygiene ✅

- [x] Disable Netlify auto-deploy-on-push on the fore-grant site, keep the
      release-triggered build hook working
- [x] Verify: push a trivial commit to `main` → confirm **no** build fires
- [x] Verify: hitting the build hook directly → confirm a build **does** fire
      and publishes successfully
- [x] Note actual verified behavior back in `readme.md`

**Done:** implemented via `netlify.toml`'s `[build] ignore = "exit 0"` —
confirmed against Netlify's docs ("the `ignore` command won't cancel a build
triggered by a build hook, regardless of exit code") and verified live:

- Pushed two commits to `main` → zero new deploys triggered.
- Hit the build hook directly → new deploy created, built, and published
  successfully.

First attempt used the Netlify API's `stop_builds` site setting instead —
reverted after discovering it also silently blocks the build hook itself
(hook returned `200 OK` but no deploy was ever created), which would have
broken `gh release create` entirely. The `netlify.toml` approach is correct,
version-controlled, and now documented as a general pattern in
`project-scaffold`'s readme for reuse on other projects.


---

## Phase 2 — Static content

- [ ] Figma reference (colors, fonts, logo, button/component states) — supplied
      separately, reuse existing flyer branding
- [ ] Home page — hero, tournament info, CTA to sponsor form
- [ ] About Grant & the Foundation — content + images page(s)
- [ ] Contact page (reuse from scaffold template, adjust copy)
- [ ] Apply branding: colors, fonts, logo assets

**Done when:** the static shell of the site is live and on-brand, no dynamic
pieces yet.

---

## Phase 3 — Google Sheets integration foundation

- [ ] Create the sponsor tracker Google Sheet (tiers + capacity + sponsor rows)
- [ ] Create a Google Cloud service account scoped to that one Sheet, generate
      key
- [ ] Add `GOOGLE_SERVICE_ACCOUNT_KEY` + `SPONSOR_SHEET_ID` as Netlify env vars
- [ ] `netlify/functions/` — shared Sheets client helper (auth + read/write)
- [ ] Basic read function: fetch current tier capacity from the sheet

**Done when:** a Netlify Function can successfully read live data from the
Sheet in a deployed preview.

---

## Phase 4 — Sponsor sign-up form

- [ ] Sponsor form UI (Astro page) — sponsor tiers rendered dynamically from
      current capacity (via the Phase 3 read function)
- [ ] Tiers at capacity show as sold out, submission blocked client-side
- [ ] Netlify Function: validate + re-check capacity server-side, append row
      to the Sheet if space remains
- [ ] Handle the race-condition edge case gracefully (friendly error if a tier
      fills between page load and submit)
- [ ] Confirmation state/page after successful submission

**Done when:** a real sponsor sign-up end-to-end works against the live Sheet,
sold-out tiers are correctly blocked.

---

## Phase 5 — Tournament organization (optional / stretch)

- [ ] Extend the Sheet (or add a second sheet/tab) for groups, pairings, tee
      times, order
- [ ] Public read view — Astro page displaying current tournament org, pulled
      live from the Sheet
- [ ] Lightweight passphrase-protected admin page for editing pairings/tee
      times with a friendlier UI than raw spreadsheet cells (dropdowns, basic
      validation)

**Done when:** Jess can update pairings via the admin page (or directly in the
Sheet) and see it reflected on the public page — decide which editing path is
actually needed before building the admin UI.

---

## Phase 6 — Domain + launch

- [ ] Purchase domain (`teeingoffforegrant.com` or `fore-grant.com`, on Jess's
      account/card)
- [ ] `project-scaffold add-domain fore-grant <domain>`
- [ ] Final content pass with Jess (remaining copy edits from flyer)
- [ ] `gh release create v1.0.0 --generate-notes` — real launch deploy
- [ ] Confirm sold-out logic, form, and (if built) tournament org all work on
      the live domain

**Done when:** the site is live on the real domain and replaces the
flyer → Google Form → shared sheet flow from last year.

---

## Deferred / explicitly out of scope for v1

- Supabase / any database — ruled out due to free-tier pause risk and because
  Sheets already matches the client's mental model (see readme "Why this
  stack")
- Multi-user admin auth — single passphrase gate is enough for one admin
- CMS for static content — direct file edits are fine at this scale
