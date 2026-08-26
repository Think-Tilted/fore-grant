# Teeing Off Fore Grant — design handoff

Charity golf tournament · **Friday, 6 November 2026** · San Vicente Golf Course, Ramona CA

---

## Start here

**Read [`HANDOFF.md`](HANDOFF.md) first.** It is the entry point and links everything else.

You do **not** need an MCP server, a Figma Dev seat, or the REST API. Every measurement and
token is in this repo.

## What's in here

| File | What it's for |
|---|---|
| **`HANDOFF.md`** | **Start here.** How to receive this, what's built, what's still open |
| **`LAYOUT-SPEC.md`** | Every section of every page — padding, gap, width, background token, text style. **This replaces Dev Mode** |
| `BUILD-SPEC.md` | Figma variants → actual code surface. ~15 components, not 100 variants |
| `EMAIL-SPEC.md` | The confirmation/invoice email, fully specced |
| `CLAUDE.md` | Design-system rationale — *why* decisions were made. Not build instructions |
| `design-brief.md` | Original brief and early decisions |
| `ds-state.json` | Node IDs for every frame and component, plus decision history |
| `tokens.css` | Source of truth: colour, spacing, radius, motion |
| `tailwind.css` | The only place Figma names meet utility names. Restates no colour values |
| `components.css` | Interaction contracts utilities express badly |
| `shadcn-adapter.css` | Our tokens → shadcn's variable names |
| `data/tiers.json` | Sponsor tiers. Drives the Registration page **and** the form's tier select |
| `data/forms.json` | Field contract for both register forms |
| `data/email-sequence.md` | The six plain-text follow-up emails |
| `assets/` | Logos, argyle tile, photos, carousel |

## Figma

https://www.figma.com/design/6qiOahJwM68SdswOurWwxL

All screens are on **`00 — REVIEW (start here)`** — desktop across the top, mobile at 390
directly beneath each one. Use it as a picture. The numbers are in `LAYOUT-SPEC.md`.

## The five things most likely to trip you up

1. **No shadows anywhere.** shadcn ships `shadow-sm` on cards, buttons and popovers. Strip it.
   Hover is a 2px lift.
2. **`--input` is not `--border`.** Form controls need 3:1 (`border/control`); decorative borders
   are 1.37:1. shadcn collapses them.
3. **The argyle band crops, never squashes.** Resizing it distorts the tiles.
4. **Mobile tier rows ship collapsed.** The Figma frame shows them expanded so copy can be
   proofed — that is a review convenience, not the first-paint state.
5. **Take shadcn Accordion for the tier rows.** It gives you `aria-expanded`, `aria-controls`,
   independent open state and focus handling. Only four things are genuinely custom — see
   `HANDOFF.md` §7.
