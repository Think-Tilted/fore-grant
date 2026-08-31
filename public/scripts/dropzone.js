// Logo dropzone — drag-and-drop, filename feedback, client-side validation.
// Lives in public/ to satisfy CSP script-src 'self' (no unsafe-inline).

(function () {
  var dropzone   = document.getElementById("logo-dropzone");
  var input      = document.getElementById("companyLogo");
  var inner      = dropzone && dropzone.querySelector(".logo-dropzone-inner");
  var filenameEl = document.getElementById("logo-filename");
  var errorEl    = document.getElementById("logo-error");

  if (!dropzone || !input || !filenameEl) return;

  var ALLOWED_EXTENSIONS = [".svg", ".eps", ".ai", ".pdf", ".png", ".jpg", ".jpeg", ".webp"];
  var MAX_BYTES = 10 * 1024 * 1024; // 10 MB

  function getExt(name) {
    var m = name.match(/\.[^.]+$/);
    return m ? m[0].toLowerCase() : "";
  }

  function validate(file) {
    if (file.size > MAX_BYTES) {
      return "File is too large. Maximum size is 10 MB.";
    }
    var ext = getExt(file.name);
    if (ALLOWED_EXTENSIONS.indexOf(ext) === -1) {
      return "File type not allowed. Please upload SVG, EPS, AI, PDF, PNG, or JPG.";
    }
    return null; // valid
  }

  function showError(msg) {
    if (!errorEl) return;
    errorEl.textContent = msg;
    errorEl.hidden = false;
    dropzone.classList.add("is-error");
  }

  function clearError() {
    if (!errorEl) return;
    errorEl.textContent = "";
    errorEl.hidden = true;
    dropzone.classList.remove("is-error");
  }

  function showFilename(name) {
    filenameEl.textContent = "\u2714 " + name;
    filenameEl.hidden = false;
    if (inner) inner.hidden = true;
    clearError();
  }

  function clearFile() {
    input.value = "";
    filenameEl.hidden = true;
    if (inner) inner.hidden = false;
    clearError();
  }

  function handleFile(file) {
    var err = validate(file);
    if (err) {
      // Clear the input so invalid file isn't submitted
      input.value = "";
      showError(err);
      filenameEl.hidden = true;
      if (inner) inner.hidden = false;
      return;
    }
    showFilename(file.name);
  }

  input.addEventListener("change", function () {
    if (input.files && input.files[0]) {
      handleFile(input.files[0]);
    } else {
      clearFile();
    }
  });

  // Click on filename/checkmark clears the selection so they can re-pick
  filenameEl.addEventListener("click", function () {
    clearFile();
  });
  filenameEl.style.cursor = "pointer";
  filenameEl.title = "Click to remove and choose a different file";

  dropzone.addEventListener("dragover", function (e) {
    e.preventDefault();
    dropzone.classList.add("is-dragover");
  });

  dropzone.addEventListener("dragleave", function (e) {
    // Only clear if leaving the dropzone itself, not a child element
    if (!dropzone.contains(e.relatedTarget)) {
      dropzone.classList.remove("is-dragover");
    }
  });

  dropzone.addEventListener("drop", function (e) {
    e.preventDefault();
    dropzone.classList.remove("is-dragover");
    var files = e.dataTransfer && e.dataTransfer.files;
    if (files && files[0]) {
      var dt = new DataTransfer();
      dt.items.add(files[0]);
      input.files = dt.files;
      handleFile(files[0]);
    }
  });

  // Block form submission if no logo selected — required for sponsor forms.
  var form = dropzone.closest("form");
  if (form) {
    form.addEventListener("submit", function (e) {
      if (!input.files || !input.files[0]) {
        e.preventDefault();
        e.stopImmediatePropagation();
        showError("A company logo is required. Please choose a file.");
        dropzone.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, true); // capture phase — runs before sponsor-form.js submit handler
  }
})();
