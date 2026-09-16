import type { APIRoute } from "astro";
import { getTierRegistrationCounts, getTierAllocations } from "../../lib/sheets";
import { getTierBySheetString } from "../../data/tiers";

export const prerender = false;


/**
 * Live sponsor tier availability — reads real registration counts AND
 * manually-set allocations from the Google Sheet, and returns remaining
 * spots per tier id, e.g.
 * { "orange-ribbon-champion": 1, "adopt-a-hole-sponsor": 9 }.
 *
 * The "Allocations" tab is the live admin control for tiers left — editing
 * a tier's total there (no deploy required) changes what this reports.
 * A tier missing from that tab is omitted from the response entirely
 * rather than falling back to a stale build-time number: per the
 * fail-safe rule in public/scripts/availability.js, an omitted tier just
 * stays in its "Checking availability…" loading state on the page.
 *
 * public/scripts/availability.js fetches this on the Registration page and
 * updates each TierRow's badge/sold-out state. If this call fails for any
 * reason, we return an empty object — the client script no-ops and every
 * row stays in its loading state.
 */
export const GET: APIRoute = async () => {
  try {
    const [counts, allocations] = await Promise.all([
      getTierRegistrationCounts(),
      getTierAllocations(),
    ]);

    const remaining: Record<string, number> = {};
    for (const [tierString, allocation] of Object.entries(allocations)) {
      const tier = getTierBySheetString(tierString);
      if (!tier) continue; // unrecognized tier string — skip rather than guess
      const count = counts[tierString] ?? 0;
      remaining[tier.id] = Math.max(0, allocation - count);
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

