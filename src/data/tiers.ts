/**
 * Sponsor tiers — single source of truth.
 * Drives the Registration page AND the form's tier <select>.
 * Source: figma-handoff/data/tiers.json
 *
 * spotsRemaining is hand-edited here; it is not a live count.
 * Availability updates on redeploy.
 */

export interface Tier {
  id: string;
  name: string;
  price: string;
  priceAmount: number;
  pricePlus: boolean;
  includes: string;
  spotsRemaining: number;
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
      includes: "Includes 8 golfers", spotsRemaining: 2,
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
        includes: "Includes 4 golfers", spotsRemaining: 2,
        featured: false, soldOut: false,
        benefits: [
          "Premier recognition as the sponsor of the tournament lunch",
          "Logo featured on lunch signage",
          "Acknowledgment during awards and lunch program",
          "Complimentary entry for 1 foursome (4 players)",
          "Promotional items in every golfer's goodie bag",
        ],
      },
      {
        id: "pre-round-fuel-breakfast-sponsor",
        name: '"Pre-Round Fuel" Breakfast Sponsor',
        price: "$1,750", priceAmount: 1750, pricePlus: false,
        includes: "Includes 4 golfers", spotsRemaining: 2,
        featured: false, soldOut: false,
        benefits: [
          "Premier recognition as the sponsor of the tournament breakfast",
          "Logo featured on breakfast signage",
          "Acknowledgment during awards and lunch program",
          "Complimentary entry for 1 foursome (4 players)",
          "Promotional items in every golfer's goodie bag",
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
        includes: "Includes 4 golfers", spotsRemaining: 2,
        featured: false, soldOut: false,
        benefits: [
          "Drive Out Leukemia (Longest Drive) or Swing for Strength (Closest to the Pin)",
          "Recognition in all social media posts",
          "Logo displayed on signage at your designated hole",
          "Hand out food, drinks, or giveaways at a hole",
          "Complimentary entry for 1 foursome (4 players)",
        ],
      },
      {
        id: "adopt-a-hole-sponsor",
        name: "Adopt-a-Hole Sponsor",
        price: "$1,500", priceAmount: 1500, pricePlus: false,
        includes: "Includes 4 golfers", spotsRemaining: 9,
        featured: false, soldOut: false,
        benefits: [
          "Recognition in all social media posts",
          "Logo displayed on signage at your designated hole",
          "Hand out food, drinks, or giveaways at a hole",
          "Decorate the table with your branding",
          "Complimentary entry for 1 foursome (4 players)",
        ],
      },
      {
        id: "putting-for-a-cure-sponsor",
        name: "Putting for a Cure Sponsor",
        price: "$1,000", priceAmount: 1000, pricePlus: false,
        includes: "Includes 4 golfers", spotsRemaining: 1,
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
        includes: "Signage only", spotsRemaining: 5,
        featured: false, soldOut: false,
        benefits: [
          "Your name or logo on a tee sign at a hole",
          "Promotional items in every golfer's goodie bag",
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
      includes: "Four players", spotsRemaining: 11,
      featured: false, soldOut: false,
      benefits: [
        "18 holes for four players",
        "Cart rental",
        "Breakfast & lunch",
        "Player swag bags",
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

/** Whether a tier includes golfers (used to show/hide player name fields). */
export function tierIncludesGolfers(tier: Tier): boolean {
  return tier.includes !== "Signage only";
}

/** Badge tone based on availability. */
export function badgeTone(tier: Tier): "soldout" | "limited" | "neutral" {
  if (tier.soldOut) return "soldout";
  if (tier.spotsRemaining <= 2) return "limited";
  return "neutral";
}

/** Badge label text. */
export function badgeLabel(tier: Tier): string {
  if (tier.soldOut) return "Sold out";
  if (tier.spotsRemaining === 1) return "Only 1 left";
  return `${tier.spotsRemaining} left`;
}
