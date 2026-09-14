// Live sponsor tier availability — fetches real registration counts from
// /api/availability (backed by the Google Sheet) and updates each TierRow's
// badge, CTA, and sold-out state. Runs once on page load, only on the
// Registration page (that's the only page that loads this script).
//
// IMPORTANT: the server renders every open tier in a neutral loading state —
// badge hidden (.tier-row__badge--pending) and a disabled "Checking
// availability…" CTA placeholder (see TierRow.astro). A clickable Register
// Now link is ONLY ever swapped in here, after a trustworthy live count
// confirms the tier has spots left. If the fetch fails, or a tier id is
// missing from the response, that row simply stays in its loading state —
// the user can refresh. We never fail open: showing Register Now without a
// confirmed count is how a full tier gets oversold.
if (!window.__availabilityInit) {
  window.__availabilityInit = true;

  document.addEventListener("DOMContentLoaded", () => {
    const rows = document.querySelectorAll(".tier-row[data-tier-id]");

    fetch("/api/availability")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("bad response"))))
      .then((remainingById) => {
        // Empty object = the API's own try/catch caught a failure server-side.
        // Same untrustworthy state as a network error — leave rows loading.
        if (!remainingById || Object.keys(remainingById).length === 0) return;
        rows.forEach((row) => {
          const tierId = row.dataset.tierId;
          if (!(tierId in remainingById)) return;
          applyAvailability(row, remainingById[tierId]);
        });
      })
      .catch(() => {
        // Network error — rows stay in their loading state.
      });
  });
}

function badgeTone(remaining) {
  if (remaining <= 0) return "soldout";
  if (remaining <= 2) return "limited";
  return "neutral";
}

function badgeLabel(remaining) {
  if (remaining <= 0) return "Sold out";
  if (remaining === 1) return "Only 1 left";
  return `${remaining} left`;
}

function applyAvailability(row, remaining) {
  const soldOut = remaining <= 0;

  if (soldOut) {
    // Sold out: badge removed entirely (not just relabeled) — the red CTA
    // below is the single sold-out signal, avoiding "Sold out" appearing
    // twice in the same card. See TierRow.astro's static markup, which
    // this mirrors for tiers that only become sold-out live.
    row.querySelectorAll(".tier-row__badge, .tier-row__badge-mobile").forEach((badge) => {
      badge.remove();
    });
    row.classList.add("tier-row--soldout");
    row.dataset.open = "false";

    const toggle = row.querySelector(".tier-row__toggle");
    if (toggle) toggle.setAttribute("disabled", "");

    const chevron = row.querySelector(".tier-row__chevron");
    if (chevron) chevron.remove();

    const cta = row.querySelector(".tier-row__cta");
    if (cta) {
      cta.innerHTML =
        '<button class="btn btn-primary btn-md tier-row__cta-soldout" type="button" disabled>Sold Out</button>';
    }
    return;
  }

  // Spots confirmed available: reveal the badge with the live count,
  // remove the loading placeholder, and unhide the server-rendered
  // Register Now link (kept in the markup so it retains its styling).
  const tone = badgeTone(remaining);
  const label = badgeLabel(remaining);
  row.querySelectorAll(".tier-row__badge, .tier-row__badge-mobile").forEach((badge) => {
    badge.textContent = label;
    badge.classList.remove("badge-neutral", "badge-limited", "badge-soldout", "badge-featured");
    badge.classList.add(`badge-${tone}`);
    badge.classList.remove("tier-row__badge--pending");
  });

  const loading = row.querySelector(".tier-row__cta-loading");
  if (loading) loading.remove();

  const register = row.querySelector(".tier-row__cta-register");
  if (register) register.classList.remove("tier-row__cta-register");
}
