# Confirmation / invoice email — build spec

**Design:** Figma page `05 — EMAIL`, frame `Registration Confirmation — 600` (`320:2249`)
**Build note on canvas:** `323:2273` — read it, it repeats the constraints below
**Sends:** immediately on form submit, both forms, via the existing Google API

This email **is the invoice.** There is no separate invoice document and no third touch.

---

## 1. Delivery

| | |
|---|---|
| `From:` | an event address (not Jessica's personal) |
| `Reply-To:` | Jessica |
| `CC:` | **Jessica** — this is what creates the shared thread |
| Subject | `You're registered — Teeing Off Fore Grant, Nov 6` |
| Preheader | `Your invoice and payment details are inside. Due Friday, Oct 30.` |

The CC is load-bearing. If the email sends *from* Jessica's address the CC is redundant — it
lands in Sent, not her inbox, and every follow-up in `data/email-sequence.md` breaks, because
those are written as replies into this thread.

---

## 2. Hard constraints

- **600px, single column, table-based.** No flexbox, no grid, no CSS custom properties. Outlook
  desktop renders through Word.
- **Inline styles only.** `tokens.css` does not exist here.
- **No hover states, no JavaScript, no web fonts.**
- Transactional, so no unsubscribe is required. Keep the contact line.

### Fonts will not load — use the fallbacks

| Design | Email stack |
|---|---|
| Bitter Bold | `Georgia, 'Times New Roman', serif` · `font-weight:700` |
| Bitter SemiBold | `Georgia, 'Times New Roman', serif` · `font-weight:600` |
| Source Serif 4 | `Georgia, serif` |
| JetBrains Mono | `'Courier New', Courier, monospace` |

Ramp **sizes** still apply — take them from `tailwind.css` and write them inline in px.

### Colour — inline hex, and two must be flattened

| Token | Email hex |
|---|---|
| `bg/page` | `#F4F3E8` |
| `bg/inverse` | `#31532D` |
| `text/primary` | `#000000` |
| `text/inverse` | `#E4E1C5` |
| `accent/display` | `#F05323` |
| `text/secondary` — black 62% | **`#5D5C58`** |
| `border/default` — green 20% | **`#CDD3C3`** |

The last two are alpha in the design. **Do not send `rgba()`** — Outlook drops it and the text
falls back to solid black. Both are flattened against `#F4F3E8`.

### Images

- Logo and argyle as **PNG at 2×**. SVG does not render in Outlook or Gmail.
- The argyle is a **600px-wide slice**, not a repeating background — Outlook ignores
  `background-repeat`.
- Every `<img>` needs `width`, `height` and `alt`.

### Dark mode

Some clients auto-invert. Set `<meta name="color-scheme" content="light">` and give every
table cell an explicit `bgcolor`.

---

## 3. Content, in order

1. **Header bar** — `#31532D`, horizontal negative logo, 165×64
2. **Argyle slice** — 600×24
3. **`You're registered.`** — Georgia bold, 48px
4. **Intro** — `Thanks, {{first_name}} — your spot in Teeing Off Fore Grant is confirmed. This email is your invoice; keep it for your records.`
5. **Invoice meta** — `INVOICE #` · `DATE` · `BILL TO` · `FOR`
6. **`PACKAGE`** / **`TOTAL`** — total in Georgia bold 40px
7. **`DUE`** — `On receipt — final deadline Friday, October 30, 2026`
8. **`ENTRY`** — `{{includes}}`
9. **`INCLUDED`** — benefit rows, repeat 2–6× (see below)
10. **`HOW TO PAY`** — Venmo · Check · Cash, static
11. **Tax line** — personal fundraiser, not a 501(c)(3), not tax-deductible
12. **Thank-you line** — closes warm, below the fine print
13. **`What happens next`** — three numbered steps
14. **Questions line** — reply, or Jessica's email and phone
15. **Footer** — `#31532D`, event, venue, `@GrantsTALLBattle`

Row separators are 1px `#CDD3C3`, full width.

---

## 4. Merge fields

| Field | Source |
|---|---|
| `{{first_name}}` | form |
| `{{invoice_number}}` | sequential, generated at send |
| `{{invoice_date}}` | send date |
| `{{bill_to}}` | company name for sponsors, contact name for foursomes |
| `{{tier_name}}` `{{amount}}` `{{includes}}` | `data/tiers.json`, keyed by the submitted tier |
| `{{benefit_1..n}}` | `data/tiers.json` — **2 to 6 rows**, loop, do not pad |

**Not merge fields — do not template these:**

- **The due date.** Same for everyone: Friday, October 30, 2026. Hardcode it. It changes once a
  year, not once a recipient.
- **How to pay.** All three methods show regardless of what the form captured. Someone who
  selected Check can still Venmo. There is no `{{payment_type}}`.

---

## 5. Payment block — exact copy

```
VENMO   @Jessica-Carlson-15
        → link to https://venmo.com/u/Jessica-Carlson-15

CHECK   Payable to Jessica Carlson, with "Teeing Off Fore Grant" on the memo line.
        Bring it on the day, or mail it to:
        Jessica Carlson · 907 Neighborly Lane · Ramona, CA 92065

CASH    Hand it to us at check-in on tournament day.
```

The memo line is **not boilerplate** — it is how Jessica tells a tournament deposit from
anything else hitting a personal account. Keep it.

**No QR in the email.** The design carries one on the desktop confirmation page only. Most email
is read on a phone and you cannot scan a code with the screen displaying it. The handle is a link.

---

## 6. Testing

Litmus / Email on Acid, or send to real accounts. Minimum matrix:

- **Outlook desktop (Windows)** — the one that breaks. Check fallback fonts, no `rgba`, tables hold
- **Gmail web + Gmail app (Android and iOS)** — clipping past ~102KB, image blocking
- **Apple Mail (macOS and iOS)** — dark mode inversion
- **Plain-text fallback** — generate one; the invoice details must survive

Check with **images blocked**: the invoice must still be readable and payable with no images at all.

---

## 7. Related

- `data/email-sequence.md` — the six plain-text follow-ups that reply into this thread
- `data/tiers.json` — tier names, amounts, benefit counts
- `HANDOFF.md` §3 — the Google Sheets backend
