// Tier row accordion toggle (mobile only — desktop CSS forces panels open).
//
// Uses event delegation on document so a single listener covers all tier rows
// regardless of how many <script> tags Astro emits. The script tag guard
// prevents even that one listener from being registered more than once.

if (!window.__tierRowInit) {
  window.__tierRowInit = true;

  // On desktop (≥768) panels are always open — CSS forces grid-template-rows: 1fr.
  // Correct aria-expanded to "true" after all content has parsed so every
  // button is reachable.
  document.addEventListener("DOMContentLoaded", () => {
    if (window.matchMedia("(min-width: 768px)").matches) {
      document.querySelectorAll(".tier-row__toggle").forEach((btn) => {
        btn.setAttribute("aria-expanded", "true");
      });
    }
  });

  // Single delegated listener — works for every tier row, present or future.
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".tier-row__toggle");
    if (!btn) return;
    const row = btn.closest(".tier-row");
    if (!row || row.classList.contains("tier-row--soldout")) return;
    const isOpen = row.dataset.open === "true";
    row.dataset.open = String(!isOpen);
    btn.setAttribute("aria-expanded", String(!isOpen));
  });
}
