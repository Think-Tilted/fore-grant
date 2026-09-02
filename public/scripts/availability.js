// Live sponsor tier availability — fetches real registration counts from
// /api/availability (backed by the Google Sheet) and updates each TierRow's
// badge + sold-out state. Runs once on page load, only on the Registration
// page (that's the only page that loads this script).
//
// IMPORTANT: the server always initially renders a tier's static `capacity`
// as its badge count (see TierRow.astro / tiers.ts) — that's a real number
// of physical slots, so showing it as truth when we can't confirm it live
// risks overselling if a tier is actually sold out. So if we can't get a
// trustworthy live count for a row (fetch failed entirely, or that specific
// tier id is missing from the response), we HIDE that row's badge rather
// than leave the possibly-stale static number up. Registration itself
// stays open either way — this only ever removes a number, never blocks
// or disables anything.
if (!window.__availabilityInit) {
  window.__availabilityInit = true;

  document.addEventListener("DOMContentLoaded", () => {
    const rows = document.querySelectorAll(".tier-row[data-tier-id]");

    fetch("/api/availability")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("bad response"))))
      .then((remainingById) => {
        // Empty object = the API's own try/catch caught a failure server-side.
        // Same untrustworthy state as a network error — hide every badge.
        if (!remainingById || Object.keys(remainingById).length === 0) {
          rows.forEach(hideBadge);
          return;
        }
        rows.forEach((row) => {
          const tierId = row.dataset.tierId;
          if (!(tierId in remainingById)) {
            hideBadge(row);
            return;
          }
          applyAvailability(row, remainingById[tierId]);
        });
      })
      .catch(() => {
        rows.forEach(hideBadge);
      });
  });
}

function hideBadge(row) {
  row.querySelectorAll(".tier-row__badge, .tier-row__badge-mobile").forEach((badge) => {
    badge.style.display = "none";
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

  const tone = badgeTone(remaining);
  const label = badgeLabel(remaining);
  row.querySelectorAll(".tier-row__badge, .tier-row__badge-mobile").forEach((badge) => {
    badge.textContent = label;
    badge.classList.remove("badge-neutral", "badge-limited", "badge-soldout", "badge-featured");
    badge.classList.add(`badge-${tone}`);
  });
}

