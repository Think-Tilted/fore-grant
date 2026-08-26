# Asset manifest — `SiteAssets/`

Checked against reference counts in the Figma file, not against the folder listing.
Last verified 2026-08-21.

---

## 🔴 STOP — five files are zero bytes

| File | Size |
|---|---|
| `IMG_2173.jpg` | **0 bytes** |
| `IMG_3346.jpg` | **0 bytes** |
| `IMG_3483.jpg` | **0 bytes** |
| `IMG_4066.jpg` | **0 bytes** |
| `IMG_4796.jpg` | **0 bytes** |

The JPEG conversion failed on these five — the files exist but contain nothing. They will not
open, and they are the five largest originals (16–28 MB PNGs), which is consistent with the
converter running out of memory or being interrupted partway.

**Re-convert these five from the HEIC originals**, then confirm each is a few hundred KB rather
than 0. The three that did convert are fine: `image000001.jpg` (359 KB), `IMG_4076.jpg`
(810 KB), `IMG_2053.jpg` (1.9 MB — worth another pass to get nearer 400 KB).

---

## 🟠 `Images/` needs splitting

29 photo files sit in one folder with no way to tell them apart. The site needs:

- **28 carousel images, in order**
- **1 Grant portrait** — used in Meet Grant on desktop, mobile *and* social post 5b

Trevor cannot tell which file is which. Suggested:

```
Images/
  grant.jpg              ← the portrait
  carousel/
    01-587765888….jpg    ← DEFAULT, see below
    02-….jpg
    …                    ← 28 total, numbered = the running order
```

The number prefix is what carries the order. Instagram filenames carry none.

---

## 🟢 Carousel default

**`587765888_17906025711272153_8898890657147230087_n.jpg`** is slide **01**.

Recorded in three places so it cannot be lost: the Figma Carousel component description, the
active-slide layer name, and here. Counter reads `01 / 28`.

---

## Logos — the site needs exactly two

Confirmed by reference count:

| File | Where | Count |
|---|---|---|
| `ForeGrant-hor_Neg.svg` | subpage nav bar — 5 pages × desktop + mobile | **10** |
| `ForeGrant-Badge.svg` | Home hero — desktop + mobile | **2** |

That's the whole list for the website. `ForeGrant_neg.svg` (knockout) is used **13×**, but
**only on the social graphics**, which live in Figma and are exported by Kyle — so it is
correctly absent from a developer pack.

Two more site assets that are not logo components:

| File | Where | Count |
|---|---|---|
| `His Fight Is Our Fight.svg` | Meet Grant, desktop + mobile | 2 |
| `SanV_IMG.png` | under the Home map | 2 |

---

## ✅ Fixed since the first pass

- `facebook-logo.svg`, `x-logo.svg`, `hand-heart.svg` removed — all unused
- `Shirt Back - Badge.svg` → `ForeGrant-Badge.svg`
- `His Fight Is Our Fight.svg` added as a vector
- `Shirt Back - White.svg` dropped — the `White` variant is never used
- HEIC → JPEG (five failed, see above)

---

## ⚠️ Still to confirm

**`Assets/Diamond.svg`** — dated Aug 19, so it looks untouched. If so it still carries
`#32522D / #577233 / #CC4527` against brand `#31532D / #587333 / #CD4628`. Off by 1–2 per
channel: invisible alone, visible against a tokenized page. Replace with the normalised
`argyle-tile.svg`.

**`SanV_IMG.png`** — still worth requesting the official vector from the course. The current
file was lifted off the 2025 flyer, so its greens and blues are CMYK-render approximations of
**someone else's brand**.

---

## Reference counts — what each asset is for

| Asset | Where | Count |
|---|---|---|
| `ForeGrant-hor_Neg.svg` | subpage nav | 10 |
| `ForeGrant-Badge.svg` | Home hero | 2 |
| `His Fight Is Our Fight.svg` | Meet Grant | 2 |
| `Diamond.svg` → argyle | every page, header + footer | 34 |
| `instagram-logo.svg` | footer | 12 |
| `trophy` · `ticket` · `hamburger` | Tournament Day cards | 2 each |
| `golfball.svg` | Sponsor CTA | 6 |
| Grant portrait | Meet Grant + social | 4 |
| Carousel | Home "Last year" | 28 |
| `SanV_IMG.png` | under the Home map | 2 |

## Still outstanding

- Official San Vicente Resort vector
- Sponsor logos — the ticker is built and hidden until they arrive
