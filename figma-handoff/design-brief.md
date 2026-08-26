# Teeing Off Fore Grant — Design Brief

**Event:** Friday, November 6th 2026 · 9:00AM shotgun start
**Venue:** San Vicente Golf Course, 24157 San Vicente Rd, Ramona, CA 92065
**Contact:** grantstallbattle@gmail.com · Jessica 619-344-7687
**Cause:** Grant, 10, battling leukemia. #GrantsTALLBattle
**Product:** Marketing site · Light-first · Plain CSS custom properties
**Date:** 2026-08-19 · **Status:** Phase 0 — extraction complete, awaiting confirmation

## Purpose

Digital hub for the tournament. Two modes that trade places as November approaches:
**convert** (register, sponsor, explain the cause) then **inform** (schedule, pairings,
contests, meals — read on a phone, outdoors, in sunlight).

## Direction

Fixed. The 2026 flyer is the source of truth and the look carries forward. This is a
systematization job, not a design-direction job: turn a flyer into a ramp, a scale, and a
set of states. None of the seven archetypes apply — this is its own thing, closest to a
warm collegiate/sporting identity: bone ground, deep forest green, one hot orange, serif
throughout, flat tinted panels, argyle as signature motif.

### Palette — official brand swatches (authoritative)

| Role | Hex | CMYK | Notes |
|---|---|---|---|
| `brand/green` | **#31532D** | 77 43 92 42 | primary |
| `brand/rust` | **#A53422** | 24 91 100 18 | deepest orange — pressed/active states |
| `brand/orange-mid` | **#CD4628** | 14 87 100 4 (spot) | crosshatch, hover |
| `brand/orange` | **#F05323** | 0 83 100 0 (spot) | **the accent** — CTAs, headings |
| `brand/cream` | **#E4E1C5** | 11 7 24 0 (spot) | see discrepancy #4 |
| `brand/olive` | **#587333** | 67 36 100 21 | argyle second green — official as of 2026-08-20 |

### Four discrepancies needing a call

1. **Green** — swatch card `#31532D`, Diamond.svg `#32522D`, flyer artwork `#31522D`. Three
   values within 1–2 points. Recommend the swatch card as canonical.
2. **Orange-mid** — swatch card `#CD4628`, Diamond.svg `#CC4527`. Same story.
3. ~~Olive~~ — **resolved: official, added to the swatch card**
4. **Cream `#E4E1C5` is not the flyer's page background.** The flyer ground samples at
   `#F2F2E8` — noticeably lighter and cooler. `#E4E1C5` is roughly a 45% relationship but
   not a clean tint, so one of them is the page colour and the other is something else.
   **This is the one that actually changes how the site looks.**

### Derived neutral ramp

The flyer's panel fill is **brand green at 5.2% over the ground** — consistent to three
decimals on all three channels. That's a system, not a coincidence, so the ramp extends it:

| Token | Value | |
|---|---|---|
| `bg/page` | `#F2F2E8` | ground |
| `bg/panel` | `#E8EADF` | 5% green — matches the flyer's info panels |
| `bg/panel-2` | `#DFE2D5` | 10% |
| `border/subtle` | `#D5DACC` | 15% |
| `border/default` | `#C8CFBF` | 22% |
| `border/strong` | `#B8C2B0` | 30% |

### Type — confirmed

**Bitter** for headings and display italic, **Source Serif 4** for body. Wordmark ships as
vector from the logo pack. Comps: https://claude.ai/code/artifact/f5af3f28-11cf-4b47-891d-fb79c7c76c8d

### Argyle — rebuilt as a tiling pattern

Source `Diamond.svg` is 49KB of hand-placed geometry — 23 rotated rects plus 92 clipped
dotted lines. Rebuilt as a **1.8KB repeating tile** (`assets/argyle-tile.svg`, `assets/argyle.css`).

- Repeat unit **46.9 × 48.735** — one dark diamond plus one olive, meeting point-to-point
- Crosshatch is 45° dotted lines, `stroke-width 1.297`, `stroke-dasharray 0 2.767`, round caps
- `background-size: auto 100%` + `repeat-x` — scales to any band height, repeats to any width
- Three variants: `--full`, `--plain` (no crosshatch), `--mono` (single colour, for tinted panels)

**Sizing rule.** On the flyer the band is 8.7% of layout width (143px on a 1650px layout).
`height: clamp(28px, 5.2vw, 88px)` keeps that proportion without letting it dominate a wide
desktop header. **Below a 48px band the crosshatch dots fall under 1px** and read as mud —
use `--plain` at those sizes.

### Argyle placement — V1 proposal

Two uses only, matching the flyer:

- **Header band** — full-bleed at the very top of every page, above the nav
- **Footer band** — full-bleed at the very bottom, below all footer content

The flyer uses it exactly twice, and that restraint is why it reads as structure rather than
decoration. Holding the card-edge accent and hero backdrop for V2.


## Architecture

**Four pages, confirmed.** Trevor's single-page build is a backend placeholder — all
structure, UI/UX and CSS come from Kyle. Treat it as context for where this lands, not as a
design input.

| Page | Job | Key components | Built? |
|---|---|---|---|
| **Home** | Sell the event, explain the cause | Logo-as-hero (no block nav), argyle band, date panel, Meet Grant, sponsor logo cloud, CTA band, footer | design from scratch |
| **Registration** | Convert | Tier cards ×8 with **availability states**, benefit lists, Register CTA, inline form, FAQ | design from scratch |
| **Tournament Day** | Inform | Schedule timeline, info cards (raffle, auction, meals, contests), **pairings table**, "not yet published" states | **no** |
| **Contact** | Answer | Dark nav, director card, email/phone, course address + directions | design from scratch |

## Registration tiers — 8 total (near-final copy, 2026-08-20)

| Tier | Price | Cap | Includes entry |
|---|---|---|---|
| Orange Ribbon Champion | $5,000+ | 2 | 2 foursomes + 10 tickets |
| "19th Hole" Lunch Sponsor | **$2,000** *(was $3,500)* | 2 | 1 foursome *(was 2)* |
| "Pre-Round Fuel" Breakfast Sponsor | **$1,750** *(was $2,000)* | 2 | 1 foursome |
| Premium Adopt-A-Hole (Contest Holes) | $1,750 | 2 | 1 foursome |
| Adopt-a-Hole | $1,500 | 9 | 1 foursome |
| Putting for a Cure | $1,000 | 1 | 1 foursome |
| Tee Sign | $250 | 5 | — |
| Group Package / Foursome Entry | $600 | — | 4 players |

**The event serves breakfast and lunch — no dinner.** Two stale `dinner` references were found and
**Kyle approved replacing both with "lunch"** (2026-08-20). Build the site with the corrected copy:

1. **Breakfast Sponsor** — "Acknowledgment during awards and **lunch** program"
2. **"19th Hole" Lunch Sponsor** — "Premier recognition as the sponsor of the tournament **lunch**"

The source flyer still carries the old wording — worth fixing there before it goes to print.


## Component scope

**Tier 1:** Button (primary/secondary/ghost × 3 sizes × 6 states) · Link · Badge (cap +
availability) · Input / Select / Textarea (the form is built in) · Divider · Icon

**Tier 2:** Tier card (with availability states) · Info card · Accordion · Modal ·
Alert banner (weather / date changes) · Skeleton

**Tier 3 — day-of:** Pairings table, mobile-first · Schedule timeline · Countdown ·
"Not yet published" empty state

**Tier 4 — blocks:** Hero · Argyle divider · Ribbon banner · Sponsor logo cloud ·
Tier card grid · CTA band · Footer · Photo grid

*Out: sidebars, dashboards, pagination, auth, dark mode.*

## Assets

| Asset | Status |
|---|---|
| 2026 flyer | ✅ read |
| Logo pack | ⚠️ PDF/PNG/EPS/JPEG has 4 lockups × Badge+White = 8 files. **The SVG folder has only 3.** Missing as SVG: Event Logo–White, Team Grant–Badge, Team Grant–White, Shirt Front–Badge, Shirt Front–White. |
| Logo colour drift | ✅ fixed — every logo SVG shipped 5 off-canonical hexes (`#32522D`/`#A53523`/`#CC4627`/`#E3E0C4`/`#F05423`). Normalised to the swatch card in `assets/logos/`. |
| Event Logo in Figma | ✅ imported as 12 live vectors, fills verified as exactly `#31532D` / `#F05323` / `#E4E1C5` |
| Live site | ✅ harvested |
| Argyle pattern | ✅ rebuilt as a 1.8KB tiling SVG from Diamond.svg |
| Ribbon device | ❌ needed — currently plain text |
| Sponsor logos | ❌ needed for the logo cloud |
| Photography | ❌ first year, so none — plan for an illustration/pattern fallback |

## Open decisions

1. ~~Four pages~~ — **confirmed, four pages**
2. ~~Wordmark~~ — **confirmed, all logo marks from the vector pack**
3. ~~Heading + body serif~~ — **confirmed: Bitter + Source Serif 4**
4. ~~Argyle~~ — **confirmed: dynamic pattern, header + footer bands**
6. Canonical hexes — four discrepancies above
5. Sponsor tier copy errors (see below) — fix before the site repeats them

## Content bugs found in the source

These are in **both** the flyer and the live site, so they'd ship:

- **"Pre-Round Fuel" Breakfast Sponsor ($2,000)** — benefits read "sponsor of the tournament
  **lunch**" and "Logo featured on **lunch** signage." Should say breakfast.
- **"19th Hole" Lunch Sponsor ($3,500)** — benefits read "sponsor of the tournament
  **dinner**" and "**dinner** signage." Either the title or the benefits are wrong. "19th
  hole" conventionally means post-round, and it's priced above breakfast, so the title may
  be the error rather than the benefits.


## Phase 1 — complete (2026-08-19)

Figma: https://www.figma.com/design/6qiOahJwM68SdswOurWwxL

- **Primitives** (24) — ramps, scoped to `[]` so they cannot be bound directly
- **Scale** (26) — spacing, radius, borders, control sizes, argyle bounds
- **Semantic** (34) — 33 true aliases + `bg/overlay` (alpha, intentionally raw)
- **Text styles** (13) — Bitter display/headings, Source Serif 4 body
- `tokens.css` — 96 custom properties, names identical to the Figma tree

All 22 contrast gates pass. Fixed before shipping: SOLD OUT was 3.07:1, form-control
borders were 1.37:1, disabled text was 2.55:1.


## Resolved 2026-08-20

- **Olive is official** — `#587333` (C67 M36 Y100 K21), now on the swatch card. Note my sampled
  value was `#577233`, off by one on two channels; the card wins, as with the logos.
- **No dark mode.** A negative sub-mark (`ForeGrant_neg.svg`, white + orange) is supplied for the
  dark nav on subpages. Normalised and imported as `Fore Grant — Negative`.
- **Copy is near-final** — see the tier table above for the two remaining `dinner` references.

## Page layout direction (from Kyle)

- **Home has no traditional block nav.** The logo is the main image, with the nav page buttons
  centred beneath/around it at the top.
- **Subpages get a dark nav** using the negative mark.
- **Confirmed: four pages** — Home plus three subpages: Registration, Tournament Day, Contact.
  Each subpage gets its own page and the dark green nav. Nav carries three destinations.


## Contrast rule discovered 2026-08-20 — no orange on green

None of the three oranges is legible as text on the brand green:

| | on `#31532D` | verdict |
|---|---|---|
| `accent/display` #F05323 | 2.48:1 | fails even the 3:1 large-text bar |
| `accent/default` #CD4628 | 1.87:1 | fails |
| `accent/hover` #A53422 | 1.29:1 | fails badly |
| `text/inverse` #E4E1C5 | 6.60:1 | use this |
| `bg/page` #F4F3E8 | 7.83:1 | or this |

**On the green ground, orange is for non-text graphics only** — the ribbon inside the logo,
fills, decorative rules. Every label, link and underline uses cream. This is recorded on the
three accent variables in Figma so it surfaces at the point of use.


## Orange as structure (2026-08-20)

Orange cannot be read as text on the brand green, but it works as a graphic. It now does three
structural jobs, which gives the dark register its accent back:

1. **Vertical dividers** between the three footer sections — 2px `accent/display`
2. **Leader lines** above each footer section header — 48 × 3px
3. **Active-page underline** in the nav — 4px, against hover's 2px cream

For (3): orange is 2.48:1 on green, so it can never be the only signal. Active is also carried by
brighter text (`bg/page` vs `text/inverse`) and by rule weight, so the state still reads if the
colour is not perceived. Orange is reinforcement, not the mechanism.


## Home page — wireframe received 2026-08-20

Section order:
1. **Hero** — logo as the main image, three nav buttons centred beneath
2. **Meet Grant** — photo left, story card right
3. **Sponsor CTA** — full width, the primary action
4. **"Last year was a hit!"** — image carousel of last year's tournament, centre slide emphasised
5. **Other Ways to Support Us!** — orange-outlined box, matching the flyer's Meet Grant treatment
6. **Find Us at San Vicente Golf Course** — map embed + directions link
7. **Footer**

### Copy change
**Grant is 11, not 10.** The 2026 flyer still says "10-year-old"; the wireframe says 11.
Site uses 11 — fix the flyer before it reprints.

### Resolved — CTA above the fold
A Register Today button now sits directly under the hero nav at 587px, comfortably above a
900px fold. The full CTA card stays at position 4 and does the persuading.

### Original tension (for the record) — CTA above the fold
Kyle marked the Sponsor CTA "high in visual hierarchy and above the fold", but placed it third.
With a full-height logo hero (~530px) plus Meet Grant (~480px) it lands near 1000px — below the
fold on a 900px laptop viewport. Options:
  a. Add a primary CTA button into the hero, keeping the full CTA band at position 3
  b. Tighten the hero so the band pulls up
  c. Swap Meet Grant and the CTA band
Recommend (a) — the hero already has nav buttons, so one accented CTA beside them reads naturally
and the band still does the persuading further down.

### CTA copy direction
"Ready to play Fore Grant?" or similar — inclusive of both sponsors and foursomes, but
prioritising sponsors.

### Assets still needed
- Photo of Grant
- Photos from last year's tournament (carousel, 3+)
- Sponsor logos


## Home page grounds (2026-08-20)

Light to dark, top to bottom — Kyle's naming in brackets:

| Section | Ground |
|---|---|
| Header band, hero, hero CTA, Meet Grant, Sponsor CTA | `bg/page` #F4F3E8 [light green] |
| Last year, Other Ways, Find Us | `bg/panel` #E4E1C5 [mid green] |
| Footer | `bg/inverse` #31532D [dark green], preceded by the argyle band |

The Sponsor CTA is a contained card on the light ground — green fill, `radius/xl`, orange
Register Today. It reads as one large tappable callout rather than a full-bleed ribbon.
Body copy bolds "Become a sponsor" and "play as a foursome" so the single sentence covers
both audiences while the button stays a catch-all.


## Home v3 — 2026-08-20

1. **Registration is the button.** The orange Register Today button sits in the nav row where
   the Registration link was. Home carries no active state (Home is not a destination);
   subpages still show the orange active rule on the current page.
2. **One container width: 1312px** — CTA card, Other Ways callout, and map all match.
   Originally 1080; Kyle widened Home to 1312 and Groups (1180) and the register-form cards
   (1080) were normalised up to match on 2026-08-20, so the whole site now runs one width.
3. **Mid green is a ribbon around the carousel only.** Everything else above the footer is on
   the light ground, which lets the argyle bands read against it.
4. **Argyle Tall (88px) top and bottom.** Previously the top band was Standard (48px).
5. **Section headings are all 36px.** Meet Grant, Ready to play, Last year, Other Ways,
   Find Us, and the footer tagline. Hierarchy comes from colour and ground, not from size.


## Registration flow (2026-08-20)

The Registration page is a chooser before it is a form:

1. Sponsor tiers are browsed as cards — light by default, dark green on hover, Featured
   permanently dark so the row always has an anchor.
2. **Register Now** on a card carries that tier into the form with the sponsorship field
   prepopulated. No cart, so the button is the selection.
3. The confirmation pane before final submit repeats the tier and everything it includes.

### Why the card is not clickable
A link wrapping a button is nested interactive content — invalid, and read as one confusing
control by assistive tech. The usual fix stretches the button's hit area over the whole card,
which makes the button's own hover fire everywhere and destroys the nested state. So: card
hover is presentation, Register Now is the action. Two hover states, one link.

### Dark card contrast — deviation from the netlify reference
The netlify screenshot sets the price in orange on dark green. That is **2.48:1**, below even
the 3:1 large-text bar, so the price is set in cream (**7.83:1**) instead. Orange still carries
the Featured border, the badge fill and the benefit markers — the markers are decorative
(the list structure comes from layout), so they are exempt.

If the orange price is wanted for brand reasons it is a deliberate accessibility trade, not an
oversight — say so and it flips back in one binding.


## Registration page — built 2026-08-20 (4,116px)

Argyle · dark nav · Sponsorship Opportunities header · 8 tier cards (3-up, wrapping) ·
Register form on the mid ground · Other Ways callout · footer.

The Orange Ribbon Champion card is Featured — permanently dark with the orange edge — so the
row has a fixed anchor. Everything else is light and goes dark on hover.

### A third stale "dinner" reference
Orange Ribbon Champion's benefits read "10 total **dinner** tickets" in the near-final copy.
The event serves breakfast and lunch only, so the page is built with "10 **lunch** tickets".
That makes three dinner references corrected in total — the other two were already approved.

### Nav on this page
Registration IS the button, so there is no active underline here. Being on the Registration page
needs no extra signal: the button is already the most emphasised element in the bar. Tournament
Day and Contact carry the orange rule when they are current.

### Form
Sponsorship package is a Select prefilled from the chosen card, with remaining-count helper text
("2 remaining"). Submit reads **Review your registration**, not Submit — the confirmation pane
repeating the tier and its inclusions is part of the flow, not an afterthought.


## Registration v2 — 2026-08-20

1. **Nav:** on this page the Register button becomes a plain **Home** link and blends in.
   Nothing is marked active — Registration is the page you are on and is not listed.
2. **Badges are larger** (14px, pill, more padding) and gained a **Reversed** axis for dark
   grounds: Neutral flips to a cream chip with green text, Limited to solid orange with white.
3. **Tiers are now full-width rows in four buckets** — Premium, Meal, Hole, Golf Entry,
   matching the flyer's own grouping. Rows instead of cards because tiers carry between 2 and
   6 benefits; as cards that produced heights from 352px to 597px in the same row.
   The Tier Row has six benefit slots so the longest tier is never truncated.
4. **The form is not on this page.** Register Now redirects to it with the package prefilled.
5. Other Ways to Support stays at the bottom, as on Home.


## Tournament Day — built 2026-08-20 (2,648px)

Three parts, as specified:

1. **Day-of info** — three equal-height cards: Contests (putting, longest drive, closest to
   the pin), Ways to Win (silent auction, raffle), Meals (breakfast, lunch, awards during lunch).
   Cards are stretched to match the tallest so the row reads level.
2. **The visual break** — "How the day runs" as a green card on the mid ground: check-in,
   announcements, shotgun start, best ball, ready golf, and what happens after the round.
   Green because it is the authoritative part of the page.
3. **Groups & hole assignments** — Pairing Group rows, labelled as data-driven. Pending,
   default and highlighted states shown. Rows become stacked cards on mobile.

### Placeholders
Breakfast and lunch start times and menus.

### Contrast catch
The rule labels in the green card were orange on green (2.48:1) — the same failure the palette
rule exists to prevent. Recoloured to cream. Worth noting it recurs every time a new dark
section is built, which is why the rule lives on the accent variables themselves.


## Tournament Day v2 + badge change — 2026-08-20

- **Event Schedule / Tournament Format** replaced the single green card: two columns split by a
  vertical orange rule, on the light ground. Three type tiers throughout — header 36px Bitter
  Bold, subhead 20px Bitter SemiBold in rust, bullets 17px Source Serif 4.
- **Groups table restructured.** Hole is the row; Group A and Group B are the columns. Tee times
  are gone — a shotgun start means every group tees off at 9:00, so a time column carried no
  information. Group labels run 1A/1B through 18A/18B. Hole 7 shows the find-my-name highlight.
- **Badges now show spots remaining, not caps.** "2 left" rather than "Max of 2". The Limited
  tone triggers at 2 or fewer and 1 reads "Only 1 left". Foursome entry set to 11 left.

The cap number and the remaining number are different facts — a cap is administrative, a
remaining count is a reason to act now. The component was already built to carry either.


## Groups table polish

- **Hole in a scorecard chip** — 48px rounded square in brand green with the number in cream.
  Gives the left column a fixed rhythm to scan down and echoes a printed scorecard.
- **Group number is 19px Bitter Bold** in brand green, up from 10px mono. It is the thing
  people are looking for, so it now outranks the names beneath it.
- **Zebra rows** alternate `bg/panel` against `bg/page` — 18 rows of four names each is a lot
  of eye travel across three columns, and the banding stops line-skipping.
- **Hairline between Group A and Group B** so the two columns read as separate assignments.
- **Highlight flips the chip to orange** and the group number to rust, so the found row is
  obvious from a scroll away.

Names went 15px → 16px. This gets read outdoors in November sun on a phone, so the floor is
higher than a normal table's.


## Name lookup + Contact — 2026-08-20

**Name lookup** sits above the groups table: a text field plus a result line
("1 match — Erin Castillo is in group 7A, starting on hole 7").

**Groups became individual cards** to support it. The highlight has to land on one group, not
the whole hole — the other foursome on that hole is a different set of people and lighting
them up would be wrong. So each group owns its own fill and border; the row is now just a
layout container. 7A highlights while 7B stays neutral.

**Contact** (1,332px) — stripped to a plain list. Event Director label, Jessica
Carlson-Petersen, then Email and Call / text as a two-column list. No card, no buttons, no
subtitle, no section labels. Course and date sit beneath with a directions link.


## Registration form — on-page, 2026-08-20

Field set matched to https://fore-grant.netlify.app/contact/ :

**01 Company Information** — Company name*, Sponsor tier* (prefilled), Company website,
Payment type (Check / Credit card / Venmo / Invoice me), **Company logo upload (new)**
**02 Player Information** — First*, Last*, Phone*, Email*, Player 2/3/4
**03 Special Requests or Comments** — textarea

### Two corrections against the live form
- The live tier select still carries the **old prices** — $3,500 lunch and $2,000 breakfast.
  Corrected to **$2,000** and **$1,750**.
- Tier is prefilled from the chosen card with a remaining count, rather than defaulting to
  "Select a tier…". The page already made the choice.

### Logo upload
New `Type=Upload` on Form Field (6 states, dashed dropzone). Helper text states high-resolution
required and vector preferred — SVG, EPS or AI — and says why: the file goes on physical
signage, where a web-sized PNG will not reproduce. Giving the reason gets better files than
stating the rule alone.


## Register Form — its own page, 2026-08-20 (2,741px)

Removed from the Registration page. Register Now on a package navigates here with the tier
prefilled, so the browse step and the fill-in step stay separate.

Three sections are three separate cards on the light ground — Company Information (558px),
Player Information (609px), Special Requests (318px) — rather than one long panel. Fields sit
on `bg/page` inside `bg/panel` cards, so the inputs read lighter than the card holding them.

A "Back to sponsorship packages" link sits above the title, since someone who lands here and
wants to compare tiers again should not have to use the browser's back button.


## Register form — two versions, 2026-08-20

Both live on the `Page — Register Form` Figma page, side by side.

**Sponsor** (2,877px) — 01 Company Information (incl. logo upload) · 02 Player Information ·
03 Special Requests.
**Golfer** (2,565px) — 01 Your Information (first, last, phone, email, payment) ·
02 Your Foursome · 03 Special Requests. No company section, no tier select; the chosen
package is confirmed in the page subtitle instead.

- **Section numbers** are 34px Bitter Bold in orange, not 12px mono. They read as structure now.
- **Payment options are Check, Cash, Venmo.** Credit Card and Invoice Me removed.
- **All name fields are single inputs** with a "First and last" helper. Never split into
  separate first/last fields.
- **Form headers carry only a Back to sponsor packages button** — no title, no subtitle, no
  package confirmation. The page is a form; the cards say what each section is.


## Form column layout — final for now

**Sponsor · Player Information** (two columns)
Name | Phone · Email | Player 2 · Player 3 | Player 4

**Golfer · Your Information** (two columns)
Name | Phone · Email | Payment type

**Golfer · Your Foursome** stays full-width single fields — three names reading down as a list
rather than a grid.

Sponsor form is now 2,479px, golfer 2,288px.
