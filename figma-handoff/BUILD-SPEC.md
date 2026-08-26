# Fore Grant — build spec

**For:** Trevor · **Date:** 2026-08-25
**Stack:** Next.js · React · Tailwind v4 · tokens from `tokens.css`

---

## 1. Tokenization status — done

| | Bound to a style | Notes |
|---|---|---|
| Page text (7 desktop + 7 mobile frames) | **923 / 930 (99%)** | 7 unbound are deliberate inline-emphasis nodes |
| Component library | **475 / 519 (92%)** | the 44 remaining are **sheet annotations** — "DEFAULT", "HOVER" labels on the spec sheets. Not product UI, never implemented |
| Colour, spacing, radius, motion | 100% | every surface binds to a variable; 0 hardcoded |

**Type ramp:** 31 desktop styles (26 mirrored into `tailwind.css`; 5 legacy steps unused) + 24 mobile styles. Names are identical in Figma and Tailwind —
`heading/section` ↔ `text-heading-section`, `mobile/heading/section` ↔ `text-mobile-heading-section`.

**Line heights are set** — 46 `--text-*--line-height` pairs in `tailwind.css`, as unitless
ratios so they survive a size change. Display sets tight (1.05), body sets open (1.60), and
bullet markers deliberately take *body* leading so they sit on the text baseline.

---

## 2. Figma variants ≠ code components

This is the most useful number in the doc. Figma variants multiply **props × CSS pseudo-states**;
code doesn't. Hover, focus and disabled are *selectors*, not props.

| Component | Figma variants | Actual code surface |
|---|---|---|
| Button | 30 | **1 component**, `variant` (3) × `size` (2). Hover/active/focus/disabled are CSS |
| Form Field | 24 | **4 components** (text, select, textarea, upload) + an `error` prop |
| Nav Link | 8 | **1 component**, `tone` prop. Default/hover/active are CSS |
| Badge | 8 | **1 component**, `tone` (4) × `reversed` |
| Tier Row | 9 | **1 component** + `featured` and `open` booleans. Hover and sold-out are CSS + a data attribute |
| Argyle Band | 3 | **1 component**, `size` prop |
| Nav | 4 | **2 components** — desktop hero + desktop subpage. On mobile ALL pages share one bar (Home hides its logo) and the hamburger opens the `Menu — 390` overlay |
| Footer | 2 | **1 component**, responsive |

**~15 components total.** Not 100 variants.

---

## 3. Where each thing comes from

The rule: **take a library for behaviour, build it yourself for identity.**
Visual customness is not the axis — a bespoke-looking row is an afternoon; an accessible select
is weeks.

### Use shadcn / a library

| What | Why |
|---|---|
| **Select** (Form Field `Type=Select`) | Radix. Keyboard nav, typeahead, focus return, viewport-edge positioning, ARIA. The single biggest hand-rolling trap here |
| **Form validation** — both register forms | `react-hook-form` + `zod` via shadcn Form. Wires errors to `aria-describedby` correctly |
| **Carousel** (Home, `Last year`) | shadcn Carousel is Embla. Our 3-up prev/active/next with a counter is well within it; mobile collapses to one slide |
| **File dropzone** (Form Field `Type=Upload`) | `react-dropzone` — *not* shadcn. Drag state, keyboard access, type rejection |
| Input / Textarea / Label | Thin wrappers. Take them for consistency; low stakes either way |

### Build with Tailwind utilities + our tokens

Button · Badge · Nav · Nav Link · Footer · Tier Row · Pairing/group cards · Groups table ·
Sponsor ticker layout · page sections · Form Field *wrapper* (label / helper / error — use the
library only for the control inside)

These carry the brand. A library fights you here.

### Genuinely needs custom CSS

**Revised 2026-08-26 — Kyle: don't rebuild anything shadcn already does.** The mobile tier
accordion and the `View all 18 holes` disclosure are both **shadcn Accordion (Radix) with our
tokens**, not hand-built. That gives `aria-expanded`, `aria-controls`, independent open state and
focus handling for free. Button and Badge are shadcn too, restyled.

The genuinely custom list is four things: the argyle band, the nav underline yield, the footer
layout, and the Groups table. Everything else is a primitive plus tokens.

1. **Argyle band** — three offset vector layers, clipped, bleeding off **both** edges. Ship as
   inline SVG or a `background-image` with `background-position` and `background-repeat: repeat-x`.
   *Do not scale it* — a narrower band must **crop**, never squash. (In Figma the vectors were
   constrained STRETCH and turned to slivers at 390; they're pinned MIN now.)
2. **Sponsor ticker marquee** — `@keyframes` translate, pause on hover, and the edge fades are a
   `mask-image: linear-gradient(...)`. Utilities can't express any of it.
3. **Nav underline yield** — `.nav:hover .nav-link[aria-current="page"]:not(:hover)`. Tailwind
   *can* express this with `group-hover` plus a `hover:` override, but it reads like noise.
   Already written in `components.css`.

   *(There used to be a fourth — a tier-row yield. It is gone: the featured row is no longer dark
   at rest, so there is nothing to lighten. Every row looks the same until hovered.)*

Hover lift (`translateY(-2px)`) is **not** on this list — `hover:-translate-y-0.5` is fine.

---

## 4. shadcn conflicts to override on day one

Adopting the kit means adopting its defaults, and several contradict decisions already made:

| shadcn default | Our rule |
|---|---|
| `shadow-sm` on cards, buttons, popovers | **No shadows anywhere.** Hover is a 2px lift |
| Its own neutral palette | Closed palette — never `slate-*`, `zinc-*` |
| Generic focus ring | `--color-line-focus`, 2px, 2px offset |
| Its radius scale | Map to `--radius-*` |
| `--input` = `--border` | Form controls need **3:1** (`line-control`); decorative borders are 1.37:1. **Keep separate** |

Mapping lives in `tailwind.css`. The failure mode is silent drift — a `shadow-sm` returning on a
package update. Put it in code review.

---

## 5. Dead components — already removed

`Sponsor Tier Card` (9 variants) and `Pairing Group` (6 variants) both had **0 instances** and
have been deleted from the file, along with a duplicate `label/price` text style. Nothing in the
library is unused — every component you see is referenced by a page.

---

## 5b. Carousel

28 images, ordered. **Slide 01 / default is
`587765888_17906025711272153_8898890657147230087_n.jpg`.**

The filename prefix carries the running order — Instagram filenames do not, so the files must
be numbered `01-…` through `28-…` before build. The counter renders `position / 28`.

Desktop shows prev / active / next three-up; mobile shows the active slide only, full width.
Four of the source photos are portrait and centre-crop in the 3:2 frame — reviewed and accepted.

## 5c. Tier row accordion (mobile only)

Below 768 each tier collapses to **name + price + availability** (142px) and expands on tap to
reveal benefits and Register Now (425px). Above 768 every row is open and the toggle is inert.

The whole eight-tier ladder goes from ~3,400px to ~1,250px — it fits in about two screens, so a
visitor can compare options instead of scrolling past them.

- **Every row ships collapsed.** The Figma frame shows them expanded so the content can be
  proofed — that is a review convenience, not the first-paint state. See the NOTE beside the frame
- Rows open **independently** — opening one must not close another
- **Sold out never expands** and carries **no chevron**
- Height animates `grid-template-rows: 0fr → 1fr`, never a fixed `max-height` — benefit lists
  run 2 to 6 items and any fixed height clips the long ones
- `aria-expanded` on the button, `aria-controls` → the panel, kept in sync with `data-open`

Full markup and CSS in `components.css`. Visual spec: the **ACCORDION BEHAVIOUR** panel on the
Tier Row page shows all four states labelled in order.

**This supersedes the older "card is not a link" rule.** The header is now a control that
toggles, and Register Now is a separate action inside the panel — two targets at different
levels, so the hover conflict that rule guarded against no longer arises.

## 6. Responsive

One breakpoint: **768**. Below it, mobile frames at 390.

- Type: `text-mobile-*` below 768, `md:text-*` above. **Display shrinks, body does not** — body
  stays 16px because the day-of use case is reading outdoors in sunlight
- Section rhythm: `--section-y` 80 → 40, `--section-x` 64 → 20
- Container: 1312 → fluid with 20px gutters
- Collapses: Groups table stacks (hole chip, then group A, then group B) · form rows single-column ·
  carousel one slide · nav becomes ONE 72px hamburger bar on every page including Home, with the
  logo hidden on Home only · footer columns stack
- The hamburger opens a full-screen overlay: Home · Tournament Day · Contact, plus Register Today
  as the orange button. Toggle and close are 44×44 hit targets

**Auto-layout direction cannot be overridden on a Figma instance**, which is why `Footer — Mobile`
and `Tier Row Device=Mobile` exist as separate components. In CSS this is just a media query —
that constraint is Figma's, not yours.

---

## 7. Suggested order

1. `tokens.css` → `tailwind.css` → `shadcn-adapter.css`; strip shadows, map radii, split `--input`
2. Primitives: Button, Badge, Nav Link
3. Layout: Nav (both), Footer, Argyle band, page sections
4. Content: Tier Row, Form Field wrapper, Groups table
5. Library-backed: Select, upload, carousel, form validation
6. The four custom-CSS pieces last — they're isolated and easy to get wrong early

---

## 8. Confirmation page

Added 2026-08-25. Desktop `306:2117`, mobile `308:2214`. Both register forms submit to it.

The package block is a **Tier Row instance with the availability badge and the Register Now CTA
hidden** — the visitor sees what they chose in the same component they chose it from. Populate it
from the tier carried through the form. Benefit lines come from `tiers.json`; surplus rows hide
rather than delete, same as everywhere else.

Below it, `What happens next` — three steps, three columns at desktop, stacked at mobile.
Copy reflects **offline payment**: an invoice follows, no payment is taken on the site.

Confirmation is not a nav destination, so its nav carries no active state.
