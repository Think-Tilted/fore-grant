# Figma Feedback Roadmap — 2026-09-01

Tracking the two unresolved Figma comments from Kyle (file key
`6qiOahJwM68SdswOurWwxL`), pinpointed via the Figma REST API's
comment `client_meta.node_offset` against the live node tree.

Resolved comments from 8/31 are not tracked here — they already have
"Comment resolved" replies and appear reflected in the current code
(e.g. the T-ALL leukemia copy change, goodie bag bullet edits).

---

## 1. Contact page — remove "EVENT DIRECTOR" label

- **Figma comment:** "Remove this line totally" (node 70:3, "Contact" frame)
- **Confirmed target:** the `role` text node reading "EVENT DIRECTOR",
  inside `contact.astro`'s `.contact-director` block.
- **Status:** [x] Done

### Steps
- [x] Remove `<p class="contact-role">EVENT DIRECTOR</p>` from `src/pages/contact.astro`
- [x] Remove the now-orphaned `.contact-role` CSS rule
- [ ] Visually confirm Contact page still reads correctly with just the name (pending manual/browser check)

---

## 2. Registration page — live sponsor tier availability ticker

- **Figma comment:** "can you confirm the back end tickers? these need to
  count down as a live total. its not doing it right now for the testing."
  (node 52:3, "Registration" frame, pinned on the "2 left" availability badge)
- **Confirmed target:** `spotsRemaining` in `src/data/tiers.ts` was a
  hand-edited static number — not live. Wired to real registration counts
  from the Google Sheet.
- **Decision:** today's `spotsRemaining` values became the tier `capacity`
  (full slot count). Live remaining = `capacity - (rows in Sheet for that tier)`.
- **Sheet status:** test rows cleared by Trevor — confirmed via read-only
  check that `Sheet1!C2:C` is now empty (0 rows), so every tier currently
  shows full capacity live.
- **Status:** [x] Implementation done — pending live manual verification

### Steps
- [x] `src/data/tiers.ts`: renamed `spotsRemaining` → `capacity` (values unchanged),
      updated header comment to describe it as the easily-adjustable total-slots
      number and static fallback; `badgeTone`/`badgeLabel` now take a `remaining`
      number directly (used by both the Astro fallback render and the client script)
- [x] `src/lib/sheets.ts`: added `getTierRegistrationCounts()` — reads `Sheet1!C2:C`,
      counts rows per exact tier string
- [x] `src/data/tiers.ts`: added `getTierBySheetString()` helper to map a tier's
      exact `"Name — Price"` string back to its `id`
- [x] `src/pages/api/availability.ts` (new): `prerender = false`, calls the
      sheets helper, returns `{ [tierId]: remaining }` JSON; falls back to
      `{}` on any error (try/catch around the whole handler)
- [x] `src/components/TierRow.astro`: added `data-tier-id` and `data-capacity`
      attributes to the row root; static render now computes remaining from
      `tier.soldOut ? 0 : tier.capacity` as the fallback
- [x] `public/scripts/availability.js` (new): fetches `/api/availability` on
      page load, updates each tier row's badge label/tone and sold-out state
      (disables toggle, removes chevron, swaps CTA to a disabled "Sold Out"
      button matching Button.astro's real class names `btn btn-primary btn-md`);
      silently no-ops on fetch failure or missing tier id
- [x] `src/pages/registration.astro`: loads the new script
- [x] `npx astro check` — 0 errors after all changes
- [x] `npx astro build` — succeeds, `/api/availability` bundled as SSR function
- [x] Confirmed live Sheet is cleared (0 rows in `C2:C`) — every tier will
      report full capacity as "remaining" until real registrations come in
- [ ] Manual test: submit a real test registration, confirm the badge count
      drops on next Registration page load
- [ ] Manual test: confirm graceful fallback if `/api/availability` errors
      (e.g. temporarily rename an env var) — static badges should still render

---

## Wrap-up
- [ ] Re-check both items against the live Figma comment thread — reply/resolve
      once shipped
- [ ] Final review pass: confirm nothing else slipped through from this session
