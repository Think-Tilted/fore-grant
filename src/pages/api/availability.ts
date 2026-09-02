import type { APIRoute } from "astro";
import { getTierRegistrationCounts } from "../../lib/sheets";
import { allTiers, getTierBySheetString } from "../../data/tiers";

export const prerender = false;

/**
 * Live sponsor tier availability — reads real registration counts from the
 * Google Sheet and returns remaining spots per tier id, e.g.
 * { "orange-ribbon-champion": 1, "adopt-a-hole-sponsor": 9 }.
 *
 * public/scripts/availability.js fetches this on the Registration page and
 * updates each TierRow's badge/sold-out state. If this call fails for any
 * reason, we return an empty object — the client script no-ops and the
 * page keeps the static, build-time capacity numbers from tiers.ts.
 */
export const GET: APIRoute = async () => {
  try {
    const counts = await getTierRegistrationCounts();

    const remaining: Record<string, number> = {};
    for (const [tierString, count] of Object.entries(counts)) {
      const tier = getTierBySheetString(tierString);
      if (!tier) continue; // unrecognized tier string — skip rather than guess
      remaining[tier.id] = Math.max(0, tier.capacity - count);
    }

    // Tiers with zero registrations never appear in `counts` — fill them
    // in at full capacity so the client always has a value for every tier.
    for (const tier of allTiers) {
      if (!(tier.id in remaining)) remaining[tier.id] = tier.capacity;
    }

    return new Response(JSON.stringify(remaining), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Failed to compute tier availability:", err);
    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
};
