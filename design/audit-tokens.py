#!/usr/bin/env python3
"""
audit-tokens.py — Figma-vs-token cross-check for Fore Grant (design/ROADMAP.md
Phase 5.3 "audit-first" workflow).

WHY THIS EXISTS
----------------
While building the Tournament Day page, sub-labels ("Format", "Start",
"Pace of play"...) were styled black (--color-text-primary) by assumption
instead of reading each node's actual fill in the Figma JSON, where they're
rust/accent (--color-text-accent, #A53422). That was a process failure —
eyeballing a screenshot against a mental model of "how this pattern usually
looks" instead of reading the source data. This script exists so every page
build starts from a generated, exhaustive table of what Figma actually says,
not memory or a spot-check.

WHAT IT DOES
------------
Walks every node on a given Figma page (or all pages), and for each node
that carries visual styling, extracts:
  - fills (color + opacity)              -> matched against --color-* tokens
  - strokes (color + opacity + weight)   -> matched against --color-* tokens
  - text style (family, size, weight,
    letter spacing, line height,
    case, decoration)                    -> matched against the type scale
  - cornerRadius                         -> matched against --radius-* tokens
  - effects (drop shadow / blur / etc.)  -> reported raw (no token axis yet)
  - auto-layout spacing (itemSpacing,
    padding L/R/T/B on FRAME/COMPONENT/
    COMPONENT_SET/INSTANCE with
    layoutMode set)                      -> matched against --spacing-* tokens

Every extracted value is matched against the CURRENT tokens actually defined
in src/styles/global.css (parsed live from that file, not hand-copied), so
this never drifts out of sync with the real token source of truth. Anything
that doesn't match a known token is flagged "NO TOKEN MATCH" — this is
equally useful for catching (a) mistakes on our side and (b) inconsistencies
in the Figma file itself (see the Badge SoldOut/Neutral color collision
noted in design/ROADMAP.md Phase 5.1).

USAGE
-----
    python3 design/audit-tokens.py "Page — Tournament Day"
    python3 design/audit-tokens.py --all
    python3 design/audit-tokens.py --list-pages

Output is written to design/audit-reports/<slug>.md (gitignored — this is a
regenerable working doc, not something to diff in git, same as
figma-file.json itself).
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FIGMA_FILE = ROOT / "design" / "figma-file.json"
CSS_FILE = ROOT / "src" / "styles" / "global.css"
REPORT_DIR = ROOT / "design" / "audit-reports"

# Node types that never carry meaningful standalone styling worth reporting.
SKIP_TYPES = {"VECTOR", "BOOLEAN_OPERATION"}


# ---------------------------------------------------------------------------
# Token loading — parsed live from global.css, never hand-copied
# ---------------------------------------------------------------------------

def load_css_tokens():
    """Parse --color-*, --spacing-*, --radius-* custom properties out of
    global.css's @theme block. Returns dict: {resolved_value: token_name}.

    Resolution handles two shapes seen in the file:
      --color-brand-green: #31532d;                (literal hex)
      --color-bg-page: var(--color-brand-light);    (alias to another token)
      --color-border-subtle: color-mix(in srgb, var(--color-brand-green) 10%, transparent);
    Alias and color-mix values are resolved against already-parsed tokens so
    every semantic token still ends up mapped to a concrete hex+opacity.
    """
    css = CSS_FILE.read_text()
    raw = {}
    for m in re.finditer(r"(--(?:color|spacing|radius|font)-[\w-]+):\s*([^;]+);", css):
        raw[m.group(1)] = m.group(2).strip()

    resolved = {}  # token_name -> ("#RRGGBB", opacity) for colors, or raw string otherwise

    def resolve_color(value, depth=0):
        if depth > 10:
            return None
        value = value.strip()
        hexm = re.match(r"^#([0-9a-fA-F]{6})$", value)
        if hexm:
            return (f"#{hexm.group(1).upper()}", 1.0)
        varm = re.match(r"^var\((--[\w-]+)\)$", value)
        if varm and varm.group(1) in raw:
            return resolve_color(raw[varm.group(1)], depth + 1)
        mixm = re.match(
            r"^color-mix\(in srgb,\s*var\((--[\w-]+)\)\s*([\d.]+)%,\s*transparent\)$", value
        )
        if mixm:
            base = resolve_color(raw.get(mixm.group(1), ""), depth + 1)
            if base:
                hex_, _ = base
                return (hex_, round(float(mixm.group(2)) / 100, 4))
        return None

    for name, value in raw.items():
        if name.startswith("--color-"):
            c = resolve_color(value)
            if c:
                resolved[name] = c
        elif name.startswith("--spacing-") or name.startswith("--radius-"):
            pxm = re.match(r"^(\d+)px$", value)
            if pxm:
                resolved[name] = int(pxm.group(1))
        elif name.startswith("--font-"):
            resolved[name] = value

    return resolved


def build_reverse_maps(tokens):
    """Build fast lookup: hex+opacity -> token name, and px -> token name.

    Spacing and radius are kept as SEPARATE maps even though their raw pixel
    values overlap (e.g. both --spacing-2 and --radius-md are 8px) — merging
    them previously caused itemSpacing/padding findings to be mislabeled as
    radius tokens, which is exactly the kind of silent mis-mapping this
    script exists to prevent elsewhere.
    """
    color_map = {}
    spacing_map = {}
    radius_map = {}
    for name, val in tokens.items():
        if name.startswith("--color-") and isinstance(val, tuple):
            hex_, op = val
            key = (hex_, round(op, 3))
            # Prefer the first/shortest-named token if multiple share a value
            # (e.g. --color-bg-page and --color-brand-light are identical).
            if key not in color_map or len(name) < len(color_map[key]):
                color_map[key] = name
        elif name.startswith("--spacing-") and isinstance(val, int):
            if val not in spacing_map or name < spacing_map[val]:
                spacing_map[val] = name
        elif name.startswith("--radius-") and isinstance(val, int):
            if val not in radius_map or name < radius_map[val]:
                radius_map[val] = name
    return color_map, spacing_map, radius_map



# ---------------------------------------------------------------------------
# Figma value extraction
# ---------------------------------------------------------------------------

def figma_color_to_hex_opacity(paint):
    if paint.get("type") != "SOLID":
        return None
    c = paint["color"]
    hex_ = "#%02X%02X%02X" % (round(c["r"] * 255), round(c["g"] * 255), round(c["b"] * 255))
    opacity = round(paint.get("opacity", 1.0), 3)
    return (hex_, opacity)


def match_color(hex_opacity, color_map, tolerance_levels=(0, 0.02)):
    """Try exact match first, then a small opacity tolerance (Figma opacity
    values from % sliders can carry float noise, e.g. 0.549999 vs 0.55)."""
    hex_, op = hex_opacity
    if (hex_, op) in color_map:
        return color_map[(hex_, op)]
    for tol in tolerance_levels:
        for (mhex, mop), name in color_map.items():
            if mhex == hex_ and abs(mop - op) <= tol:
                return name
    return None


def describe_fills(node, color_map, rows, path):
    for kind, key in (("fill", "fills"), ("stroke", "strokes")):
        paints = node.get(key) or []
        for paint in paints:
            hexop = figma_color_to_hex_opacity(paint)
            if not hexop:
                continue
            token = match_color(hexop, color_map)
            extra = ""
            if kind == "stroke":
                weight = node.get("strokeWeight")
                if weight:
                    extra = f", weight={weight}px"
            rows.append({
                "path": path,
                "property": kind,
                "figma": f"{hexop[0]}"
                + (f" @ {int(hexop[1]*100)}%" if hexop[1] != 1 else "")
                + extra,
                "token": token or "⚠ NO TOKEN MATCH",
                "flag": "" if token else "⚠",
            })


def describe_text(node, color_map, rows, path):
    style = node.get("style", {})
    if not style:
        return
    family = style.get("fontFamily", "?")
    size = style.get("fontSize", "?")
    weight = style.get("fontWeight", "?")
    letter_spacing = style.get("letterSpacing", 0)
    line_height = style.get("lineHeightPx")
    case = style.get("textCase", "ORIGINAL")
    decoration = style.get("textDecoration", "NONE")

    summary = f"{family} {size}px weight={weight}"
    if letter_spacing:
        summary += f" ls={round(letter_spacing, 2)}px"
    if line_height:
        summary += f" lh={round(line_height, 1)}px"
    if case != "ORIGINAL":
        summary += f" case={case}"
    if decoration != "NONE":
        summary += f" decoration={decoration}"

    known_family = "Bitter" in family or "Source Serif" in family
    rows.append({
        "path": path,
        "property": "text style",
        "figma": summary,
        "token": "font-display" if "Bitter" in family else (
            "font-body" if "Source Serif" in family else "⚠ UNKNOWN FONT"
        ),
        "flag": "" if known_family else "⚠",
    })

    text = node.get("characters", "")
    if text:
        preview = text if len(text) <= 60 else text[:57] + "..."
        rows.append({
            "path": path,
            "property": "characters",
            "figma": f'"{preview}"',
            "token": "",
            "flag": "",
        })


def describe_radius(node, radius_map, rows, path):
    radius = node.get("cornerRadius")
    if radius is None:
        return
    token = radius_map.get(round(radius))
    rows.append({
        "path": path,
        "property": "cornerRadius",
        "figma": f"{radius}px",
        "token": token or "⚠ NO TOKEN MATCH",
        "flag": "" if token else "⚠",
    })



def describe_effects(node, rows, path):
    effects = node.get("effects") or []
    for e in effects:
        if not e.get("visible", True):
            continue
        etype = e.get("type")
        detail = ""
        if "color" in e:
            c = e["color"]
            detail = " color=#%02X%02X%02X" % (
                round(c["r"] * 255), round(c["g"] * 255), round(c["b"] * 255)
            )
        if "radius" in e:
            detail += f" radius={e['radius']}px"
        if "offset" in e:
            detail += f" offset=({e['offset'].get('x',0)},{e['offset'].get('y',0)})"
        rows.append({
            "path": path,
            "property": "effect",
            "figma": f"{etype}{detail}",
            "token": "(no effects token axis yet)",
            "flag": "⚠",
        })


def describe_auto_layout(node, spacing_map, rows, path):
    if not node.get("layoutMode"):
        return
    for prop, label in (
        ("itemSpacing", "itemSpacing (gap)"),
        ("paddingLeft", "paddingLeft"),
        ("paddingRight", "paddingRight"),
        ("paddingTop", "paddingTop"),
        ("paddingBottom", "paddingBottom"),
    ):
        val = node.get(prop)
        if val is None:
            continue
        token = spacing_map.get(round(val))
        rows.append({
            "path": path,
            "property": label,
            "figma": f"{val}px",
            "token": token or "⚠ NO TOKEN MATCH",
            "flag": "" if token else "⚠",
        })


# ---------------------------------------------------------------------------
# Tree walk
# ---------------------------------------------------------------------------

def walk(node, color_map, spacing_map, radius_map, rows, path=""):
    ntype = node.get("type")
    name = node.get("name", "?")
    node_path = f"{path} > {name}" if path else name

    if ntype not in SKIP_TYPES:
        describe_fills(node, color_map, rows, node_path)
        describe_radius(node, radius_map, rows, node_path)
        describe_effects(node, rows, node_path)
        describe_auto_layout(node, spacing_map, rows, node_path)
        if ntype == "TEXT":
            describe_text(node, color_map, rows, node_path)

    for child in node.get("children", []):
        walk(child, color_map, spacing_map, radius_map, rows, node_path)



def find_page(doc, name):
    """Find a page/frame to audit by name.

    Historically every real site page was its own top-level Figma "page"
    (e.g. "Page — Tournament Day"). As of the "00 — REVIEW (start here)"
    reorg, the individual page frames were moved to live as top-level
    FRAME children of a single review page instead, so name lookup now
    also has to check one level down into any page's direct children —
    not just the top-level page list — or every "Page — X" lookup breaks.
    """
    for page in doc["children"]:
        if page["name"] == name:
            return page
        for child in page.get("children", []):
            if child["name"] == name and child["type"] == "FRAME":
                return child
    return None



def slugify(name):
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def render_report(page_name, rows):
    lines = [f"# Token Audit — {page_name}", "", f"Generated from `design/figma-file.json` "
             f"against tokens live-parsed from `src/styles/global.css`.", "",
             f"Total findings: {len(rows)}  |  ⚠ Unmatched: "
             f"{sum(1 for r in rows if r['flag'])}", "",
             "| Node path | Property | Figma value | Token | |",
             "|---|---|---|---|---|"]
    for r in rows:
        lines.append(
            f"| `{r['path']}` | {r['property']} | {r['figma']} | {r['token']} | {r['flag']} |"
        )
    return "\n".join(lines) + "\n"


def audit_page(doc, page_name, color_map, spacing_map, radius_map):
    page = find_page(doc, page_name)
    if not page:
        print(f"  ✗ Page not found: {page_name!r}")
        return
    rows = []
    for top in page.get("children", []):
        walk(top, color_map, spacing_map, radius_map, rows)
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    out_path = REPORT_DIR / f"{slugify(page_name)}.md"
    out_path.write_text(render_report(page_name, rows))
    unmatched = sum(1 for r in rows if r["flag"])
    print(f"  ✓ {page_name} -> {out_path.relative_to(ROOT)}  "
          f"({len(rows)} findings, {unmatched} unmatched)")



def main():
    if not FIGMA_FILE.exists():
        print(f"Missing {FIGMA_FILE} — pull it from the Figma API first "
              f"(see ../readme.md).")
        sys.exit(1)

    with open(FIGMA_FILE) as f:
        data = json.load(f)
    doc = data["document"]

    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    if sys.argv[1] == "--list-pages":
        for p in doc["children"]:
            print(p["name"])
            for child in p.get("children", []):
                if child["type"] == "FRAME":
                    print(f"  - {child['name']}")
        return

    tokens = load_css_tokens()
    color_map, spacing_map, radius_map = build_reverse_maps(tokens)

    if sys.argv[1] == "--all":
        for p in doc["children"]:
            audit_page(doc, p["name"], color_map, spacing_map, radius_map)
            for child in p.get("children", []):
                if child["type"] == "FRAME":
                    audit_page(doc, child["name"], color_map, spacing_map, radius_map)
    else:
        audit_page(doc, sys.argv[1], color_map, spacing_map, radius_map)




if __name__ == "__main__":
    main()
