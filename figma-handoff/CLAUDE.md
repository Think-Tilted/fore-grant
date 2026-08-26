# Fore Grant — design system + site

Auto-loaded context. Read `ds-state.json` first — it is the source of truth for node IDs.

## What this is
Design system and site for **Teeing Off Fore Grant**, a charity golf tournament
(Fri 6 Nov 2026, San Vicente Golf Course, Ramona CA). Kyle designs in Figma; a dev named
Trevor builds from it. A placeholder Next.js site exists at https://fore-grant.netlify.app —
**backend scaffolding only, not a design source.**

**Figma:** https://www.figma.com/design/6qiOahJwM68SdswOurWwxL  (fileKey `6qiOahJwM68SdswOurWwxL`)

## Kyle edits this file directly — read before you write

**Assume the file has changed since the last session.** Kyle designs in Figma between
conversations. Regenerating a section from an array in your script silently reinstates anything
he deleted and overwrites anything he retitled, repriced or reordered.

Rules:
1. **Read the section before you change it.** Dump the current children, names and text, and
   report what is there. If it does not match what you expected, say so and stop.
2. **Modify, never regenerate.** Target specific nodes and set specific properties. Do not
   rebuild a whole section from hardcoded data unless Kyle explicitly asks for a rebuild.
3. **Deletions are invisible.** A tier that is gone looks identical to a tier that never
   existed. Only a read-first diff catches it — nothing else will.
4. **If Kyle says he made edits, diff first.** Compare the live file against `ds-state.json`
   and this file, list every difference, and confirm before writing anything.
5. **A rebuild is a destructive operation.** Say so out loud and get a yes first, the same as
   for deleting files.

## Where the page designs live
**Two rows on `00 — REVIEW`:** desktop at y=0, **mobile (390) at y=5200**, each mobile frame
directly below its desktop counterpart. Mobile uses real components — `Nav Variant=Home-Mobile`
and `Variant=Subpage-Mobile`, `Footer — Mobile`, and `Tier Row Device=Mobile`.

**Auto-layout direction cannot be overridden on an instance**, so anything that changes direction
at mobile needs its own component or variant. Prefer a **variant in the same set** — swapping to a
different component silently loses every override, including per-tier benefit lists.
All six page frames sit on **`00 — REVIEW (start here)`**, left to right in journey order.
They were moved, not copied — node IDs in `ds-state.json` are still correct. The old
`Page — *` shells were deleted on 2026-08-20 once emptied; deleting them changed no node IDs,
because an ID belongs to the frame, not the page under it. **One canvas is how Kyle reviews** —
never scatter page frames back onto separate Figma pages.

## Before touching Figma
1. Load the `figma-use` skill. Add `figma-generate-library` for any component work.
2. Read `ds-state.json` for node IDs. **Never guess an ID.**
3. Read `design-brief.md` for decisions already made and why.

## Third-party logos are the one palette exception
The **San Vicente Resort** mark (blue + green) and sponsor logos keep their own colours and are
never recoloured to fit. They sit on **white** — that is what the ticker's white ribbon and the
shout-out post's white panel exist for. An exception for a mark someone else owns is not a
licence to introduce a hue anywhere else.

**Rasterising Adobe files drifts colour.** `G$ Fight.ai` came out `#de5937`/`#050707` instead of
`#F05323`/`#000000`. Normalise every import against the swatch card first.

**The San Vicente mark is settled** (2026-08-26). Kyle recreated it in Photoshop:
`assets/logos/SanV_IMG.png`, 812×526, transparent, two flat colours — green `#42A649`, blue
`#16548B`. It replaces the flyer-PDF extraction, whose `#5fa454`/`#2a5487` were CMYK-render
approximations. Placed under the Home map on desktop and mobile. No longer a launch blocker.

## Type is tokenized — keep it that way
**55 text styles** — 31 desktop plus 24 `mobile/` steps — names identical in Figma and Tailwind
(`heading/section` ↔ `text-heading-section`). `tailwind.css` mirrors 26 desktop + 24 mobile; the
five unmirrored desktop steps are the legacy unused ones (`display/xl`, `display/italic`,
`heading/h1`, `heading/h2`, `label/md`). **923 of 930** page text nodes are bound
(measured 2026-08-25) — the remaining seven all carry deliberate inline emphasis.

**Tracking crosses over now** (fixed 2026-08-25). All 9 non-zero values are mirrored as
`--text-*--letter-spacing` pairs — Figma states tracking as a % of font size, which is exactly
`em`. `display/lg` at −2.6% is on every page title; without it built headings read visibly looser. **Bind every new text node to a style** — typing a raw size is how this system
broke the first time, and it pushed the developer onto raw REST JSON for everything.

Line heights are still AUTO. Set them in Figma first, then mirror into `tailwind.css`.

## Stack — Tailwind v4 (changed 2026-08-21)
`tokens.css` is the source of truth. `tailwind.css` is the **only** place Figma names meet
utility names, and it **restates no values** — every `@theme` entry is `var(--token)`. If a
literal value ever appears there, the one-way flow is broken. `components.css` keeps the
interaction contracts utilities express badly (the two hover-yields, the marquee, the argyle).

## The palette is closed — six colours plus black and white
`brand/green #31532D` · `brand/olive #587333` · `brand/orange #F05323` ·
`brand/orange-mid #CD4628` · `brand/rust #A53422` · `brand/cream #E4E1C5` ·
`brand/light #F4F3E8` (derived) · `base/black` · `base/white`

Everything else is one of these at a documented opacity. **Do not introduce a new hue.**
If a step is needed, use alpha and record the ground it was solved against.

## Rules that took work to find — do not relitigate
- **No orange is legible as text on the brand green.** Display 2.48:1, mid 1.87:1, rust 1.29:1.
  On green, orange is for graphics only — dividers, rules, borders, decorative markers.
  Text on green is `text/inverse` (6.6:1) or `bg/page` (7.8:1).
- **`accent/display #F05323` is never a button fill or body text.** 3.16:1 — large display only.
  Buttons use `accent/default #CD4628` (4.66:1 with white).
- **No shadows.** The flyer has none. Hover is a 2px lift (`motion/lift`), not elevation.
- **Solve contrast against the ground the token actually sits on**, not the page. SOLD OUT
  passed on the card and failed on the badge fill underneath it.
- **Decorative borders and control borders are different tokens.** `border/default` is 1.37:1
  and fine for panels; form controls need `border/control` (3:1, WCAG 1.4.11).
- **Section headings are 36px everywhere.** Hierarchy comes from colour and ground, not size.
- **Boxed containers are 1312px.** One container width per page — 1440 minus 64px of page
  padding each side. Was 1080; Kyle widened Home by hand and Groups and the register-form
  cards were normalised up to match on 2026-08-20.
- **Hex drift is real.** The swatch card, the logo SVGs and the flyer artwork each carried
  different values for the same colour, off by 1–2 per channel. **The swatch card wins.**
  Normalise any new asset before importing.

## Social graphics
**Two complete sets live on `04 — SOCIAL`.** Row 1 (y=0) is the original; **row 2 (y=1400) is the
punchier pass** — same seven posts, same closed palette. Levers, in order of payoff: photography
with a **directional** scrim (a flat scrim kills the photo), extreme scale on the one number that
matters, hard two-tone splits instead of even margins, argyle full-bleed rather than a 24px trim,
and one hot orange hit per frame instead of orange spread thin. Grounds alternate across the row
so consecutive posts do not blur in a feed. Kyle still to pick a set.
Seven 1080×1080 Instagram posts live on **`04 — SOCIAL`**, left to right in campaign order:
Save the Date · Registration Open · Sponsorship Ladder · Sponsor Shout Out · Meet Grant ·
Final Foursomes · Tournament Day. Shared kit: argyle band placed at its full 1440 width and
clipped (**never resize the band — it distorts the tiles**), a 2px orange keyline inset, three
orange dots top-left, and a green corner lockup bleeding off the bottom-right. On **green**
grounds the corner block is invisible and masks the keyline — place the logo bare instead.
CTAs say **"link in bio"**, never a URL; there is no public domain yet.

## Meet Grant carries the glove, not the badge
The story sits in a 2px orange keyline box with **His Fight Is Our Fight** at its right — the
flyer's treatment. The glove ties the section to Grant himself and keeps it clear of the
tournament wordmark. Normalised asset: `assets/logos/his-fight-is-our-fight.png`; hand the
developer a vector exported from `G$ Fight.ai`, not the PNG.

## Backend — Google Sheets, decided 2026-08-25
**Trevor already has a Google API built and tested.** The forms post to a Google Sheet. The
**same sheet, on a different tab, writes back to the Tournament Day groups page** — intake and
day-of pairings are one mechanism, not two. Do not design a form backend; it exists.

**Payment is offline only.** No Stripe, no PCI scope, no refund flow. The form captures the
commitment and the intended payment type; an invoice follows. `Payment type *` is required on
both forms — verified consistent, the old asterisk-mismatch note was stale.

Tier availability (`2 left`) may belong in the same sheet, but only pairings were confirmed —
ask before moving `spotsRemaining` off `tiers.json`.

## Confirmation is a receipt, not a card
Kyle, 2026-08-26. The package block is a **list with hairlines** — no card fill, no border, no
radius. `PACKAGE / AMOUNT / ENTRY / PAYMENT` as label-value lines in `mono/label`, then an
`INCLUDED` list. Desktop puts label and value on one line; **at 390 the value stacks under its
label**, because "Invoice to follow — nothing charged online" wraps badly beside a label at 350px.
Keep the two-part split: what you got, then what happens next.

## Payment is static — all three methods, always
Kyle, 2026-08-26. The form captures a payment preference, but the **HOW TO PAY block always shows
all three** — Venmo, Check, Cash. Nobody pays up front, so someone who selected Check can still
Venmo on the day. **There is no `{{payment_type}}` merge field. Do not add one.**

Venmo is `@Jessica-Carlson-15`, rendered as a **link** to `venmo.com/u/Jessica-Carlson-15`, not
only a QR — on a phone you cannot scan your own screen. The QR is desktop-only and is omitted at
390 and in the email. Checks are made out to Jessica Carlson; cash at check-in.

**No mailing address exists anywhere in this project**, but the CHECK line says "Mail it." Add one
or cut the word — do not invent an address.

## The confirmation email IS the invoice
There is no separate invoice document and no third touch. The email carries the amount and the
remittance details, which is everything an invoice needs, and it saves Jessica from sending a
second thing to every registrant. The page reassures in the moment; the email is the durable
record. Those two are not redundant — a third document would have been.

## The confirmation email lives on `05 — EMAIL`
`Registration Confirmation — 600` — the branded HTML email the Google API sends. Same content
shape as the Confirmation page. **A NOTE frame beside it carries the email build rules**, which
break most of this system's assumptions: 600px table layout, no CSS variables, web fonts do not
load (Bitter → Georgia), inline hex only, PNG not SVG, argyle as a 600px slice.

**Two tokens must ship flattened** against `#F4F3E8`: `text/secondary` (black 62%) → `#5D5C58`
and `border/default` (green 20%) → `#CDD3C3`. Outlook drops `rgba()` and falls back to solid black.

## Site architecture — 6 pages
Home · Registration · Register Form · Confirmation · Player Roster · Tournament Day · Contact.

**Player Roster** is not in the nav and never will be. It is reached by a link in the email
thread ~4 weeks out, to collect final player names for the course. Group name prefills; phone and
payment type are hidden because registration already captured them; the back link is hidden
because the page is reached cold from an email. **Its submit is an inline success state, not a
new page** — a light utility form does not need a confirmation route.

## Communication sequence lives in `data/email-sequence.md`
**One automated email** — the confirmation/invoice. Everything after it is Jessica replying in the
thread that email creates: payment nudge, artwork chase, roster request, groups live, day before,
thank you. All six drafted as plain text so they read as a person, not a system.

`From:` an event address · `Reply-To:` Jessica · **`CC:` Jessica**. If it sends *from* her address
the CC is redundant — it lands in Sent, not her inbox, and the thread will not behave correctly.

**Payment is due on receipt with a hard deadline of Friday, 30 October 2026** — seven days before
the event. Same date for everyone, so hardcode it; it is not a merge field. A plain line states
that this is a personal fundraiser, **not a registered 501(c)(3)**, so sponsorships are not
tax-deductible. No EIN language anywhere.

**Methods are Check · Venmo · Cash.** Checks are payable to Jessica Carlson with
**"Teeing Off Fore Grant" on the memo line** — that is how she reconciles deposits, not
boilerplate — and mail goes to 907 Neighborly Lane, Ramona, CA 92065. **GoFundMe is deliberately
not a sponsorship payment method** even though the 2025 invoice offered it: it takes a platform
cut and lands outside the sheet. It stays the donation link for people who are neither sponsoring
nor playing.
The form is its own page — Register Now on a package carries the tier into it, and carries it
through to **Confirmation**, which repeats the package as a **Tier Row instance with the
availability badge and Register Now hidden** — the visitor sees what they chose in the same
component they chose it from. Confirmation is not a nav destination, so its nav clears the
active state it inherited from the page it was cloned from.
Home has no block nav: the badge is the hero with the destinations beneath it, and
**Registration is the orange Register Today button**, not a link. Subpages get a 100px dark
green bar with the negative mark; the current page carries a 4px orange rule.

## Sponsor ticker on Home — V2, do not build for launch
**Kyle, 2026-08-25:** the ribbon stays hidden until well after launch. It is not a "unhide as
logos trickle in" feature — real logos must exist first. Fully designed and tokenized, parked at
`visible=false` on Home desktop and mobile. **The marquee comes off the v1 custom-CSS list.**


Between the Sponsor CTA and the carousel: a 1312 **white** ribbon on the light ground, heading
`Thank You to Our Sponsors`, with a logo track that is deliberately wider than the ribbon and
clipped, plus white edge fades, so it reads as mid-scroll. **White is a requirement, not a
style choice** — several sponsor logos are low-resolution and need white behind them. Seven
placeholder slots wait on real logos.

## Icons
Phosphor, 44px, fills bound to a token (never the source `#000000`). Tournament Day cards carry
one each at the top: **trophy** = Contests, **ticket** = Ways to Win, **hamburger** = Meals, in
orange on the cream cards. The dark green CTA carries **hand-heart + golf** — give and play — in
`bg/page` light, **not orange**: orange on green measures the same 2.48:1 the text rule warns
about, and the icons read muddy. The no-orange-on-green rule covers marks that carry meaning,
not just text.

## Groups collapse on mobile — decided 2026-08-25
`Tournament Day — 390` ships with the pairings table **collapsed**. The visitor types a name and
gets **their group and hole as one card** — dark green, 2px orange edge, light text, the same
treatment the desktop table uses for a match. Below it, `View all 18 holes` expands the rest.

The full table is **hidden, not deleted** — all 36 cards intact at `visible=false`. Unhide it to
proof content; do not rebuild it. A NOTE frame beside the page says so. This cut the page from
8,941px to 3,901px. Day-of, on the first tee, the visitor wants THEIR group, not all 36.

**Desktop tier rows stay EXPANDED.** The accordion is mobile-only. On 1440 there is room for the
benefit lists, and the benefit lists are the sell.

## Day-of cards must hug
The three Tournament Day cards and the Day-of section **hug vertically — never a fixed height**.
They were pinned at 438 and were silently clipping the raffle and 50/50 ticket prices. Keep the
three even by pinning all to the tallest measured height, not by guessing one.

## Mobile nav is the same on every page — Home included
One component: `Nav Variant=Subpage-Mobile`, a 72px dark bar, horizontal logo left, hamburger
right. **Home adds a hero below it** (badge + a single full-width Register Today) rather than
having its own nav. `Variant=Home-Mobile` was deleted — it was the only page-specific nav and it
meant a visitor who learned the hamburger elsewhere could not find it on Home.

**Home hides the bar's logo** (Kyle, 2026-08-25) — the badge sits immediately below and does the
brand lifting, and the flyout carries the logo anyway. It is hidden, not deleted, on the Home
instance only; every other page keeps it. The bar is otherwise identical, so the hamburger stays
in the same place on every page. Two consequences: the Home instance also overrides
`primaryAxisAlignItems` to `MAX`, because `SPACE_BETWEEN` with one visible child left-aligns it,
and that property will no longer track the component.

**The hamburger opens `Menu — 390`** — a full-screen 390×844 overlay on the same dark green,
parked at x=500 on the mobile row. It uses `Nav Variant=Menu-Mobile`: the identical bar with an X
where the hamburger was, a variant in the same set rather than a second component. Rows are Home ·
Tournament Day · Contact with 1px orange hairlines between them; **Registration is the orange
Register Today button, not a row** — the same vocabulary as the desktop nav. The X fires a CLOSE
action, so the visitor lands back on whichever page opened the menu.

**Toggle and X are 44×44 hit targets with the 26px glyph flush right.** Centring the glyph in the
larger box would have shifted it 9px and changed a bar that was already approved.

## Nav logo — horizontal, not the badge
The subpage bar uses `Logo — Horizontal Negative` at **165×64**. The stacked badge squeezed to
104×76 was illegible. The bar's `counterAxisSizingMode` must stay **FIXED at 100** — it hugs its
logo otherwise and the 100px rule breaks without anyone noticing.

## One hover language: dark green, light text
Buttons darken, tier rows go dark, a group match goes dark. **Anything that highlights joins
that language** rather than inventing a colour. The group lookup used to use a warm orange tint
and read as an error state; it is now dark green with light text, orange kept only as the edge.

**Tier Row has four states** — Default, Hover, Featured, SoldOut. **Every row looks the same at
rest.** Green means the pointer is on it and nothing else; the featured tier is marked by its
**orange edge alone**. Featured used to be dark at rest — with eight rows stacked that read as
already-selected and stole the meaning of hover. `FeaturedMuted` was deleted with it, since its
only job was lightening a dark featured row.

**Mobile rows ship COLLAPSED** — name + price + availability — and open independently, so a
visitor comparing two packages can hold both open. Sold out never expands and carries no chevron.

**The Figma frame is shown EXPANDED on purpose.** It is the only view where all eight tiers' copy,
prices and benefit lists can be proofed at once. A NOTE frame beside `Registration — 390` says so.
Do not collapse it to "match production" — that is not what the frame is for.

## Prototype
`00 — REVIEW` has **two flow starting points** — desktop Home and Home — 390 — and **167 wired
reactions** (89 desktop, 78 mobile): nav, logos, Register Today, all eight Register Now buttons,
both Back links, GoFundMe and Instagram. Footer Pages links are **hover-only and do not navigate**,
on desktop and mobile alike.

**Mobile links must resolve to 390 frames.** Cloning a desktop frame clones its reactions, so the
copies keep pointing at the 1440 original and the canvas looks identical either way. Nine such
links were found and repointed on 2026-08-25. Register Now routes to the Sponsor form except **Foursome Entry**, which routes to
the Golfer form. Self-links are left unwired (Figma rejects navigating to the frame you are on),
**All four form submits are now wired** to Confirmation (desktop) and Confirmation — 390
(mobile), each keeping its hover state change. Self-links remain the only unwired case.

**Never build a paint as a placeholder literal plus `setBoundVariableForPaint`.** The matched
group card came out pure black that way — correctly bound to `color/bg/inverse`, rendering
`#000000`. Copy the paint array off a node that is already right, or set the literal to the
token's real value. Screenshot after any paint write.

**A Reaction carries two action fields.** The deprecated `action` and the authoritative
`actions[]` array. Mutating only `action` and calling `setReactionsAsync` succeeds, reports
success, and changes nothing on the canvas. Write both, then read back and resolve destination
*names* — nine "repointed" links were still on the desktop frames until they were verified.

**Figma cannot prototype "hover A, change B."** The nav's `ActiveMuted` is that shape — the
current page's underline drops out while a *different* item is hovered — so it cannot be QA'd in
Figma and must be checked in a browser. (`FeaturedMuted` was the other one; it no longer exists,
because featured is no longer dark at rest.)

## Registration flow
Browse tiers → **Register Now** prepopulates the sponsorship field → confirmation pane repeats
the tier and everything it includes. The card is **not** a link — the button is the only click
target, so the button keeps its own hover on top of the card's.

## Copy corrections already approved
The event serves **breakfast and lunch, no dinner**. Three stale "dinner" references in the
flyer are corrected on the site. Grant is **11**, not 10. The flyer still carries the old
wording — fix before reprint.

## Instance overrides shadow the component
A **property** override on an instance permanently blocks that property from ever updating from
the component. **Structural** changes (adding/removing a child) still propagate. That asymmetry
is why deleting footer sub-copy carried across every page but changing its padding did not.

**Tune the component, never the instance.** If a component edit isn't reaching instances, check
overrides first — `instance.resetOverrides()`. Exception: **nav overrides are legitimate** (active
state, the Register/Home swap) and must never be reset. Footer overrides never are.

## Removed on purpose — do not add back
Kyle stripped explanatory sub-copy on 2026-08-20: the footer's bottom details line, the
Registration and Tournament Day page subtitles, the Groups intro note and caption, and the
submit caption on both register forms. **Headings carry their own meaning.** Do not write
helper prose under a heading that already says the same thing.

## Live links (set as Figma hyperlinks; dev implements)
- GoFundMe — https://www.gofundme.com/f/support-grant-through-his-tall-battle
- San Vicente Resort — https://www.sanvicenteresort.com/ (the venue logo under the map IS this link)
- Map embed — keyless `google.com/maps?q=…&output=embed`, coords 33.0022215, -116.8058419
- San Vicente Resort — the venue logo under the Home map **is** the directions link (the
  standalone "Get directions" row was removed). URL still to confirm; do not invent one.
- Instagram — https://www.instagram.com/grantstallbattle/ (**the only social account**; footer is IG-only)

## Photo assets
Originals live in `assets/photos/`. Figma holds placed copies for layout only — hand the
developer the originals, not Figma exports.

## Outstanding
- Sponsor logos — now feed **two** places: the seven Home ticker slots and the Sponsor Shout
  Out post. High-res, vector preferred. Carousel photos: 28 in `assets/photos/carousel/` (source: Drive .../ForeGrant/2026/G$).
  **Portrait crop review is done** — the three remaining portraits read fine on the default centre
  crop. The **San Vicente logo was extracted from the 2025 flyer PDF**, not supplied — its
  greens and blues are CMYK-render approximations of someone else's brand, so get the official
  asset before launch. `tourney-28.jpg` was pulled and sits in `_removed/`; numbering skips 28 on purpose.
  The carousel is a **year in review**, not only tournament day — off-course photos belong there.
- Google Map embed
- All five pages built: Home, Registration, Register Form, Tournament Day, Contact
- CSS export beyond `tokens.css` / `components.css`
