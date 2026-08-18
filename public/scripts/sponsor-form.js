// Sponsor registration form submit handler.
//
// This lives in public/ as a plain, unprocessed static file (not under
// src/) so it's guaranteed to be served as a real external asset from our
// own origin, with a genuine <script src="..."> reference. Astro's bundler
// will inline small single-use module scripts referenced from src/ directly
// into the page HTML as an optimization — which breaks our CSP's
// `script-src 'self'` directive (inline script execution is intentionally
// disallowed as a security measure). Living in public/ sidesteps that
// bundling behavior entirely.

const form = document.getElementById("sponsor-form");
const statusEl = document.getElementById("form-status");

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!statusEl) return;

  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  statusEl.textContent = "Submitting…";
  statusEl.className = "mt-4 text-sm text-ink-soft";

  const data = Object.fromEntries(new FormData(form).entries());

  try {
    const res = await fetch("/api/sponsor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();

    if (res.ok && result.ok) {
      statusEl.textContent = "Thank you! Your registration has been received.";
      statusEl.className = "mt-4 text-sm text-fairway font-semibold";
      form.reset();
    } else {
      statusEl.textContent = result.error || "Something went wrong. Please try again.";
      statusEl.className = "mt-4 text-sm text-ribbon font-semibold";
    }
  } catch {
    statusEl.textContent = "Network error. Please try again or email us directly.";
    statusEl.className = "mt-4 text-sm text-ribbon font-semibold";
  } finally {
    submitBtn.disabled = false;
  }
});
