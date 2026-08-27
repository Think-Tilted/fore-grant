// Confirmation page — populate receipt from ?tier= URL param at runtime.
//
// The page is statically generated, so Astro.url.searchParams is always empty
// at build time. The tier data is embedded as a JSON island in the page HTML
// (id="tier-data") and the ?tier= param is read from window.location at runtime.
//
// Lives in public/ to satisfy CSP script-src 'self' (no unsafe-inline).

(function () {
  const el = document.getElementById("tier-data");
  if (!el) return;

  const allTiers = JSON.parse(el.textContent);
  const tierParam = new URLSearchParams(location.search).get("tier") ?? "";

  // sponsor-form.js carries the tier as "Name — Price" string in data.sponsorTier.
  // Match on that format first; fall back to matching by id for direct URL links.
  const tier =
    allTiers.find((t) => `${t.name} — ${t.price}` === tierParam) ||
    allTiers.find((t) => t.id === tierParam);

  if (!tier) return;

  // Populate the static receipt shell.
  const set = (id, text) => {
    const node = document.getElementById(id);
    if (node) node.textContent = text;
  };

  set("receipt-package", tier.name);
  set("receipt-amount", tier.price);
  set("receipt-entry", tier.includes);

  // Build the INCLUDED benefits list.
  const includedSection = document.getElementById("receipt-included");
  if (includedSection) {
    includedSection.hidden = false;
    const ul = document.getElementById("receipt-benefits");
    if (ul) {
      ul.innerHTML = "";
      tier.benefits.forEach((b) => {
        const li = document.createElement("li");
        li.innerHTML = `<span class="receipt-marker" aria-hidden="true">▸</span><span>${b}</span>`;
        ul.appendChild(li);
      });
    }
  }
})();
