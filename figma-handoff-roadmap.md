# Figma handoff → build roadmap

**Source of truth:** `figma-handoff/` — every measurement, token, and decision comes from there.
**Stack:** Astro (existing) + Tailwind v4 + hand-rolled components (no React/shadcn).
**Deploy:** Netlify (existing).
**Deviations:** see `DEVIATIONS.md` for every intentional departure from a literal reading of the handoff, with reasoning.

---

## Phase 1 — Token/CSS foundation

- [x] Replace `src/styles/global.css` with tokens from `figma-handoff/tokens.css`
- [x] Wire `figma-handoff/tailwind.css` as the Tailwind v4 `@theme` source
- [x] Port `figma-handoff/components.css` (interaction contracts: nav yield, tier accordion, map embed, group lookup)
- [x] Copy assets from `figma-handoff/assets/` into `public/` (logos, icons, argyle, photos, carousel)
- [x] Verify fonts match spec: Bitter (400/600/700/700i) + Source Serif 4 (400/600/400i)

## Phase 2 — Data layer

- [x] Create `src/data/tiers.ts` from `figma-handoff/data/tiers.json` (single source for Registration page + form select)
- [x] Create `src/data/forms.ts` from `figma-handoff/data/forms.json` (field contracts for both forms)
- [x] Update payment options to match spec: Check / Cash / Venmo (remove Credit Card, Invoice Me)

## Phase 3 — Components

- [x] **ArgyleBand** — rebuild per spec (crop, never squash; `repeat-x`; 3 variants)
- [x] **Button** — 1 component, `variant` (3) × `size` (2); hover = lift, no shadow
- [x] **Badge** — 1 component, `tone` (4) × `reversed` (SoldOut/Neutral identical — flagged for Kyle, carried as-is)
- [x] **Nav** — desktop hero + desktop subpage + mobile bar (72px, hamburger); Home hides logo
- [x] **NavLink** — underline yield via `components.css` global rule + component border-bottom
- [x] **Mobile menu overlay** — `Menu — 390`, full screen, X close, 44×44 hit targets
- [x] **Footer** — padding fixed to LAYOUT-SPEC (pad 64/64/48/64 · gap 40), dividers to 2px accent/display, footer links plain (not NavLink)
- [x] **TierRow** — accordion on mobile (<768), always open on desktop; `grid-template-rows: 0fr → 1fr`
- [x] **Carousel** — counter font swapped to `--font-mono` / `--text-mono-label` tokens, breakpoint fixed to 768
- [x] **FormField** — label to `--font-heading`/`--text-label-field`, control to `--control-md`/`--text-body-md`/`--color-bg-field`, helper to `--text-body-xs`, focus ring to spec (2px border-focus, 2px offset)
- [ ] **Groups table** — DEFERRED TO PHASE 4: needs full rebuild per LAYOUT-SPEC (hole-as-row, A/B columns, 48×48 chips, zebra rows, name lookup highlight). Current PairingGroup component is wrong data model. Will build when Tournament Day page is rebuilt
- [x] Remove dead components: `SponsorTierCard`, old `PairingGroup` (0 instances per spec)
- [x] Icons: strip hardcoded fills → `currentColor`
- [x] Logo: rename variants to `badge` / `negative` with correct asset paths
- [x] SocialIcon: pruned to Instagram only

## Phase 4 — Pages (rebuild against LAYOUT-SPEC.md)

- [x] **Home** — hero, Meet Grant, Sponsor CTA, sponsors ticker (HIDDEN), carousel (28 images), Other Ways, Find Us
- [x] **Registration** — page header, 4 tier buckets driven from `src/data/tiers.ts`, Other Ways
- [x] **Register Form — Sponsor** — 3 sections, back link, tier prefill via `?tier=` param + `data/tiers.ts`; logo upload deferred
- [x] **Register Form — Golfer** — 3 sections, no company info, foursome fields hardcoded via hidden inputs
- [x] **Confirmation** (NEW) — receipt list (not card, per CLAUDE.md 2026-08-26), "What happens next" 3 steps, `noindex`
- [x] **Player Roster** (NEW) — not in nav, `?group=` prefill, inline success state (no route), `noindex`
- [x] **Tournament Day** — day-of cards, schedule/format split, Groups section rebuilt with lookup + pending empty state (real pairings data doesn't exist — see blockers)
- [x] **Contact** — director card with mono/caption role + display/price name, email/phone/Instagram
- [x] **404** — restyled with token system
- [x] **about.astro** — 301 redirect to Home (not in handoff's 7-page architecture)

## Phase 5 — Mobile / responsive

- [ ] Single breakpoint: 768px
- [ ] Type: `text-mobile-*` below 768, `md:text-*` above (display shrinks, body does not)
- [ ] Section rhythm: `--section-y` 80 → 40, `--section-x` 64 → 20
- [ ] Container: 1312 → fluid with 20px gutters
- [ ] Mobile nav: one 72px bar on every page, hamburger right, Home hides logo
- [ ] Tier rows collapse on mobile, ship collapsed, open independently, sold out never expands
- [ ] Groups table ships collapsed on mobile — lookup → matched card → "View all 18 holes" disclosure
- [ ] Carousel collapses to 1-up
- [ ] Form rows single-column
- [ ] Footer columns stack

## Phase 6 — Backend

- [ ] Keep existing `lib/sheets.ts` write path (appendSponsorRow)
- [ ] Add read path for Tournament Day pairings tab (NEW — needs sheet structure decision)
- [ ] Wire Confirmation page — carry tier data through form → API → confirmation
- [ ] Hide player-name fields when tier includes no golfers (Tee Sign Sponsor)
- [ ] Drive tier availability from `tiers.json` (hand-edited, live on redeploy)

## Phase 7 — Confirmation email

- [ ] Build HTML email per `EMAIL-SPEC.md` (600px table layout, inline styles, no CSS vars)
- [ ] Fonts: Georgia fallback (no web fonts in email)
- [ ] Flatten alpha tokens: `text/secondary` → `#5D5C58`, `border/default` → `#CDD3C3`
- [ ] Images: logo + argyle as PNG at 2×, no SVG
- [ ] Merge fields: `{{first_name}}`, `{{invoice_number}}`, `{{tier_name}}`, `{{amount}}`, etc.
- [ ] Payment block: Venmo / Check / Cash — static, no `{{payment_type}}`
- [ ] Tax line: personal fundraiser, not 501(c)(3)
- [ ] Send on form submit via API route, CC Jessica
- [ ] Plain-text fallback

## Phase 8 — Polish & deploy

- [ ] Argyle band final QA (crop behavior at all widths)
- [ ] Nav underline yield QA (browser-only, can't prototype in Figma)
- [ ] Sponsor ticker section (built, hidden — V2)
- [ ] `og:image`, favicon, page titles, meta descriptions
- [ ] Google API credentials as Netlify env vars
- [ ] Custom domain (parked by Kyle — revisit before campaign)
- [ ] Venue URL for San Vicente logo link (unconfirmed — do not invent)

---

## Decisions log

| Date | Decision | Notes |
|------|----------|-------|
| 2026-08-26 | Stay on Astro, no React/shadcn rewrite | Aesthetic is 100% in tokens/CSS; shadcn only provides behavior plumbing |
| 2026-08-26 | Hand-roll accordion + select | `components.css` provides full markup/CSS; vanilla JS for toggle |
| 2026-08-26 | `figma-handoff/` is sole design source of truth | Previous CSS was eyeballed; all values now come from handoff docs |
| 2026-08-26 | Icons: strip hardcoded `fill="#000000"` → `currentColor` | Spec says "fills bound to a token, never `#000000`" (CLAUDE.md). Delivered SVGs have literal black; fix by using `currentColor` and driving color via CSS on the parent element |
| 2026-08-26 | Logo component: rename variants to `badge` / `negative` | Handoff identifies exactly two site logos: `ForeGrant-Badge.svg` (Home hero) and `ForeGrant-hor-Neg.svg` (subpage nav, 165×64). Old "white"/"hero" variants had no corresponding handoff assets and were invented |
| 2026-08-26 | Carousel peek-slide treatment: keep current approach | Handoff gives overall carousel dimensions (1312×506, gap 24) but no explicit prev/next slide sizing/opacity — current 3-slide peek implementation is the best interpretation available; not overriding it |
| 2026-08-26 | Company logo upload field: deferred | `HANDOFF.md` lists it as future enhancement; `forms.json` defines it but current forms already skip it; keep deferred |
| 2026-08-26 | Delete `SponsorTierCard` and old `PairingGroup` | `BUILD-SPEC.md` §5: both had 0 instances, deleted from Figma file. Remove from codebase |
| 2026-08-26 | SocialIcon: prune to Instagram only | `CLAUDE.md`: "Instagram — the only social account; footer is IG-only." X and Facebook variants are dead weight |
| 2026-08-26 | Nav hero: drop 100dvh/scroll-hint invention | Current Nav.astro explicitly documents this as a deviation from Figma. LAYOUT-SPEC.md gives hero nav as `col · pad 48/0/40/0 · gap 32 · center` with 520×378 logo — rebuild to that spec |
| 2026-08-26 | Badge SoldOut/Neutral identical colors | Carried forward as-is per Figma source; flagged as likely oversight — ask Kyle before launch |
| 2026-08-26 | Footer page links are plain `<a>`, not NavLink | NavLink carries underline yield behavior meant for primary nav; footer links are a simple stacked list — plain links with footer-link styling avoid inheriting nav-specific interaction |
| 2026-08-26 | Groups table deferred to Phase 4 | Current PairingGroup component has wrong data model (assumes tee times, no A/B split). Needs full rebuild against LAYOUT-SPEC table structure — tied to Tournament Day page layout, not an isolated component |
| 2026-08-26 | Groups table ships as lookup + pending empty state, not full A/B table | No real pairings data source exists (Sheet tab not built). Per "no silent placeholders" rule, ships honest pending state rather than fake sample names. Full hole-chip/zebra/highlight table is buildable the moment real data exists — deferred to Phase 6 |
| 2026-08-26 | Confirmation follows CLAUDE.md over BUILD-SPEC §8 | CLAUDE.md (2026-08-26, later) says receipt is a list with hairlines, no card; BUILD-SPEC §8 (2026-08-25, earlier) described a Tier Row instance. Later doc wins |
| 2026-08-26 | about.astro, PairingGroup.astro deleted | Not in handoff architecture / explicitly dead per BUILD-SPEC §5 |
| 2026-08-26 | BaseLayout gained a `noindex` prop | Used by Confirmation and Player Roster per LAYOUT-SPEC "Things that are logic, not layout" #2 |
| 2026-08-26 | Moved Carousel/MobileMenu/TierRow scripts to `public/scripts/*.js` | Astro inlines component `<script>` blocks, which violates this site's CSP (`script-src 'self'`, no `unsafe-inline` — see SECURITY.md). Same pattern the codebase already used for sponsor-form.js. **Any new component with client-side JS must follow this pattern** — plain external file in `public/scripts/`, referenced via `<script is:inline src="...">` |
| 2026-08-26 | Home page layout fixes | Nav home-links row was stretching full-width (reused `.nav` class meant for the yield selector, which also carries `width:100%`) — split into a separate `.nav-yield` class. Find Us map was missing the shared 1312 container wrapper every other section uses |
| 2026-08-26 | Meet Grant 470px row — corrected fix | First attempt set `height: 470px` on the grid container, which does NOT constrain an implicit auto row — content (esp. the portrait 1200×1734 His Fight logo at unconstrained max-width) grew past it and overflowed into Sponsor CTA below. Real fix: `grid-template-rows: 470px` on the row (fixes the actual track), `overflow: hidden` + `height: 100%` on the story card, and the His Fight logo constrained by `max-height: 100%` instead of `max-width` so it scales to fit rather than forcing the card taller |
| 2026-08-26 | Meet Grant photo crop position | Default center crop (`object-fit: cover`) clipped the top of Grant's head in the portrait photo — adjusted `object-position: center 20%` to keep his head in frame |
| 2026-08-26 | No Playwright/browser installs without asking first | User directive — verify visually via screenshots the user provides, not automated browser installs |
| 2026-08-26 | Systematic gap audit performed | Grepped every class name in `components.css` for missing visual CSS rules, and every `--text-*` token in `global.css` for zero usage in component/page code. Found: (1) TierRow interior had NO visual styles at all — `components.css` defines behavior/hover only, per BUILD-SPEC §3 the visual styling was always ours to write and we never wrote it; (2) footer tagline was hardcoded 20px instead of the spec's 36px SemiBold (`--text-heading-section-soft`); (3) Badge, day-of markers, schedule markers, tier-row benefit text had no mobile-scaled font-size despite matching mobile tokens existing in the theme. All fixed — see below |
| 2026-08-26 | TierRow given a full interior `<style>` block | Padding, name (`heading/tier` 22px), price (`display/price` 40px), includes (`body/sm`), benefits (`body/md`), markers (`marker/sm`) — desktop + mobile-scaled variants, plus hover-state color overrides matching `components.css`'s dark-on-hover language |
| 2026-08-26 | Footer tagline corrected to `--text-heading-section-soft` | CLAUDE.md: "Section headings are all 36px everywhere... the footer tagline" — was hardcoded at 20px/600 with no token reference |
| 2026-08-26 | Badge, day-of/schedule markers now scale on mobile | Added `--text-mobile-label-badge`, `--text-mobile-marker-md`, `--text-mobile-marker-sm` overrides at the 767px breakpoint — tokens existed in the theme but were never referenced anywhere |
| 2026-08-26 | Started `DEVIATIONS.md` | Tracks every intentional departure from a literal reading of `figma-handoff/`, with reasoning. First entry: Tier row desktop layout (two-column per Figma visual, not the single-column flow implied by `components.css`'s reference markup) — see `DEVIATIONS.md` |

## Blockers / open questions

| Item | Status | Notes |
|------|--------|-------|
| Google Sheet pairings tab structure | ⬜ open | Need to define columns/format for read-back to Tournament Day. Tournament Day Groups section ships as a pending/lookup-disabled state until this exists — full A/B table + mobile collapse UI deferred to Phase 6 |
| about.astro disposition | ⬜ open | Not in handoff's page list — drop or redirect? |
| Venue URL for San Vicente logo | ⬜ open | Do not invent — waiting on confirmation |
| Sponsor logos | ⬜ deferred | Ticker ships hidden (V2) per Kyle's direction |
| Custom domain | ⬜ parked | Kyle to revisit before campaign launch |
| Mailing address for checks | ✅ resolved | 907 Neighborly Lane, Ramona, CA 92065 (per EMAIL-SPEC) |
| Badge SoldOut vs Neutral colors | ⚠️ flag for Kyle | Both have identical fill/text in Figma source — likely oversight, carrying as-is for now |
