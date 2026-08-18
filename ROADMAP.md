# Fore Grant — Build Roadmap

The project brief lives in [`brief.md`](./brief.md). This is the build order —
how the pieces get assembled and how we know each phase is done.

> Rule: every phase ends in a working, testable state. No half-wired layers.
> Keep it dead simple — this is a pro bono project with zero appetite for scope
> creep or ongoing infra cost.

> ⚠️ **Open scope gap vs. the original brief:** automatic sold-out
> enforcement per sponsor tier (brief.md line 8: "Website should
> automatically indicate when a tier is sold out and prevent additional
> registrations for that tier") is **not built** — see Phase 4's "Deferred
> from original plan" note. Tiers currently show as informational only, with
> no capacity limit enforced. Revisit before launch if this matters for real
> sponsor volume, or explicitly confirm with Jess that manual tracking is
> fine for now.

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

## Phase 2 — Static content ✅

- [x] Hero redesigned to match flyer branding (script logo mark, flagpole +
      ribbon graphic, argyle top/bottom borders, warm paper/fairway/ribbon
      palette)
- [x] Home page — hero, tournament info, sponsorship tier cards, CTA
- [x] About Grant page — story + tournament summary
- [x] Contact page (to be rebuilt in Phase 4 with the real form)
- [x] Branding applied: colors, fonts (Playfair Display / Lobster Two / Lora),
      logo/flag SVG mark
- [x] Google Maps embed of San Vicente Golf Course added to bottom of home
      page (full-width, matching other card sections), with a "Get
      Directions" link — required adding `frame-src https://www.google.com`
      to the CSP in `netlify.toml`

**Done:** the static shell of the site is live and on-brand.


---

## Phase 3 — Google Sheets integration foundation ✅

- [x] Sponsor tracker Google Sheet created, shared with the service account
      email (`website-account@fore-grant.iam.gserviceaccount.com`)
      — Sheet ID `1CCGUh2YN4-PByJUO-XG2CVfOpJICkRu7aQy1_z7IH4M`, tab `Sheet1`
- [x] Google Cloud service account created, JSON key generated
- [x] **Security step:** extracted `client_email` + `private_key` out of the
      raw JSON key file into `fore-grant/.env` (gitignored), deleted the JSON
      file from the repo before ever staging it
- [x] Added `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`,
      `GOOGLE_SHEET_ID`, `GOOGLE_SHEET_TAB` — placeholders in `.env.example`,
      real values in local `.env` (still need to set on Netlify for prod)
- [x] Added `googleapis` dependency
- [x] `src/lib/sheets.ts` — JWT auth via service account, `appendSponsorRow()`
      helper
- [x] `src/pages/api/sponsor.ts` — Astro server API route (per-route
      `prerender = false`, works alongside the rest of the static site under
      the `@astrojs/netlify` adapter), validates required fields, appends row

**Sheet1 columns:**
`Timestamp | Company Name | Sponsor Tier | Company Website | Payment Type | Captain First Name | Captain Last Name | Phone | Email | Player 2 | Player 3 | Player 4 | Comments`

- [x] `scripts/apply-sheet-formatting.ts` (`npm run sheet:format`) — one-off
      admin script, not part of the deployed site or form-submission flow.
      Applies via the Sheets API: conditional formatting (color-coded
      Sponsor Tier + Payment Type by enum value, persists automatically for
      all future submissions), frozen/bold header row, alternating row
      banding, text wrap on Comments/Company Website, and padded column
      widths

**Done:** verified locally end-to-end — `npm run dev`, POSTed a minimal test
payload to `/api/sponsor`, got `{"ok":true}`, confirmed the row landed in the
live Google Sheet. Re-verified after adding `sheet:format` by submitting two
placeholder rows and confirming conditional formatting applied correctly.

---


## Phase 4 — Sponsor registration form ✅ (live now, no capacity gating yet)

- [x] Rebuilt `contact.astro` as the real **Sponsor Registration Form**:
  - Section 1 — Company Information: Company Name, Sponsor Tier, Company
    Website URL, Payment Type
  - Section 2 — Player Information: Team Captain First/Last Name, Phone,
    Email; optional Player 2/3/4 names
  - Section 3 — Special Requests or Comments (open text)
- [x] Client-side `fetch` POST to `/api/sponsor`, inline success/error state
      (no page reload, no redirect)
- [x] Reconciled "coming soon" sponsorship copy on home/about pages — CTAs now
      point directly at the live registration form
- [x] Server-side validation (required fields) before appending to the Sheet

**Done:** submitting the form appends a correct row to the Google Sheet
end-to-end (verified via curl against the local dev server — see Phase 3).
Still need to set the real env vars on Netlify before this works on the
deployed site (see "Remaining before production" below).

**Deferred from original plan:** dynamic tier-capacity/sold-out logic (reading
current sheet state before allowing submission) is out of scope for this pass
— tiers are shown as informational only for now. Revisit if sponsor volume
makes manual tracking by Jess impractical.

**Remaining before production:**
- [x] Set `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`,
      `GOOGLE_SHEET_ID`, `GOOGLE_SHEET_TAB` as real Netlify environment
      variables — imported via `netlify env:import .env --site
      018be25b-d30c-4262-9f6c-a6174dc4567f`, confirmed all 4 values landed
      correctly (private key newlines intact)
- [ ] Deploy via `gh release create` and re-verify one real submission against
      production before telling Jess it's live




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
- [ ] Confirm form and (if built) tournament org work on the live domain
- [ ] Decide on sold-out-tier enforcement (see open scope gap callout at top
      of this file) before telling Jess the site fully replaces last year's
      flow


**Done when:** the site is live on the real domain and replaces the
flyer → Google Form → shared sheet flow from last year.

---

## Deferred / explicitly out of scope for v1

- Supabase / any database — ruled out due to free-tier pause risk and because
  Sheets already matches the client's mental model (see readme "Why this
  stack")
- Multi-user admin auth — single passphrase gate is enough for one admin
- CMS for static content — direct file edits are fine at this scale
