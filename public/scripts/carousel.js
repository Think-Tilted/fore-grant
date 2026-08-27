// Carousel: prev/active/next slide navigation.
//
// Lives in public/ as a plain, unprocessed static file — not under src/ —
// so it's always served as a real external asset from our own origin with
// a genuine <script src="..."> reference. Astro's bundler otherwise inlines
// small single-use module scripts referenced from src/ directly into the
// page HTML, which violates this site's CSP `script-src 'self'` directive
// (no 'unsafe-inline'). Same pattern as sponsor-form.js.

const carousels = document.querySelectorAll("[data-carousel]");

carousels.forEach((carousel) => {
  const total = Number(carousel.dataset.total ?? "0");
  if (total < 1) return;

  // Full image list is embedded in data-images by the Astro component.
  // Reading from the 3 rendered <img> tags would only give us 3 sources —
  // navigation beyond slide 3 would produce blank images.
  const sources = JSON.parse(carousel.dataset.images ?? "[]");

  let current = 0;

  const prevImg = carousel.querySelector("[data-slide='prev']");
  const activeImg = carousel.querySelector("[data-slide='active']");
  const nextImg = carousel.querySelector("[data-slide='next']");
  const counter = carousel.querySelector("[data-counter]");

  function render() {
    const prevIndex = (current - 1 + total) % total;
    const nextIndex = (current + 1) % total;
    prevImg.src = sources[prevIndex] ?? "";
    activeImg.src = sources[current] ?? "";
    nextImg.src = sources[nextIndex] ?? "";
    counter.textContent = `${String(current + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
  }

  carousel.querySelector("[data-action='prev']")?.addEventListener("click", () => {
    current = (current - 1 + total) % total;
    render();
  });
  carousel.querySelector("[data-action='next']")?.addEventListener("click", () => {
    current = (current + 1) % total;
    render();
  });
});
