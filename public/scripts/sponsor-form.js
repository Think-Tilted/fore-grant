// Sponsor registration form: confirmation modal + submit handler.
//
// This lives in public/ as a plain, unprocessed static file (not under
// src/) so it's guaranteed to be served as a real external asset from our
// own origin, with a genuine <script src="..."> reference. Astro's bundler
// otherwise inlines small single-use module scripts referenced from src/
// directly into the page HTML as an optimization — which breaks our CSP's
// `script-src 'self'` directive (inline script execution is intentionally
// disallowed as a security measure). Living in public/ sidesteps that
// bundling behavior entirely.

const form = document.getElementById("sponsor-form");

const confirmModal = document.getElementById("confirm-modal");

const confirmModalDetails = document.getElementById("confirm-modal-details");
const confirmModalCancelBtn = document.getElementById("confirm-modal-cancel");
const confirmModalSubmitBtn = document.getElementById("confirm-modal-submit");

const resultModal = document.getElementById("result-modal");
const resultModalIcon = document.getElementById("result-modal-icon");
const resultModalTitle = document.getElementById("result-modal-title");
const resultModalMessage = document.getElementById("result-modal-message");
const resultModalCloseBtn = document.getElementById("result-modal-close");

// Human-readable labels for each form field, in the order we want them
// shown in the confirmation modal. Fields with empty values are skipped.
// Contact info (phone/email) is prioritized right after the captain's name,
// ahead of the additional player names, since that's what's most important
// for the sponsor to double-check before submitting.
const FIELD_LABELS = [
  ["companyName", "Company Name"],
  ["phone", "Phone Number"],
  ["email", "Email Address"],
  ["sponsorTier", "Sponsor Tier"],
  ["companyWebsite", "Company Website"],
  ["paymentType", "Payment Type"],
  ["captainFirstName", "Captain First Name"],
  ["captainLastName", "Captain Last Name"],
  ["player2", "Player 2"],
  ["player3", "Player 3"],
  ["player4", "Player 4"],
  ["comments", "Comments"],
];


// Fields highlighted in the confirmation modal with the "double check"
// prompt — these are the ones we most need the sponsor to get right.
const CONTACT_FIELDS = new Set(["phone", "email"]);


function openConfirmModal(data) {
  if (!confirmModal || !confirmModalDetails) return;

  confirmModalDetails.innerHTML = "";
  for (const [key, label] of FIELD_LABELS) {
    const value = String(data[key] ?? "").trim();
    if (!value) continue;

    const isContactField = CONTACT_FIELDS.has(key);

    // Insert the "please double-check" prompt right before the phone
    // field, so it introduces the contact info block.
    if (key === "phone") {
      const notice = document.createElement("div");
      notice.className = "pt-4";
      const noticeText = document.createElement("p");
      noticeText.className = "text-xs font-medium text-ribbon";
      noticeText.textContent = "Please double-check your contact info below:";
      notice.appendChild(noticeText);
      confirmModalDetails.appendChild(notice);
    }

    const row = document.createElement("div");
    row.className = isContactField
      ? "py-4 rounded-md bg-ribbon/5 -mx-3 px-3"
      : "py-4";

    const dt = document.createElement("dt");
    dt.className = "text-xs font-semibold uppercase tracking-wide text-ink-soft";
    dt.textContent = label;
    const dd = document.createElement("dd");
    dd.className = isContactField
      ? "mt-1.5 text-sm font-semibold text-ink break-words"
      : "mt-1.5 text-sm text-ink break-words";
    dd.textContent = value;
    row.append(dt, dd);
    confirmModalDetails.appendChild(row);
  }



  confirmModal.classList.add("is-open");
  confirmModal.classList.remove("hidden");
}

function closeConfirmModal() {
  if (!confirmModal) return;
  confirmModal.classList.remove("is-open");
  confirmModal.classList.add("hidden");
}

function openResultModal({ success, title, message }) {
  if (!resultModal || !resultModalIcon || !resultModalTitle || !resultModalMessage) return;

  if (success) {
    resultModalIcon.className =
      "mx-auto flex h-14 w-14 items-center justify-center rounded-full text-2xl bg-fairway/10 text-fairway";
    resultModalIcon.textContent = "✓";
  } else {
    resultModalIcon.className =
      "mx-auto flex h-14 w-14 items-center justify-center rounded-full text-2xl bg-ribbon/10 text-ribbon";
    resultModalIcon.textContent = "!";
  }

  resultModalTitle.textContent = title;
  resultModalMessage.textContent = message;

  resultModal.classList.add("is-open");
  resultModal.classList.remove("hidden");
}

function closeResultModal() {
  if (!resultModal) return;
  resultModal.classList.remove("is-open");
  resultModal.classList.add("hidden");
}

form?.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  openConfirmModal(data);
});

confirmModalCancelBtn?.addEventListener("click", () => {
  // Just close the modal — the form is untouched, so every field the
  // sponsor already filled in stays exactly as they left it.
  closeConfirmModal();
});


resultModalCloseBtn?.addEventListener("click", () => {
  closeResultModal();
});

confirmModalSubmitBtn?.addEventListener("click", async () => {
  if (!form || !confirmModalSubmitBtn) return;

  confirmModalSubmitBtn.disabled = true;

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
        message: "Thank you! Your registration has been received. We'll be in touch with next steps.",
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
  }
});
