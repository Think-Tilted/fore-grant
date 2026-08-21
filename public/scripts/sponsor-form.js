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

  let contactHeaderInserted = false;
  for (const { key, label, value } of rows) {
    const isContactField = CONTACT_FIELDS.has(key);

    if (isContactField && !contactHeaderInserted) {
      const notice = document.createElement("p");
      notice.className = "confirm-double-check";
      notice.textContent = "Please double-check your contact info:";
      confirmModalDetails.appendChild(notice);
      contactHeaderInserted = true;
    }

    const row = document.createElement("div");
    row.className = isContactField ? "confirm-row confirm-row-highlight" : "confirm-row";

    const dt = document.createElement("dt");
    dt.className = "confirm-dt";
    dt.textContent = label;

    const dd = document.createElement("dd");
    dd.className = isContactField ? "confirm-dd confirm-dd-highlight" : "confirm-dd";
    dd.textContent = value;

    row.append(dt, dd);
    confirmModalDetails.appendChild(row);
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
    window.location.href = "/tournament-day";
  }
}

form?.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
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

  const data = Object.fromEntries(new FormData(form).entries());

  try {
    const res = await fetch("/api/sponsor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
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
