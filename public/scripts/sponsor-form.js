// Registration form: confirmation modal + submit handler.
//
// Used by both /registration/sponsor and /registration/foursome.
// The form ID is always "reg-form". Field labels are read from the form
// itself via data-label attributes so this script doesn't need to know
// which form it's on.
//
// This lives in public/ as a plain, unprocessed static file (not under
// src/) so it's guaranteed to be served as a real external asset from our
// own origin, with a genuine <script src="..."> reference. Astro's bundler
// otherwise inlines small single-use module scripts referenced from src/
// directly into the page HTML as an optimization — which breaks our CSP's
// `script-src 'self'` directive (inline script execution is intentionally
// disallowed as a security measure). Living in public/ sidesteps that
// bundling behavior entirely.

// Pre-select sponsor tier from ?tier= URL param.
// The HTML `selected` attribute is unreliable for non-first options in some
// browsers — setting .value via JS after load is the reliable approach.
// Uses data-tier-id on each <option> to match by tier id (what the URL carries)
// rather than by the fragile "Name — Price" string.
(function preselectTier() {
  const tierId = new URLSearchParams(location.search).get("tier");
  if (!tierId) return;
  const select = document.getElementById("sponsorTier");
  if (!select) return;
  const matching = Array.from(select.options).find(
    (opt) => opt.dataset.tierId === tierId
  );
  if (matching) select.value = matching.value;
})();

// Tiers like "Tee Sign Sponsor" are signage-only and don't include golfers —
// hide the Player 2/3/4 fields for those tiers so registrants aren't asked
// for players that aren't part of the package. Driven by data-includes-golfers
// on each <option> (set from tierIncludesGolfers() in src/data/tiers.ts).
//
// Name/Phone/Email/Player2/3/4 all live in one shared two-column grid so the
// rows pair up cleanly (2 per row) regardless of which fields are visible.
// If an odd number of fields ends up visible, the last one is stretched to
// full width so it never leaves an empty gap next to it.
(function toggleAdditionalPlayers() {
  const select = document.getElementById("sponsorTier");
  const playerFields = document.getElementById("player-fields");
  const sectionTitle = document.getElementById("player-section-title");
  if (!select || !playerFields) return;

  const optionalPlayerFields = Array.from(playerFields.querySelectorAll(".player-field"));

  function syncVisibility() {
    const selectedOption = select.options[select.selectedIndex];
    const includesGolfers = selectedOption?.dataset.includesGolfers !== "false";

    if (sectionTitle) {
      sectionTitle.textContent = includesGolfers ? "Player Information" : "Contact Information";
    }

    for (const field of optionalPlayerFields) {

      field.style.display = includesGolfers ? "" : "none";
      if (!includesGolfers) {
        field.querySelectorAll("input").forEach((input) => { input.value = ""; });
      }
    }

    // Clear any previous stretch before recomputing — the field that needed
    // stretching last time isn't necessarily the same one this time.
    for (const field of playerFields.children) {
      field.classList.remove("field--full");
    }

    // Stretch the last visible field to full width if the visible count is odd,
    // so pairs of two always fill their row with no dangling empty cell.
    const visibleFields = Array.from(playerFields.children).filter(
      (field) => field.style.display !== "none"
    );

    if (visibleFields.length % 2 !== 0) {
      visibleFields[visibleFields.length - 1].classList.add("field--full");
    }
  }

  select.addEventListener("change", syncVisibility);
  syncVisibility();
})();



const form = document.getElementById("reg-form");

const confirmModal = document.getElementById("confirm-modal");
const confirmModalDetails = document.getElementById("confirm-modal-details");
const confirmModalCancelBtn = document.getElementById("confirm-modal-cancel");
const confirmModalSubmitBtn = document.getElementById("confirm-modal-submit");

const resultModal = document.getElementById("result-modal");
const resultModalIcon = document.getElementById("result-modal-icon");
const resultModalTitle = document.getElementById("result-modal-title");
const resultModalMessage = document.getElementById("result-modal-message");
const resultModalCloseBtn = document.getElementById("result-modal-close");

// Fields highlighted in the confirmation modal with the "double check"
// prompt — these are the ones we most need the registrant to get right.
const CONTACT_FIELDS = new Set(["phone", "email"]);

function buildConfirmRows(data) {
  // Walk the form elements in DOM order to get a natural field ordering.
  // Each input/select/textarea with a data-label attribute is included.
  const rows = [];
  if (!form) return rows;
  const elements = form.querySelectorAll("[data-label]");
  for (const el of elements) {
    const key = el.name;
    const label = el.dataset.label;
    const value = String(data[key] ?? "").trim();
    if (!value || !label) continue;
    rows.push({ key, label, value });
  }
  return rows;
}

function openConfirmModal(data) {
  if (!confirmModal || !confirmModalDetails) return;

  confirmModalDetails.innerHTML = "";
  const rows = buildConfirmRows(data);

  // Separate contact fields from non-contact fields for grouped rendering.
  const contactRows = rows.filter(({ key }) => CONTACT_FIELDS.has(key));
  const otherRows = rows.filter(({ key }) => !CONTACT_FIELDS.has(key));

  function buildRow(label, value, highlight) {
    const row = document.createElement("div");
    row.className = "confirm-row";
    const dt = document.createElement("dt");
    dt.className = "confirm-dt";
    dt.textContent = label;
    const dd = document.createElement("dd");
    dd.className = highlight ? "confirm-dd confirm-dd-highlight" : "confirm-dd";
    dd.textContent = value;
    row.append(dt, dd);
    return row;
  }

  // Render non-contact rows normally.
  for (const { label, value } of otherRows) {
    confirmModalDetails.appendChild(buildRow(label, value, false));
  }

  // Wrap all contact rows in a single orange callout box.
  if (contactRows.length > 0) {
    const notice = document.createElement("p");
    notice.className = "confirm-double-check";
    notice.textContent = "Please double-check your contact info:";
    confirmModalDetails.appendChild(notice);

    const callout = document.createElement("div");
    callout.className = "confirm-contact-callout";
    for (const { label, value } of contactRows) {
      callout.appendChild(buildRow(label, value, true));
    }
    confirmModalDetails.appendChild(callout);
  }

  confirmModal.classList.add("is-open");
  confirmModal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeConfirmModal() {
  if (!confirmModal) return;
  confirmModal.classList.remove("is-open");
  confirmModal.classList.add("hidden");
  document.body.style.overflow = "";
}

function openResultModal({ success, title, message }) {
  if (!resultModal || !resultModalIcon || !resultModalTitle || !resultModalMessage) return;

  if (success) {
    resultModalIcon.className = "result-modal-icon result-modal-icon-success";
    resultModalIcon.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>`;
  } else {
    resultModalIcon.className = "result-modal-icon result-modal-icon-error";
    resultModalIcon.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>`;
  }

  resultModalTitle.textContent = title;
  resultModalMessage.textContent = message;

  // Store whether this was a success so the close handler knows to redirect
  resultModal.dataset.success = success ? "true" : "false";

  resultModal.classList.add("is-open");
  resultModal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeResultModal() {
  if (!resultModal) return;
  const wasSuccess = resultModal.dataset.success === "true";
  resultModal.classList.remove("is-open");
  resultModal.classList.add("hidden");
  document.body.style.overflow = "";
  if (wasSuccess) {
    window.location.href = window.__foreGrantConfirmRedirect || "/confirmation";
  }
}

form?.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  // Represent the file as its filename in the confirm modal (can't JSON-serialize a File)
  const logoFile = form.querySelector("[name='companyLogo']");
  if (logoFile && logoFile.files && logoFile.files[0]) {
    data.companyLogo = logoFile.files[0].name;
  }
  openConfirmModal(data);
});

confirmModalCancelBtn?.addEventListener("click", () => {
  // Just close the modal — the form is untouched, so every field the
  // registrant already filled in stays exactly as they left it.
  closeConfirmModal();
});

resultModalCloseBtn?.addEventListener("click", () => {
  closeResultModal();
});

confirmModalSubmitBtn?.addEventListener("click", async () => {
  if (!form || !confirmModalSubmitBtn) return;

  confirmModalSubmitBtn.disabled = true;
  confirmModalSubmitBtn.textContent = "Submitting…";

  // Use FormData directly so the file input (companyLogo) is included.
  // The API endpoint reads multipart/form-data — do NOT set Content-Type
  // manually; the browser sets it automatically with the correct boundary.
  const formData = new FormData(form);
  const tierParam = String(formData.get("sponsorTier") || formData.get("tierId") || "");

  try {
    const res = await fetch("/api/sponsor", {
      method: "POST",
      body: formData,
    });
    const result = await res.json();

    closeConfirmModal();

    if (res.ok && result.ok) {
      form.reset();
      openResultModal({
        success: true,
        title: "You're Registered!",
        message: "Thank you! Your registration has been received. We'll be in touch with next steps. See you on the course!",
      });
      // Carry the tier through to Confirmation via query param.
      window.__foreGrantConfirmRedirect = tierParam
        ? `/confirmation?tier=${encodeURIComponent(tierParam)}`
        : "/confirmation";
    } else {
      openResultModal({
        success: false,
        title: "Something Went Wrong",
        message: result.error || "Something went wrong submitting your registration. Please try again.",
      });
    }
  } catch {
    closeConfirmModal();
    openResultModal({
      success: false,
      title: "Network Error",
      message: "We couldn't reach the server. Please check your connection and try again, or email us directly.",
    });
  } finally {
    confirmModalSubmitBtn.disabled = false;
    confirmModalSubmitBtn.textContent = "Confirm & Submit";
  }
});
