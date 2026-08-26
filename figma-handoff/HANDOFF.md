# Fore Grant — design → dev handoff

**Audience:** Trevor (build), Kyle (design). **Date:** 2026-08-25
**Figma:** https://www.figma.com/design/6qiOahJwM68SdswOurWwxL
**Supersedes** the 2026-08-21 version, whose headline blocker is resolved.

---

## TL;DR

The August 21 handoff opened with "type is the one system that was never tokenized — 478 text
nodes, zero bound." **That is fixed.** 1,011 of 1,018 page text nodes are bound to a named style,
and the seven that aren't carry deliberate inline emphasis. The reason Trevor was pulling raw
REST JSON no longer exists.

What's left is not design work. It's **wiring, content, and deployment** — and most of it is
already decided.

---

## 1. What changed since 21 August

| Then | Now |
|---|---|
| 0 / 478 text nodes bound | **1,011 / 1,018** bound; 55 text styles (31 desktop + 24 `mobile/`) |
| Every frame 1440 | **14 page frames** — 7 desktop + 7 mobile at 390, plus the menu overlay |
| No confirmation state | **Confirmation page**, desktop + mobile, all four submits wired |
| Form backend unknown | **Google Sheets**, two-way — see §3 |
| Payment unknown | **Offline only** — no Stripe, no PCI scope |
| 55 prototype links | **197**, mobile included and verified |
| No mobile navigation | **`Menu — 390` overlay** on every mobile page |

---

## 2. How to receive this — no MCP, no Dev Mode

**Decided 2026-08-26: this handoff assumes you will not run an MCP server and will not buy a Dev
seat.** Everything you need is a file in this repo. Figma is a *picture* to look at; the numbers
live here.

| What you need | Where it is |
|---|---|
| Colour, spacing, radius, motion | `tokens.css` → `tailwind.css` (`@theme`) |
| Type ramp — 55 styles, sizes, line heights, **tracking** | `tailwind.css` |
| shadcn wiring | `shadcn-adapter.css` |
| Interaction contracts that utilities express badly | `components.css` |
| **Per-page, per-section measurements and tokens** | **`LAYOUT-SPEC.md`** |
| Component inventory → actual code surface | `BUILD-SPEC.md` §2 |
| Tier data, form fields | `data/tiers.json`, `data/forms.json` |
| Confirmation email | `EMAIL-SPEC.md` |
| Follow-up emails | `data/email-sequence.md` |
| Node IDs, if you do open Figma | `ds-state.json` → `entities` |

**`LAYOUT-SPEC.md` is the one that replaces Dev Mode.** Every section on every page with its
padding, gap, direction, width, background token and text style, desktop and mobile. Read against
the Figma view and you should never need to measure anything.

**Do not pull the REST API.** It returns absolute coordinates and literal hex with no semantics —
that is what caused the original handoff problem. Everything it would tell you is already in
`LAYOUT-SPEC.md`, in token names instead of numbers.

---

## 3. Backend — already built

**Kyle, 2026-08-25:** Trevor already has a Google API built and tested.

- Both register forms **post submissions to a Google Sheet**
- The **same sheet, on a different tab, writes back to the Tournament Day groups page**

Intake and day-of pairings are **one mechanism, not two**. Nothing here needs designing or
choosing — it exists and works. What the design side needs from it:

- The tier the visitor chose must survive Registration → Register Form → Confirmation
- Group/pairing rows render into the Groups table on Tournament Day, which is hand-built from
  plain frames and is the single source (no component duplicates it)

**Payment is offline only.** No payment is taken on the site. The form captures the commitment
and the intended payment type; an invoice follows. `Payment type *` is required on both forms —
verified consistent, the old asterisk-mismatch note in the previous handoff was stale.

**Tier availability stays in `data/tiers.json`** — edited by hand, live on redeploy. It is *not*
in the sheet. The sheet does form intake and day-of pairings; availability is a campaign-speed
number, not a live count, and `tiers.json` already says so. Moving it into the sheet is a V2
conversation, not a build-time question.

---

## 4. Pages

Seven routes. All fourteen frames sit on `00 — REVIEW (start here)`, desktop at y=0 and mobile at
y=5200, left to right in journey order.

| Route | Desktop | Mobile |
|---|---|---|
| Home | `45:3` | `215:3142` |
| Registration | `52:3` | `213:2219` |
| Register Form — Sponsor | `78:3` | `214:1584` |
| Register Form — Golfer | `80:188` | `214:1809` |
| **Confirmation** | `306:2117` | `308:2214` |
| **Player Roster** | `329:3060` | `330:3153` |
| Tournament Day | `61:3` | `211:2279` |
| Contact | `70:3` | `208:1142` |

**Player Roster is not in the nav and must not be.** It is reached only by a link in the email
thread ~4 weeks out. Its submit is an **inline success state, not a new route.**

Plus `Menu — 390` (`302:2090`), the mobile nav overlay, and **`Registration Confirmation — 600`**
(`320:2249`) on page `05 — EMAIL` — the branded HTML confirmation email the Google API sends.
**Read the NOTE frame beside it (`323:2273`) before building the email** — email HTML breaks most
of this system's assumptions and the note lists every one, including the two alpha tokens that
must ship flattened.

**Confirmation** repeats the chosen package as a **Tier Row instance with the availability badge
and Register Now hidden** — same component the visitor picked it from. Populate it from the tier
carried through the form. It is not a nav destination, so its nav carries no active state.

---

## 5. Prototype — 197 reactions

Two flow starting points, desktop Home and Home — 390. Everything is wired except self-links,
which Figma rejects.

**Type carries its tracking.** All 9 non-zero Figma tracking values are mirrored as
`--text-*--letter-spacing` pairs, so a `text-display-lg` utility carries `-0.026em` on its own.
That value is on every page title; without it, built headings read visibly looser than the design.

**A Reaction carries two action fields.** The deprecated `action` and the authoritative
`actions[]`. Writing only `action` succeeds, reports success, and changes nothing — nine
"repointed" mobile links were still on desktop frames until they were read back and verified.
If you script against this file, write both and verify by resolving destination names.

**Footer Pages links are wired** as of 2026-08-25 — 36 links across 14 footer instances, desktop
to desktop and mobile to 390, self-links skipped. Each keeps its hover state alongside the click.

---

## 6. Responsive

One breakpoint: **768**. Below it, the 390 frames.

- Type: `text-mobile-*` below 768, `md:text-*` above. **Display shrinks, body does not** — body
  stays 16px because the day-of use case is reading outdoors in sunlight
- Section rhythm: `--section-y` 80 → 40, `--section-x` 64 → 20
- Container: 1312 → fluid with 20px gutters
- Collapses: form rows single-column · carousel one slide · footer columns stack
- **Groups ships collapsed.** Name lookup → the matched group as one card, then `View all 18 holes`
  to expand. The full table exists hidden, not deleted. Page went 8,941px → 3,901px
- **Desktop tier rows stay expanded** — the accordion is mobile-only
- **Nav becomes one 72px bar on every page including Home**, hamburger right. **Home hides the
  bar's logo** (the badge sits directly below); every other page keeps it
- The hamburger opens `Menu — 390`: Home · Tournament Day · Contact, with Register Today as the
  orange button, not a row. Toggle and close are 44×44 hit targets

**Auto-layout direction cannot be overridden on a Figma instance**, which is why `Footer — Mobile`
and `Tier Row Device=Mobile` exist as separate components. In CSS that's just a media query —
the constraint is Figma's, not yours.

---

## 7. Library vs custom — take as much as you can

**Revised 2026-08-26 on Kyle's instruction: don't rebuild anything that shadcn already does.**
The design system is tokens and skin. Almost every behaviour has a Radix primitive underneath it.

**Take shadcn, restyle with our tokens:**

| Component | Use it for |
|---|---|
| **Accordion** (Radix) | **The mobile tier rows** *and* the `View all 18 holes` disclosure. Gives `aria-expanded`, `aria-controls`, independent open state and focus handling for free — all four things the spec asks for |
| **Select** (Radix) | Sponsor tier, payment type. The single biggest hand-rolling trap |
| **Form** + `react-hook-form` + `zod` | Both register forms and the roster form |
| **Button**, **Badge** | Take them. Strip the shadow, map radius and palette — see §8 |
| **Input**, **Textarea**, **Label** | Thin wrappers, low stakes |
| **Carousel** (Embla) | Home "Last year", 3-up desktop / 1-up mobile |
| `react-dropzone` | Logo upload — not shadcn, but don't hand-roll drag state |

**Genuinely custom — four things, and only four:**

1. **Argyle band** — a CSS background, ~15 lines. Crop, never squash
2. **Nav + Nav Link** — the underline yield is a selector, not a component
3. **Footer** — plain responsive layout
4. **Groups table** — a table with a filter input over sheet data

**Tier Row is a skin over shadcn Accordion**, not a from-scratch component. Same for the Groups
disclosure. That is the whole "custom" list — everything else is a primitive plus our tokens.

**Genuinely needs custom CSS — two things for v1:**

1. **Argyle band** — three offset vector layers, clipped, bleeding off both edges. Inline SVG or
   `background-repeat: repeat-x`. **Do not scale it** — a narrower band must *crop*, never squash
2. **Nav underline yield** — `.nav:hover .nav-link[aria-current="page"]:not(:hover)`

*(The sponsor ticker marquee was the third. It is **V2 — do not build it for launch.** The
section ships hidden.)*

Hover lift is **not** on that list — `hover:-translate-y-0.5` is fine.

---

## 8. shadcn conflicts — override on day one

| shadcn default | Our rule |
|---|---|
| `shadow-sm` on cards, buttons, popovers | **No shadows anywhere.** Hover is a 2px lift |
| Its own neutral palette | Closed palette — never `slate-*`, `zinc-*` |
| Generic focus ring | `--color-border-focus`, 2px, 2px offset |
| Its radius scale | Map to `--radius-*` |
| `--input` = `--border` | Form controls need **3:1** (`border/control`); decorative borders are 1.37:1. **Keep separate** |

The failure mode is silent drift — a `shadow-sm` returning on a package update. Put it in code review.

---

## 9. Two behaviours that cannot be prototyped

Figma can't express "hover A, change B." QA these in a browser:

1. **Nav underline yield** — the current page is underlined at rest; hovering a *different* item
   drops that underline so only one is on screen. Colour is deliberately kept
2. **Tier row accordion** — height animates `grid-template-rows: 0fr → 1fr`, never a fixed
   `max-height`; benefit lists run 2 to 6 items and any fixed height clips the long ones

*(The old "tier row yield" is gone — the featured row is no longer dark at rest, so there is
nothing to lighten. Every row looks the same until hovered; featured is marked by its orange edge
alone. `FeaturedMuted` was deleted.)*

**The Figma Registration frames show tier rows EXPANDED on purpose** — it's the only view where
all eight tiers' copy, prices and benefit lists can be proofed at once. **Ship them collapsed.**
Rows open independently; sold out never expands and carries no chevron.

---

## 9b. Two build-time conditionals

Neither is a Figma variant. Both are logic:

1. **Hide the player-name block when the tier includes no golfers.** A Tee Sign Sponsor ($250,
   "Signage only") currently sees Player 2/3/4 fields. Drive it off `includes` in
   `data/tiers.json` — if the tier includes no players, drop the block.
2. **Confirmation and Player Roster carry `noindex`.** The confirmation page shows a named
   individual's Venmo handle and payment details; it should never appear in a search result.

---

## 10. Netlify — what's needed to deploy

A placeholder Next.js site exists at `fore-grant.netlify.app`. It is **backend scaffolding only,
not a design source.**

**Settled:**
- Stack: Next.js → React → Tailwind v4 + shadcn, tokens one-directional from `tokens.css`
- Form target: Google Sheets via Trevor's existing API
- No payment processing, so no Stripe keys, no webhook, no PCI surface
- Map: keyless `google.com/maps?q=…&output=embed`, coords `33.0022215, -116.8058419`

**Still needed before a production deploy — mostly answers, not work:**

| | Item |
|---|---|
| ⏸ | **Custom domain** — parked by Kyle ("ignore social for now"), so the "link in bio" CTAs stand. Revisit before the campaign starts |
| ⬜ | **Google API credentials** as Netlify env vars — service account JSON and sheet ID, never committed |
| ⬜ | **Notification address** for new submissions (the registrant's own confirmation email is designed — see `05 — EMAIL`) |
| ⬜ | **Repo + Netlify ownership** — this working directory is not a git repo; who owns the account and who can deploy |
| ⬜ | **`og:image`, favicon, page titles, meta descriptions** — none designed. The social set on `04 — SOCIAL` is a natural `og:image` source |
| ✅ | **Sponsor ticker — V2, do not build.** Kyle, 2026-08-25: the ribbon stays hidden until well after launch; real logos must exist first. It is fully designed and stays in the file at `visible=false`. **This removes the marquee from the custom-CSS list for v1** — see §7 |
| ✅ | **San Vicente mark — done.** `assets/logos/SanV_IMG.png`, Kyle's Photoshop recreation: 812×526, transparent, green `#42A649` / blue `#16548B`. In the repo and placed on both breakpoints |
| ⬜ | **Venue URL** for the logo under the Home map — still to confirm, do not invent one |

---

## 11. Suggested order

**Trevor, now:**
1. `tokens.css` → `tailwind.css` → `shadcn-adapter.css`; strip shadows, map radii, split `--input`
2. Primitives: Button, Badge, Nav Link
3. Layout: Nav (desktop + mobile bar + overlay), Footer, Argyle band, page sections
4. Content: Tier Row + accordion, Form Field wrapper, Groups table
5. Library-backed: Select, upload, carousel, form validation
6. Wire the Google Sheets API at both ends — form in, pairings out
7. The three custom-CSS pieces last — isolated and easy to get wrong early

**Kyle, in parallel:** chase the sponsor logos and the official San Vicente asset. They are the
only true launch blockers, and both depend on other people.
