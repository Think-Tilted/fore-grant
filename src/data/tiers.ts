/**
 * Sponsor tiers — single source of truth.
 * Drives the Registration page AND the form's tier <select>.
 * Source: figma-handoff/data/tiers.json
 *
 * capacity is the total number of slots for a tier — hand-edited here,
 * easily adjustable if the real total changes. It is NOT the live
 * remaining count: /api/availability.ts subtracts actual registration
 * rows from the Google Sheet to compute what's really left, and
 * public/scripts/availability.js updates each tier row's badge on page
 * load. capacity (and soldOut) below is only the static fallback used
 * for the server-rendered page and if that live fetch ever fails.
 */

export interface Tier {
  id: string;
  name: string;
  price: string;
  priceAmount: number;
  pricePlus: boolean;
  includes: string;
  capacity: number;
  featured: boolean;
  soldOut: boolean;
  benefits: string[];
}

export interface TierBucket {
  name: string;
  tiers: Tier[];
}

export const buckets: TierBucket[] = [
  {
    name: "Premium Sponsorship",
    tiers: [{
      id: "orange-ribbon-champion",
      name: "Orange Ribbon Champion",
      price: "$5,000+", priceAmount: 5000, pricePlus: true,
      includes: "Includes 8 golfers", capacity: 2,
      featured: true, soldOut: false,
      benefits: [
        "Premier logo placement on event signage, flyer, and communication",
        "Recognition in all social media posts & cart name tags",
        "Logo displayed on signage at your designated hole",
        "Complimentary entry for 2 foursomes (8 players); 10 lunch tickets",
        "Speaking opportunity at awards ceremony",
        "Includes Adopt-a-Hole at premier holes",
      ],
    }],
  },
  {
    name: "Meal Sponsorships",
    tiers: [
      {
        id: "19th-hole-lunch-sponsor",
        name: '"19th Hole" Lunch Sponsor',
        price: "$2,000", priceAmount: 2000, pricePlus: false,
        includes: "Includes 4 golfers", capacity: 2,
        featured: false, soldOut: false,
        benefits: [
          "Premier recognition as the sponsor of the tournament lunch",
          "Logo featured on lunch signage",
          "Acknowledgment during awards and lunch program",
          "Complimentary entry for 1 foursome (4 players)",
          "Showcase your company or brand by adding promotional items to golfer goodie bags",
        ],
      },
      {
        id: "pre-round-fuel-breakfast-sponsor",
        name: '"Pre-Round Fuel" Breakfast Sponsor',
        price: "$1,750", priceAmount: 1750, pricePlus: false,
        includes: "Includes 4 golfers", capacity: 2,
        featured: false, soldOut: false,
        benefits: [
          "Premier recognition as the sponsor of the tournament breakfast",
          "Logo featured on breakfast signage",
          "Acknowledgment during awards and lunch program",
          "Complimentary entry for 1 foursome (4 players)",
          "Showcase your company or brand by adding promotional items to golfer goodie bags",
        ],
      },
    ],
  },

  {
    name: "Hole Sponsorships",
    tiers: [
      {
        id: "premium-adopt-a-hole-contest-holes",
        name: "Premium Adopt-A-Hole — Contest Holes",
        price: "$1,750", priceAmount: 1750, pricePlus: false,
        includes: "Includes 4 golfers", capacity: 2,
        featured: false, soldOut: false,
        benefits: [
          "Drive Out Leukemia (Longest Drive) or Swing for Strength (Closest to the Pin)",
          "Recognition in all social media posts",
          "Logo displayed on signage at your designated hole",
          "Complimentary entry for 1 foursome (4 players)",
        ],
      },
      {
        id: "adopt-a-hole-sponsor",
        name: "Adopt-a-Hole Sponsor",
        price: "$1,500", priceAmount: 1500, pricePlus: false,
        includes: "Includes 4 golfers", capacity: 9,
        featured: false, soldOut: false,
        benefits: [
          "Recognition in all social media posts",
          "Logo displayed on signage at your designated hole",
          "Decorate your table with branding and promotional items",
          "Complimentary entry for 1 foursome (4 players)",
        ],
      },
      {
        id: "putting-for-a-cure-sponsor",
        name: "Putting for a Cure Sponsor",
        price: "$1,000", priceAmount: 1000, pricePlus: false,
        includes: "Includes 4 golfers", capacity: 1,
        featured: false, soldOut: false,
        benefits: [
          "Host the putting contest",
          "Logo displayed on signage at the putting green",
          "Recognition in event program and website",
          "Complimentary entry for 1 foursome (4 players)",
        ],
      },
      {
        id: "tee-sign-sponsor",
        name: "Tee Sign Sponsor",
        price: "$250", priceAmount: 250, pricePlus: false,
        includes: "Signage only", capacity: 5,
        featured: false, soldOut: false,
        benefits: [
          "Your name or logo on a tee sign at a hole",
          "Showcase your company or brand by adding promotional items to golfer goodie bags",
        ],
      },
    ],
  },
  {
    name: "Golf Entry",
    tiers: [{
      id: "foursome-entry-group-package",
      name: "Foursome Entry — Group Package",
      price: "$600", priceAmount: 600, pricePlus: false,
      includes: "Four players", capacity: 16,
      featured: false, soldOut: false,
      benefits: [
        "18 holes for four players",
        "Cart rental",
        "Breakfast & lunch",
        "Player goodie bags",
      ],
    }],
  },
];

/** Flat list of all tiers across all buckets. */
export const allTiers: Tier[] = buckets.flatMap((b) => b.tiers);

/** Look up a tier by its id. */
export function getTierById(id: string): Tier | undefined {
  return allTiers.find((t) => t.id === id);
}

/** Tier options for the sponsor form <select>, formatted as "Name — Price". */
export const tierSelectOptions: string[] = allTiers
  .filter((t) => t.id !== "foursome-entry-group-package")
  .map((t) => `${t.name} — ${t.price}`);

/**
 * Look up a tier by the exact "Name — Price" string stored in the Google
 * Sheet's Sponsor Tier column (see tierSelectOptions / lib/sheets.ts).
 */
export function getTierBySheetString(value: string): Tier | undefined {
  return allTiers.find((t) => `${t.name} — ${t.price}` === value);
}

/** Whether a tier includes golfers (used to show/hide player name fields). */
export function tierIncludesGolfers(tier: Tier): boolean {
  return tier.includes !== "Signage only";
}

/** Badge tone based on remaining spots (capacity minus any live count). */
export function badgeTone(remaining: number): "soldout" | "limited" | "neutral" {
  if (remaining <= 0) return "soldout";
  if (remaining <= 2) return "limited";
  return "neutral";
}

/** Badge label text based on remaining spots. */
export function badgeLabel(remaining: number): string {
  if (remaining <= 0) return "Sold out";
  if (remaining === 1) return "Only 1 left";
  return `${remaining} left`;
}
