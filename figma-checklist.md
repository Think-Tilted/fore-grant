Here is the pre-Phase 5 aesthetic crosscheck checklist, organized component-by-component and page-by-page, drawn directly from the source files vs. the spec docs.

---

## Pre-Phase 5 Aesthetic Crosscheck Checklist

One item at a time — check it visually in the browser, fix anything off, mark it done before moving to the next.

---

### Components

**1. ArgyleBand** ✅
- [x] `tall` variant renders at exactly 88px — fixed: removed fluid `clamp()` override from `argyle.css`; height now owned solely by component
- [x] Pattern repeats horizontally (`repeat-x`), never squashes — crop only
- [x] Background images come from `argyle.css` handoff data URIs (`argyle--full/plain/mono`)
- [x] `trim` variant renders at 24px
- [x] `aria-hidden="true"` present

**2. Logo** ✅
- [x] `badge` variant → `ForeGrant-Badge.svg` — file exists, sized by Nav's `.nav-home-logo { width: 520px; max-width: 80vw }`
- [x] `negative` variant → `ForeGrant-hor-Neg.svg` — file exists, sized by Nav's `.nav-sub-logo { width: 165px; height: 64px }`
- [x] `object-fit: contain`, `width/height: 100%` — fills container, never squashed or cropped

**3. Button** ✅
- [x] Primary: bg `accent-default`, white text (`color-text-on-accent`)
- [x] Primary hover: bg `accent-hover`, `translateY(--motion-lift)` — no shadow
- [x] Secondary: transparent bg, `border-control` border, `text-brand` text
- [x] Ghost: transparent, `text-brand`, `brand-subtle` bg on hover
- [x] Medium: `control-md` (44px) tall, `spacing-6` (24px) padding-x
- [x] Large: `control-lg` (52px) tall, `spacing-8` (32px) padding-x
- [x] Disabled: `state-disabled-bg` fill + `state-disabled-text` on primary; `state-disabled-bg` border on secondary
- [x] Focus ring: 2px `border-focus` (orange), 2px offset
- [x] **Bug fixed:** `--font-display` was undefined (5 components affected: Button, Badge, Footer, Carousel); added alias `--font-display: var(--font-heading)` to `tokens.css` so all resolve to Bitter

**4. Badge** ✅
- [x] Pill shape (`radius-full`), `spacing-2`/`spacing-4` (8px/16px) padding
- [x] `limited` tone: `accent-subtle` bg, `state-limited` text
- [x] `neutral` / `soldout` tones: identical — flagged, carried as-is per spec
- [x] `featured` tone: `accent-default` bg, `text-on-accent` (white)
- [x] Font: `--font-display` (Bitter, now resolved) / `text-label-badge` (14px) / 600

**5. NavLink** ✅
- [x] Bitter (`font-heading`) 1rem/600, letter-spacing 0.03em
- [x] 4px transparent bottom border at rest — space reserved, no reflow
- [x] Hover: `border-bottom-color: accent-display`, width drops to 2px
- [x] Active (`aria-current="page"`): `accent-display` at 4px
- [x] Yield: scoped to `.nav-yield` (intentional deviation from `.nav` to avoid width:100% inheritance — per DEVIATIONS.md)

**6. Nav — Desktop Home** ✅
- [x] `bg-page` background
- [x] Badge logo centered, 520px wide, `max-width: 80vw`
- [x] Links row: Button + 2 NavLinks, centered, `spacing-10` (40px) gap
- [x] Padding: `spacing-12`/0/`spacing-10` (48/0/40) — matches spec `col · pad 48/0/40/0`
- [x] Mobile bar logo hidden via `nav-mobile--hide-logo` on home variant

**7. Nav — Desktop Subpage** ✅
- [x] `bg-inverse` bar, 100px tall
- [x] Horizontal-negative logo left, 165×64
- [x] Links right, `spacing-8` (32px) gap
- [x] Padding: `spacing-3`/`spacing-10` (12/40) top-bottom/left-right — matches spec `row · pad 12/40/12/40`

**8. MobileMenu** ✅
- [x] Full-screen `bg-inverse` overlay — `position: fixed; inset: 0`
- [x] Top bar 72px, logo left, X close right — X is 44×44
- [x] Links: `font-heading` / 1.625rem (`mobile/heading/section`) / 700 / `text-inverse`
- [x] 1px `accent-display` hairlines between each link row
- [x] Container pad: `spacing-6` (24px) all sides; CTA pad: `spacing-2/spacing-6/0` (8/24/0/24) — both match spec
- [x] Register Today is the orange Button (primary), not a link row
- [x] Opens via `hidden` attribute toggled by `mobile-menu.js`

**9. Footer** ✅
- [x] `bg-inverse` full-width band
- [x] ArgyleBand `tall` on top
- [x] Tagline: `font-heading` / `text-heading-section-soft` (36px) / 600 / `text-inverse` / centered
- [x] 3 columns: Follow Us / Questions / Pages — `1fr auto 1fr auto 1fr` grid, 2px `accent-display` vertical dividers, hidden on mobile
- [x] Footer heading: `font-display` (Bitter) / 22px / 700 / `bg-page` color
- [x] Instagram handle text: `font-display` / 20px / 600 / `bg-page` / hover → `accent-display`
- [x] Footer links: plain `<a>` (not NavLink), `text-inverse`, `accent-display` on hover
- [x] Body padding: `spacing-16/16/12` = 64/64/48/64 (3-value shorthand) — matches spec
- [x] Gap: `spacing-10` (40px)

**10. TierRow** ✅
- [x] Full width, `padding: spacing-8`, 2px `border-default` border, `radius-lg`, `bg-panel`
- [x] Desktop: 2-column grid — left: name (`heading/tier` 22px/700/`text-brand`) + panel; right: price (`display/price` 40px/700/`text-accent`) + includes (`body/sm`) + Badge + CTA
- [x] Featured: `border-color: accent-default` (orange edge) via `components.css`
- [x] Hover: `bg-inverse`, `text-inverse` on all text, price → `bg-page`, marker → `accent-display` — all via `components.css` global
- [x] Sold out: `disabled` on toggle button, no chevron rendered, `tier-row--soldout` class guards JS click handler
- [x] Mobile accordion: `grid-template-rows: 0fr → 1fr`, single column, ships collapsed (`data-open="false"`)
- [x] `aria-controls` / `data-open` / `role="region"` correct
- [x] **Bug fixed:** `aria-expanded` was always `"false"` on desktop even though panels are forced open by CSS. Added `syncDesktopAriaExpanded()` to `tier-row.js` per spec: "leave `aria-expanded=\"true\"` on it rather than lying to a screen reader."

**11. Carousel** ✅
- [x] 3-slide window: prev (220px, opacity 0.5) / active (640px) / next (220px, opacity 0.5) — hidden on mobile
- [x] Mobile: active slide only, full width
- [x] Controls: circular (`radius-full`), `bg-inverse`, `bg-page` glyph, `font-display` (Bitter) 22px/700
- [x] Counter: `font-mono` / `text-mono-label` / `text-secondary`, `01 / 28` format, `aria-live="polite"`
- [x] Slide `radius-lg` (16px), gap `spacing-6` (24px)
- [x] **Bug fixed:** JS was reading sources from 3 DOM `<img>` tags — navigation beyond slide 3 produced blank images. Fixed by embedding full image list in `data-images` JSON attribute on the carousel element; JS now reads from there.

**12. FormField** ✅
- [x] Label: `font-heading` (Bitter) / `text-label-field` (13px / 0.8125rem) / 600 / `text-primary`
- [x] Control: `control-md` (44px) height, `radius-md`, `bg-field`, 1px `border-control`; hover → `brand-default`; focus → 2px `border-focus` outline, 2px offset
- [x] Placeholder: `text-secondary`
- [x] Disabled: `brand-subtle` bg, no border, `state-disabled-text`
- [x] Helper: `font-body` / `text-body-xs` / `text-secondary`
- [x] Error: 2px `text-accent` border on control, helper → `text-accent`

---

### Pages

**13. Home** ✅
- [x] Argyle band (88px) → Home nav → page content → Footer (via BaseLayout)
- [x] Meet Grant: `grid-template-rows: 470px`, 1312 max-width, `gap: spacing-12` (48px), section pad 80/64
- [x] Photo: `object-fit: cover`, `object-position: center 20%` — head in frame
- [x] His Fight logo: `max-height: 100%`, `width: auto` — constrained by card height, not width
- [x] Sponsor CTA: `bg-inverse` card, 1312 max-width, `padding: spacing-12` (48px), `gap: spacing-6` (24px), section pad 48/64/58/64
- [x] Last Year: `bg-panel` section, carousel full width in 1312 container
- [x] Other Ways: `bg-panel` callout, `border: 2px accent-display`, `radius-lg`, `pad: spacing-12` (48px), `gap: spacing-5` (20px)
- [x] Find Us: `find-us__map` (aspect-ratio 1312/420, `radius-lg`), venue logo 170×110 — logo intentionally unlinked (URL pending per CLAUDE.md)
- [x] Sponsor ticker: absent from page entirely

**14. Registration** ✅
- [x] Page header: h1 `text-display-lg` / `text-brand`, centered, pad `spacing-20/16/12` (80/64/48/64)
- [x] 4 tier buckets driven from `src/data/tiers.ts` via `buckets.map()`
- [x] Bucket heading: `text-heading-bucket` / `text-brand` + 2px `accent-default` rule (flex, fills remaining width)
- [x] Bucket gap: `spacing-5` (20px); bucket-to-bucket: `spacing-16` (64px)
- [x] Foursome → `/registration/foursome`; sponsors → `/registration/sponsor?tier={id}`
- [x] Other Ways callout present and styled identically to Home
- [x] **Bug fixed:** `.reg-packages` had `max-width: 1440px` — corrected to `1312px` to match spec ("tier rows desktop 1312 wide")

**15. Register Form — Sponsor** ✅
- [x] Back link: `← Back to sponsor packages`
- [x] 3 sections (01 Company / 02 Player / 03 Comments) — number `heading/section` / title `heading/tier` / 1px rule (hidden on mobile)
- [x] Section card: `bg-panel`, `radius-lg`, `pad: spacing-12` (48px), `gap: spacing-6` (24px)
- [x] `?tier=` param pre-selects via `selected={tier.id === preselected?.id}` on each option
- [x] Field grid: `1fr 1fr` / `gap-x: spacing-6` (24px) on desktop, `1fr` on mobile
- [x] Payment options: Check / Cash / Venmo only — driven from `src/data/forms.ts`
- [x] Submit: `control-lg` (52px), `accent-default` bg, `text-on-accent` — full-width
- [x] Confirmation modal fires before submit, result modal shows outcome

**16. Register Form — Golfer (Foursome)** ✅
- [x] Back link: `← Back to sponsor packages`
- [x] 3 sections (01 Your Info / 02 Team Info / 03 Comments) — same section structure as sponsor form
- [x] Company fields absent from UI — sent as empty hidden inputs so Sheet row shape matches
- [x] Payment options: Check / Cash / Venmo only — driven from `src/data/forms.ts`
- [x] Same modal/submit/JS pattern as sponsor form (`sponsor-form.js`)

**17. Tournament Day** ✅
- [x] Page header: h1 `display/lg` / `text-brand`, `pad: spacing-20/16/12` (80/64/48/64)
- [x] Day-of: `repeat(3, 1fr)` grid, 1312 max-width, `gap: spacing-6` (24px), `pad: 0/64/106px`
- [x] Each card: `bg-panel`, `radius-lg`, icon 44×44, heading `heading/bucket`, `▸` markers in `text-accent`
- [x] Schedule & Format: `1fr auto 1fr`, `gap: 108px`, 2px `accent-display` divider — divider hidden on mobile, sections stack
- [x] Groups: `heading/section` heading, lookup panel (`bg-panel`, `radius-lg`), pending state placeholder — no fake names

**18. Confirmation** ✅
- [x] Page header: "You're registered.", `display/lg` / `text-brand`, centered, `pad: spacing-20/0/spacing-10` (80/0/40/0)
- [x] Receipt: flat list — no fill, no border, no radius. 1px `border-default` hairlines between rows
- [x] Labels: `font-mono` / `text-mono-label` / `text-secondary`, left-aligned
- [x] Values: `body/md-strong` / 600 / `text-primary`, right-aligned; AMOUNT: `display/price` / `text-accent`
- [x] INCLUDED benefits list below receipt with `▸` markers in `text-accent`
- [x] What Happens Next: `repeat(3, 1fr)`, `gap: spacing-8` (32px), numbered `bg-inverse` circles, step titles `heading/h3`, step copy `body/md`
- [x] `noindex` passed to BaseLayout
- [x] Mobile: receipt values stack under labels (`flex-direction: column`); steps stack to 1 column, gap 20px

**19. Contact** ✅
- [x] Page header: "Contact", `display/lg` / `text-brand`, centered, `pad: spacing-20/0/spacing-10` (80/0/40/0); mobile `spacing-8/0/spacing-4` (32/0/16/0)
- [x] Role: `font-mono` / `text-mono-caption` / 500 / uppercase / 0.12em tracking / `text-secondary`
- [x] Name: `font-heading` / `text-display-price` / 700 / `text-brand`
- [x] Director block gap: `spacing-3` (12px); details list gap: `spacing-2` (8px) — match spec exactly
- [x] 3 detail lines: label italic 700 `accent-display`; value `text-primary`, hover → `text-brand`; Instagram link opens in new tab

**20. 404** ✅
- [x] Uses `BaseLayout` — gets ArgyleBand, Nav, Footer automatically
- [x] All styles use token variables: `font-heading`, `text-display-lg`, `text-body-lg`, `text-button-md`, `text-brand`, `accent-hover` — zero hardcoded values

