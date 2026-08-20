# Fore Grant — Design System Implementation Roadmap

This is the detailed plan for rebuilding the site against the Figma design
system ("Teeing Off Fore Grant — Design System"), which is now the source of
truth for visual design — see [`../readme.md`](../readme.md#design-system-source-of-truth)
for how the Figma data was pulled and where it lives (`design/figma-file.json`,
gitignored/regenerable).

Referenced from [`../ROADMAP.md`](../ROADMAP.md) Phase 5.

> ## 🚨 RULE: No silent placeholders
> If a Figma design implies behavior that doesn't exist in the backend yet
> (real capacity tracking, live data, an integration, anything), **it must be
> entered in the [Design/Infra Gap Register](#design-infra-gap-register)
> below the moment it's discovered — no exceptions.** Building the visual
> shell of something without its real logic, and not writing that down, is
> the single failure mode this document exists to prevent. A component may
> ship visually "dumb" (static/hardcoded) **only if** its gap-register entry
> is filled out first. Closing Phase 5 does **not** mean the project is done
> if the gap register still has open rows — see Phase 5.6.

---

## Design/Infra Gap Register

**This table is the source of truth for "looks done but isn't."** Every row
is a place where implementing the Figma design produces something that is
visually complete but functionally a placeholder/hardcoded stand-in for real
logic. Nothing gets checked off elsewhere in this roadmap as "done" if it
introduces an unlogged gap here.

| # | Where (component/page) | What's hardcoded/placeholder | What real implementation would require | Status |
|---|---|---|---|---|
| G1 | `Sponsor Tier Card`, `Badge`, `Tier Row` (Availability/Tone = SoldOut/Limited) | Figma defines full visual states for sold-out and limited-availability tiers. Today there is **no capacity tracking at all** — tiers are informational only (see main `ROADMAP.md` Phase 4 "Deferred from original plan"). If these variants are implemented visually without wiring, someone could show a tier as "Available" or "SoldOut" based on nothing, or worse, hardcode a specific tier's status by hand. | Reading current sponsor counts per tier from the Google Sheet (or a maintained counter) server-side, before rendering `Sponsor Tier Card`/`Tier Row`/`Badge`, plus re-checking at submission time (already partially discussed as a race-condition tradeoff in the main readme). | 🔴 Open — must be resolved (either: build real capacity logic, or explicitly hardcode all tiers to "Available" with a `<!-- GAP: see design/ROADMAP.md G1 -->` comment at the exact line, and confirmed with Jess that this is acceptable for launch) |
| G2 | `Register Form — Sponsor` / `Register Form — Golfer` (two Figma frames) | Current site has one merged form. If Phase 5.3 ships only one of the two, or fakes the split visually without real distinct submission logic, that's a silent gap. | A decision (Open Question #1) plus, if split, two distinct `/api/*` handling paths or a shared handler with a form-type field. | 🔴 Open — decision + implementation both pending |
| G3 | `Tournament Day` page — pairings/tee times/order | Figma has a page for this; main `ROADMAP.md` Phase 6 (tournament org) is still an optional stretch goal with no live data source built. If Phase 5.3 builds the static Figma layout for this page, it must **not** be populated with fake/sample pairing data left in place — that is exactly the kind of hardcoded placeholder this rule targets. | Phase 6's full build-out: Sheet-backed data source + read view (see main `ROADMAP.md` Phase 6). | 🔴 Open — page can be built with real static content (schedule, raffle, meals) but pairing/order sections must stay clearly marked "Coming after tournament day" or similar, not populated with placeholder names |
| G4 | *(add rows here as discovered)* | | | |

**Adding a new row:** the moment you notice implementing a Figma frame or
component would require faking data, hardcoding a value that should be
dynamic, or skipping real logic to hit a visual target — stop, add a row here
with enough detail that someone unfamiliar with the moment could understand
the gap, and only then proceed (with a matching inline code comment pointing
back to the row number, e.g. `<!-- GAP: see design/ROADMAP.md G3 -->`).

---

## Current State (pre-redesign)


**Styling:** hand-coded Tailwind v4 `@theme` in `src/styles/global.css` —
one flat set of brand colors (paper, fairway green ×3 shades, ribbon orange
×3 shades, ink ×2), three Google Fonts (Playfair Display, Lobster Two, Lora),
no semantic token layer (components reference raw color names like `bg-ribbon`
directly), no formal spacing/radius scale (ad hoc Tailwind utility values).

**Pages (4, all in `src/pages/`):**
- `index.astro` — hero, "Meet Grant" teaser, sponsorship tiers grid (inline
  data array), map embed
- `about.astro` — "Join the Fight" story content, tournament summary
- `contact.astro` — full sponsor registration form (3 sections), confirm
  modal, result modal, client-side JS (`public/scripts/sponsor-form.js`)
- `404.astro`

**Components:** none extracted — all markup lives inline in page files.
`BaseLayout.astro` provides the shared shell: argyle band strips (CSS
background-image, not a component), header/nav (inline `<nav>`, 3 links),
footer (inline, plain text + links).

**Working functionality that must NOT regress during the rebuild:**
- Sponsor form → `/api/sponsor` → Google Sheets append (`src/lib/sheets.ts`)
- Client-side confirm modal (review before submit) and result modal
  (success/error) — `public/scripts/sponsor-form.js`
- Internal email alert on new submission (Google Apps Script, lives in the
  Sheet itself, not in this repo — see readme note if one gets added there)
- Tier data currently duplicated between `index.astro` and `contact.astro`
  (informational only, no capacity/sold-out enforcement yet — see main
  `ROADMAP.md`'s open scope gap callout)

---

## Target State (per Figma)

**Design tokens** (from `01 Foundations` page in `design/figma-file.json`):

| Category | Values |
|---|---|
| Brand palette | `green #31532D`, `olive #577233` (argyle only), `orange #F05323`, `orange-mid #CD4628`, `rust #A53422`, `cream #E4E1C5`, plus `black`/`white`. `light` (`#F4F3E8`) is derived: cream at 40% over white. |
| Semantic — background | `bg/page` (light), `bg/panel` (cream), `bg/inverse` (green), `bg/overlay` (green @ 55%) |
| Semantic — text | `text/primary` (black), `text/secondary` (black @56%), `text/brand` (green), `text/accent` (rust), `text/on-brand` (white), `text/on-accent` (white), `text/inverse` (cream) |
| Semantic — border | `border/subtle` (green @10%), `border/default` (green @20%), `border/control` (green @64%), `border/focus` (orange-mid) |
| Semantic — brand action | `brand/default` (green), `brand/hover` (`#2A4727`), `brand/active` (`#243D21`), `brand/subtle` (green @8%) |
| Semantic — accent action | `accent/display` (orange), `accent/default` (orange-mid), `accent/hover` (rust), `accent/active` (`#8B2C1D`), `accent/subtle` (orange @14%) |
| Semantic — state | `state/disabled-bg` (green @8%), `state/disabled-text` (black @42%), `state/sold-out` (black @55%), `state/limited` (rust) |
| Argyle | `argyle/dark` (green), `argyle/olive` (olive), `argyle/dot` (orange-mid) |
| Typography | **Bitter** (display/headings/labels/buttons): `display/xl` 80px bold, `display/lg` 56px bold, `display/italic` 40px bold italic, `heading/h1` 48px bold, `heading/h2` 32px bold, `heading/h3` 20px semibold, `label/price` 28px bold, `label/md` 12px semibold, `button/md` 16px semibold. **Source Serif 4** (body): `body/lg` 19px regular, `body/md` 17px regular, `body/md-strong` 17px semibold, `body/sm` 15px regular. |
| Spacing | 8px-based scale: `space/1`–`space/32` = 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128px |
| Radius | `radius/sm` 4px, `radius/md` 8px, `radius/lg` 16px, `radius/xl` 24px, `radius/full` |

**Components** (Figma `COMPONENT_SET`s with real variant props — these map
almost directly to Astro components with prop-driven variants):

| Component | Variant axes |
|---|---|
| `Button` | Variant (Primary/Secondary/Ghost) × Size (Medium/Large) × State (Default/Hover/Active/Disabled/Focus) |
| `Badge` | Tone (Neutral/Limited/SoldOut/Featured) × Reversed (bool) |
| `Sponsor Tier Card` | State (Default/Hover/Featured) × Availability (Available/Limited/SoldOut) — **confirms sold-out/limited states are part of the intended design**, relevant to the open capacity-enforcement scope gap in the main roadmap |
| `Form Field` | Type (Text/Select/Textarea/Upload) × State (Default/Hover/Focus/Filled/Error/Disabled) |
| `Nav` / `Nav Link` | Nav: Variant (Home/Subpage). Nav Link: Tone (Light/Dark) × State (Default/Hover/Active) |
| `Tier Row` | State (Default/Hover/Featured/SoldOut) — a condensed list-row variant of tier display, likely used on the Registration page |
| `Pairing Group` | Layout (Card/Row) × State (Default/Highlighted/Pending) — for the Phase 6 tournament-org stretch goal |
| `Logo` | Full vector wordmark, multiple color variants (White-on-white stage, Negative-on-green stage — for dark nav/subpages) |
| `Argyle Band`, `Footer`, `Social Icon` | Single/simple components |

**Pages** (Figma frames, one per real route):

| Figma page | Maps to route | Notes |
|---|---|---|
| `Home` | `/` | Sections: header band, hero nav, "Meet Grant", "Sponsor CTA", "Last year" (carousel), "Other Ways", "Find Us" (map), footer |
| `Registration` | new `/registration` route | Tier browsing page — likely built from `Sponsor Tier Card` / `Tier Row` components, each with a "Register Now" action |
| `Register Form — Sponsor` / `Register Form — Golfer` | new `/register` (or similar) route | **Two variants** — sponsor registration vs. individual golfer registration are distinct forms in Figma, not one shared form. This is a new distinction not present in the current single `contact.astro` form — needs a decision (see Open Questions) |
| `Tournament Day` | new `/tournament-day` route | Static content (schedule, raffle, auction, meals, contests) per your brain-dump; later gets the live pairing/order section (Phase 6) |
| `Contact` | `/contact` (repurposed) | Now a lighter contact-only page rather than doubling as the registration form, once registration has its own dedicated route |

This confirms the multi-page "browse tiers → dedicated form" structure from
the earlier brain-dump discussion is exactly what Figma already assumes —
including a Sponsor/Golfer form split that wasn't explicitly discussed before.

---

## Open Questions (resolve before/at start of Phase 5 implementation)

1. **Sponsor vs. Golfer registration forms** — Figma has two distinct forms.
   Current site has one combined form (company info + player info together).
   Do we split into two real flows, or keep them merged and treat the two
   Figma frames as visual variants of one form?
2. **Sold-out/Limited states** — Figma's `Sponsor Tier Card` and `Badge`
   components have real `SoldOut`/`Limited` variants baked in. Does this
   redesign become the moment we finally implement real capacity tracking
   (the deferred scope gap from `ROADMAP.md` Phase 4), or do these states
   stay visually present-but-unused for now?
3. **Registration vs. Contact page split** — once tiers get their own
   `/registration` page, should `/contact` become a simple "questions before
   you commit" page (email/phone only), or does it disappear/redirect?
4. **Nav structure** — current nav is 3 links (Sponsor, About Grant, Contact).
   Figma's `Nav` component has Home/Subpage variants and `Nav Link` has
   Light/Dark tones (for the dark-green subpage header vs. light home header)
   — final link set should be confirmed against the "4 lean pages" structure
   (Home, Registration, Tournament Day, Contact).

---

## Phased Plan

### Phase 5.0 — Tokens & primitives
- [ ] Translate the full color/type/spacing/radius token tables above into
      `src/styles/global.css`'s `@theme` block (or CSS custom properties),
      replacing the current flat `paper`/`fairway`/`ribbon`/`ink` palette
- [ ] Add Bitter + Source Serif 4 via Google Fonts `<link>` in
      `BaseLayout.astro`, replacing Playfair Display / Lobster Two / Lora
- [ ] No visual page changes yet — this phase just makes the new vocabulary
      available without touching existing markup
- [ ] Sanity check: existing pages still render (using old utility classes)
      with no build errors after the theme swap

**Done when:** new tokens exist and compile cleanly; old pages still look
like today (classes haven't been swapped yet).

### Phase 5.1 — Core components
- [ ] `src/components/Button.astro` — Variant/Size/State props matching
      Figma's Button variants
- [ ] `src/components/Badge.astro` — Tone/Reversed props
- [ ] `src/components/Nav.astro` + `NavLink.astro` — Variant/Tone/State props
- [ ] `src/components/Logo.astro` — wordmark as inline SVG, color variant prop
- [ ] `src/components/Footer.astro`
- [ ] `src/components/ArgyleBand.astro` (can likely stay CSS-driven like
      today, just re-themed to new argyle tokens)
- [ ] `src/components/SocialIcon.astro`

**Done when:** each component renders in isolation with all its Figma
variants reachable via props, matching Figma visually at both breakpoints.

### Phase 5.2 — Form & card components
- [ ] `src/components/FormField.astro` — Type/State props (Text/Select/
      Textarea/Upload × Default/Hover/Focus/Filled/Error/Disabled)
- [ ] `src/components/SponsorTierCard.astro` — State/Availability props
- [ ] `src/components/TierRow.astro` — State prop
- [ ] `src/components/PairingGroup.astro` — Layout/State props (used later
      in Phase 6, but build now while the design system work is contiguous)
- [ ] Resolve **Open Question #2** (sold-out/limited enforcement) before
      wiring real data into these — at minimum the components should support
      the state even if it's not driven by live capacity logic yet

**Done when:** all remaining Figma components exist as Astro components with
working variant props.

### Phase 5.3 — Page rebuilds
Rebuild page-by-page, each only cut over once its dependent components from
5.1/5.2 exist. Suggested order (lowest-risk first):
- [ ] **Tournament Day** (new page, static content, no dependency on the
      form/tier logic — safest starting point)
- [ ] **Home** — hero, Meet Grant, Sponsor CTA, Last year, Other Ways, Find Us
- [ ] **Registration** (new page) — tier browsing using `SponsorTierCard`/
      `TierRow`, each with a "Register Now" action (resolve Open Question #1
      and #3 before building this)
- [ ] **Register Form** — rebuild `contact.astro`'s form using `FormField`,
      wired to the query-param tier prefill discussed earlier, plus the
      Sponsor/Golfer split per however Open Question #1 is resolved
- [ ] **Contact** — rebuild as its resolved lighter/heavier version per Open
      Question #3

**Done when:** every page uses only new components/tokens, old inline markup
in `index.astro`/`about.astro`/`contact.astro` is fully replaced.

### Phase 5.4 — Behavior migration (no functional regression)
- [ ] Re-wire sponsor form submission (`/api/sponsor` POST) into new
      `FormField`-based markup
- [ ] Re-wire confirm modal + result modal (currently
      `public/scripts/sponsor-form.js`) — update selectors/classes to match
      new component markup, keep the same UX (review-before-submit,
      success/error modal)
- [ ] Re-wire tier data (currently duplicated inline arrays in `index.astro`
      + `contact.astro`) into a single shared `src/data/tiers.ts`, consumed
      by `SponsorTierCard`, `TierRow`, the Registration page, and the confirm
      modal's tier-perks display
- [ ] Verify Google Sheets integration still works end-to-end after the
      rebuild (same test as `ROADMAP.md` Phase 3/4 — submit via dev server,
      confirm row lands in the Sheet)

**Done when:** a real form submission on the rebuilt site still successfully
appends a row to the Google Sheet, and the confirm/result modals still work.

### Phase 5.5 — QA pass
- [ ] Compare every rebuilt page against its Figma frame at desktop width
      (1440px per the Figma spec) and mobile width (390–430px)
- [ ] Confirm nav behaves correctly across Home (light) vs. subpages (dark)
      per the `Nav` component's Home/Subpage variant
- [ ] Re-run through `SECURITY.md` checklist if any new client-side scripts
      were added (CSP `script-src 'self'` — same constraint that pushed
      `sponsor-form.js` into `public/scripts/`)
- [ ] Full manual click-through: Home → Registration → tier "Register Now" →
      prefilled form → submit → confirm modal → result modal

**Done when:** site matches Figma at both breakpoints, all existing
functionality (form, Sheets integration, modals) verified working.

### Phase 5.6 — Gap register closure (mandatory, not optional)

This phase does not exist in the main `ROADMAP.md` summary as its own bullet
by accident — it's the enforcement mechanism for the No Silent Placeholders
rule at the top of this file. **Phase 5 is not complete while this phase has
open items, even if 5.0–5.5 are all checked off.**

- [ ] Walk the entire [Design/Infra Gap Register](#design-infra-gap-register)
      top to bottom
- [ ] For every row still marked 🔴 Open: either (a) build the real
      implementation and close the row, or (b) get explicit sign-off
      (from Jess, or documented here as a deliberate decision) that shipping
      the hardcoded/placeholder version is acceptable for this launch, and
      change status to 🟡 Accepted (with the sign-off noted inline)
- [ ] Confirm no gaps exist in the codebase that are **not** in the register
      — do a final grep for suspicious patterns before calling this done:
      `grep -rn "TODO\|FIXME\|placeholder\|hardcoded\|GAP:" src/` and
      triage every hit — either it's already a tracked row, or it needs one
- [ ] Zero rows may be left silently 🔴 Open with no plan — every row must
      resolve to either 🟢 Closed (built for real) or 🟡 Accepted (explicit,
      documented, sign-off) before this checklist item can be checked

**Done when:** every row in the Gap Register is 🟢 Closed or 🟡 Accepted —
none left 🔴 Open.

---

## Completion Checklist (rollup)

- [ ] 5.0 — Tokens & primitives ported into `global.css`
- [ ] 5.1 — Core components built (Button, Badge, Nav, Logo, Footer, Argyle
      Band, Social Icon)
- [ ] 5.2 — Form & card components built (Form Field, Sponsor Tier Card,
      Tier Row, Pairing Group)
- [ ] 5.3 — All 5 pages rebuilt (Tournament Day, Home, Registration, Register
      Form, Contact)
- [ ] 5.4 — Sponsor form + modals + Sheets integration verified working on
      rebuilt markup
- [ ] 5.5 — QA pass complete at both breakpoints, nav Home/Subpage variants
      confirmed, security checklist re-run
- [ ] **5.6 — Gap register fully closed: zero 🔴 Open rows remaining**
      (see [Design/Infra Gap Register](#design-infra-gap-register))

**Phase 5 done when:** the live site matches the Figma design system across
all pages/breakpoints, with zero regression in existing sponsor-form
functionality, **and** the gap register has no unresolved open rows. A phase
5.0–5.5 checklist that's 100% complete while the gap register still has 🔴
Open rows is **not** a complete Phase 5 — that combination specifically is
the scenario this document exists to prevent.

