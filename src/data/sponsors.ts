// Sponsor logo ticker — Home page.
//
// Source: Figma "Sponsor Logos" canvas (node 617:2550), exported via the
// Figma REST API. Each sponsor is a real logo component sized so its mark
// hugs ~14,400px² of area (per the file's own "adding a sponsor" note),
// never recolored, and meant to sit on a white ground.
//
// Widths/heights below are each component's own natural bounding box
// (all boxes share a 120px height; width varies per mark, matching each
// instance's Hug width in the Figma track) — the <img> renders at exactly
// these dimensions, no clamping, so every mark keeps its designed size.

//
// Asset formats: Figma exported every logo as an "SVG," but 10 of the 12
// were actually raster images (PNG/JPEG) wrapped in an SVG <image> tag —
// several at absurd native resolutions (e.g. 4096×4096, 3300×3300) despite
// rendering at ~240×80px in the ticker. Extracted the embedded raster,
// downscaled to a sane ~480px max edge (2x the largest on-page render
// size, for retina), and re-compressed (oxipng for PNG, quality-85 JPEG
// for the one photographic mark). This cut total payload from ~12.5MB to
// ~800KB with no visible quality loss at the sizes these ever render.
// Only centerline and ramona-rodeo-foundation were genuine vectors —
// those stay as svgo-optimized .svg.

export interface Sponsor {
  id: string;
  name: string;
  src: string;
  width: number;
  height: number;
}

export const sponsors: Sponsor[] = [
  { id: "centerline", name: "Centerline", src: "/logos/sponsors/centerline.svg", width: 108, height: 120 },
  { id: "first-integrity-title", name: "First Integrity Title", src: "/logos/sponsors/first-integrity-title.png", width: 201, height: 120 },
  { id: "heart-and-hooves-therapy", name: "Heart and Hooves Therapy", src: "/logos/sponsors/heart-and-hooves-therapy.png", width: 120, height: 120 },
  { id: "kulten-for-a-cause", name: "Kulten for a Cause", src: "/logos/sponsors/kulten-for-a-cause.png", width: 151, height: 120 },
  { id: "lori-patenaude", name: "Lori Patenaude", src: "/logos/sponsors/lori-patenaude.png", width: 133, height: 120 },
  { id: "michels-pacific-energy", name: "Michels Pacific Energy", src: "/logos/sponsors/michels-pacific-energy.png", width: 230, height: 120 },
  { id: "mountain-valley-ranch", name: "Mountain Valley Ranch", src: "/logos/sponsors/mountain-valley-ranch.jpg", width: 148, height: 120 },
  { id: "pegi", name: "PEGI", src: "/logos/sponsors/pegi.png", width: 205, height: 120 },
  { id: "pitch", name: "Pitch", src: "/logos/sponsors/pitch.png", width: 180, height: 120 },
  { id: "ramona-rodeo-foundation", name: "Ramona Rodeo Foundation", src: "/logos/sponsors/ramona-rodeo-foundation.svg", width: 125, height: 120 },
  { id: "rj-noble", name: "R.J. Noble", src: "/logos/sponsors/rj-noble.png", width: 239, height: 120 },
  { id: "state-31-cornhole", name: "State 31 Cornhole", src: "/logos/sponsors/state-31-cornhole.png", width: 160, height: 120 },
];
