# Layout spec — every page, every section

**This file exists so you never have to open Dev Mode or run an MCP server.** Every number below
was read straight out of the Figma file on 2026-08-26. Use Figma as a *picture*; use this as the
measurements.

**Notation:** `pad T/R/B/L` · `gap` is the auto-layout item spacing · `col`/`row` is the flex
direction. Colour names are semantic tokens — `bg/page` → `--color-bg-page`. Type names are text
styles — `heading/section` → `text-heading-section`.

---

## Global constants

| | Desktop | Mobile (<768) |
|---|---|---|
| Frame width | 1440 | 390 |
| Container | **1312** (1440 − 64 each side) | fluid, 20px gutters |
| Page padding | 64 | 20 (24 on Tournament Day + Home hero) |
| Section rhythm | 80 top / 80 bottom | 40 / 40 |
| Nav bar | 100 tall, `bg/inverse` | 72 tall, `bg/inverse` |
| Argyle band | 88 tall, `bg/page` | 88 tall |
| Footer | 461 tall | 593 tall, stacked |

Every page is: **argyle band → nav → page header → sections → footer.** Home swaps the page
header for the hero. All grounds are `bg/page` unless noted; `bg/panel` is the cream card ground.

---

## Home — 1440×4077 · mobile 390×4120

| Section | Desktop | Mobile |
|---|---|---|
| header band | 88, absolute | 88 |
| hero nav | `col · pad 48/0/40/0 · gap 32 · center` — logo 520×378, links row gap 40 | nav 72 + hero `col · pad 44/24/40/24 · gap 18` |
| Meet Grant | `col · pad 80/64/80/64 · gap 40` → row 1312×470, gap 48 | `col · pad 32/20/32/20 · gap 20` |
| Sponsor CTA | `col · pad 48/64/58/64` → card 1312×329, `pad 48` all, gap 24, **bg `bg/inverse`** | `col · pad 28/20/28/20` |
| Sponsors ticker | **HIDDEN — V2, do not build** | HIDDEN |
| Last year (carousel) | `col · pad 80/64/80/64 · gap 32` · **bg `bg/panel`** · carousel 1312×506, gap 24 | `col · pad 40/20/40/20 · gap 20` |
| Other Ways | `col · pad 64/64/64/64 · gap 32` → callout 1312×322, `pad 48`, gap 20, bg `bg/panel` | `col · pad 40/20/40/20 · gap 20` |
| Find Us | `col · pad 41/64/24/64 · gap 23` · map 1312×420 bg `bg/panel` · venue logo 170×110 | `col · pad 28/20/24/20 · gap 23` |
| Footer | 461 · body `pad 64/64/48/64 · gap 40` | 593 |

`h` = `heading/section` on `text/brand`. `addr` = `body/lg` on `text/secondary`.

---

## Registration — 1440×3951 · mobile 390×4566

| Section | Desktop | Mobile |
|---|---|---|
| nav | `row · pad 12/40/12/40 · space-between` · logo 165×64 · links gap 32 | `row · pad 12/20/12/20` |
| Page header | `col · pad 80/64/48/64 · gap 24` · h1 `display/lg` on `text/brand` | `pad 40/20/28/20` |
| Packages | `col · pad 0/64/80/64 · gap 64` | `col · pad 0/20/40/20 · gap 20` |
| ↳ bucket | `col · gap 20` — head + tier rows | same, gap 20 |
| Other Ways | as Home | as Home |

**Tier rows:** desktop 1312 wide, 310 tall at rest, always expanded.
Mobile: **collapsed 142, expanded ~425**, ships collapsed, rows open independently.
Bucket heights desktop: Premium 364 · Meal 626 · Hole 1107 · Golf Entry 296.

---

## Register Form — Sponsor 1440×2368 · Golfer 1440×2150

| Part | Desktop | Mobile |
|---|---|---|
| Page header | `col · pad 48/0/32/64 · gap 20` — back link only | `pad` scaled, back link |
| Form | `col · pad 0/64/80/64 · gap 32` | `col · pad 0/20/40/20` |
| Section card | 1312 · `col · pad 48/48/48/48 · gap 24` | `pad 20` |
| Section head | `row · gap 12` — number + title + 1px rule filling remaining width | **rule hidden**, no room |
| Field row | `row · gap 24` — two 596 fields | **single column** |
| Submit | 1312×52, Button Primary/Large | full width |

Section numbers are `heading/section`, titles `heading/tier`.
Field labels `label/field`, helpers `body/xs`.

---

## Confirmation — 1440×2213 · mobile 390×2485

| Section | Desktop | Mobile |
|---|---|---|
| Page header | `col · pad 80/0/40/0 · gap 24 · center` · h1 `display/lg` | `pad 32/0/16/0` |
| Your package | `col · pad 0/64/56/64 · gap 24` → receipt 1312 | `col · pad 0/20/32/20 · gap 16` |
| What happens next | `col · pad 0/64/96/64 · gap 32` → steps **row**, gap 32, 3 columns | steps **stack**, gap 20 |

**Receipt is a list, not a card** — no fill, no border, no radius. 1px `border/default` rules
between rows. Label column `mono/label` on `text/secondary`; values right-aligned
`body/md-strong`, total `display/price`.
Desktop puts label and value on one line; **at 390 the value stacks under its label.**

---

## Player Roster — 1440×2324 · mobile 390×2171

Same skeleton as the register forms. Sections: Your Group (350) · Players (617) ·
Anything We Should Know (302) · submit.
**Not in the nav.** Reached only from the email. **Submit is an inline success state, not a route.**

---

## Tournament Day — 1440×4354 · mobile 390×3817

| Section | Desktop | Mobile |
|---|---|---|
| Page header | `col · pad 80/64/48/64 · gap 24` | `pad 40/24/28/24` |
| Day-of | `col · pad 0/64/106/64` → cards **row**, 1312×580, gap 24 | `col · pad 0/24/40/24`, cards stack |
| Schedule & Format | `col · pad 45/64/80/64` → split **row**, gap 108, 2px divider | `col · pad 28/24/40/24`, stacked, horizontal divider |
| Groups | `col · pad 26/64/80/64 · gap 32` — lookup 1312×135, table 1312×1727 `pad 16` | `col · pad 26/24/40/24 · gap 20` — **table hidden**, 516 tall |

**Mobile Groups ships collapsed.** Lookup → matched group as one card (`bg/inverse`, 2px
`accent/default` edge, light text) → `View all 18 holes` discloses the table. The table exists at
`visible=false` with all 36 cards.
Hole markers are 48×48, `brand/default`, radius 8. Group cards `bg/panel`, radius 8,
1px `border/default`; the matched card is `bg/inverse` + 2px `accent/default`.

---

## Contact — 1440×1128 · mobile 390×1079

| Section | Desktop | Mobile |
|---|---|---|
| Page header | `col · pad 80/0/40/0 · gap 24 · center` | `pad 32/0/16/0` |
| Contact details | `col · pad 0/64/96/64 · gap 32` — director block gap 12, details gap 8 | `col · pad 0/20/40/20 · gap 16` |

Role = `mono/caption`, name = `display/price`.

---

## Menu — 390 (mobile overlay only) — 390×844

`col`, bg `bg/inverse`, full screen.
nav 72 (Menu-Mobile variant, X instead of hamburger) → links `col · pad 24 · gap 0` → cta
`col · pad 8/24/0/24`.
Rows are `mobile/heading/section` on `text/inverse`, separated by **1px `accent/display`**
hairlines. Register Today is the orange button, not a row.
Opens as an overlay; the X closes it and returns to the page beneath.

---

## Things that are logic, not layout

1. **Hide the player-name block** when the chosen tier includes no golfers (Tee Sign Sponsor,
   "Signage only"). Drive it off `includes` in `data/tiers.json`.
2. **`noindex`** on Confirmation and Player Roster — both expose personal payment details.
3. **Tier availability** (`2 left`) comes from `data/tiers.json`, hand-edited, live on redeploy.
4. **Groups table** is populated from the Google Sheet pairings tab. The names in Figma are
   placeholders.
