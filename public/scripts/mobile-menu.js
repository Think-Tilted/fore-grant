// Mobile nav overlay: open/close + Escape key.
//
// Lives in public/ as a plain, unprocessed static file — see carousel.js
// for why (CSP script-src 'self' blocks Astro's inlined component scripts).

const menu = document.getElementById("mobile-menu");
const toggles = document.querySelectorAll("[data-menu-toggle]");
const closes = document.querySelectorAll("[data-menu-close]");

function openMenu() {
  menu?.removeAttribute("hidden");
  document.body.style.overflow = "hidden";
  toggles.forEach((t) => t.setAttribute("aria-expanded", "true"));
}
function closeMenu() {
  menu?.setAttribute("hidden", "");
  document.body.style.overflow = "";
  toggles.forEach((t) => t.setAttribute("aria-expanded", "false"));
}

toggles.forEach((t) => t.addEventListener("click", openMenu));
closes.forEach((c) => c.addEventListener("click", closeMenu));

menu?.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMenu();
});
