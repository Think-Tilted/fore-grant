import type { APIRoute } from "astro";
import { appendSponsorRow, uploadLogoToR2 } from "../../lib/sheets";

export const prerender = false;

// captainName, phone, and email are always required.
// companyName and sponsorTier are required for sponsor registrations but
// optional for foursome-only registrations (sent as empty string).
const REQUIRED_FIELDS = ["captainName", "phone", "email"] as const;

// 10 MB file size limit
const MAX_FILE_BYTES = 10 * 1024 * 1024;

// Allowed file extensions — enforced server-side regardless of what the
// browser's accept attribute or Content-Type header reports.
const ALLOWED_EXTENSIONS = new Set([
  ".svg", ".eps", ".ai", ".pdf",
  ".png", ".jpg", ".jpeg", ".webp",
]);

// Allowed MIME types — secondary signal alongside the extension check.
// AI and EPS files frequently arrive as application/octet-stream from
// browsers that don't recognise the format, so that's included.
const ALLOWED_MIME_TYPES = new Set([
  "image/svg+xml",
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
  "application/postscript",        // EPS
  "application/illustrator",       // AI (some browsers)
  "application/octet-stream",      // AI/EPS fallback
]);

export const POST: APIRoute = async ({ request }) => {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError("Invalid request body.", 400);
  }

  const body: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") body[key] = value;
  }

  const missing = REQUIRED_FIELDS.filter((field) => !String(body[field] ?? "").trim());
  if (missing.length > 0) {
    return jsonError(`Missing required field(s): ${missing.join(", ")}`, 400);
  }

  // Logo is required for all sponsor submissions (foursome form never sends this field).
  // The foursome form sends an empty companyName/sponsorTier — use that to detect it.
  const isFoursomeSubmission = !str(body.sponsorTier) || str(body.sponsorTier).toLowerCase().includes("foursome");

  let logoUrl = "";
  const logoFile = formData.get("companyLogo");
  const hasLogo = logoFile instanceof File && logoFile.size > 0;

  if (!hasLogo && !isFoursomeSubmission) {
    return jsonError("A company logo is required for sponsor registrations.", 400);
  }

  if (hasLogo && logoFile instanceof File) {
    // Size check
    if (logoFile.size > MAX_FILE_BYTES) {
      return jsonError("Logo file must be 10 MB or smaller.", 400);
    }

    // Extension check — strip path separators, lowercase
    const rawName  = logoFile.name.replace(/.*[/\\]/, "");
    const extMatch = rawName.match(/\.[^.]+$/);
    const ext      = extMatch ? extMatch[0].toLowerCase() : "";
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return jsonError(
        `File type "${ext || "unknown"}" is not allowed. Please upload SVG, EPS, AI, PDF, PNG, or JPG.`,
        400,
      );
    }

    // MIME type check — secondary signal, allows octet-stream for AI/EPS
    const mimeType = logoFile.type || "application/octet-stream";
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return jsonError(
        "File format not recognised. Please upload SVG, EPS, AI, PDF, PNG, or JPG.",
        400,
      );
    }

    try {
      const buffer = Buffer.from(await logoFile.arrayBuffer());
      // Prefix filename with sanitized company name for easy identification in Drive.
      // e.g. "Acme_Corp_logo.svg"
      const companySlug = str(body.companyName)
        .replace(/[^a-zA-Z0-9]+/g, "_")
        .replace(/^_|_$/g, "")
        .substring(0, 40) || "Sponsor";
      const safeName = rawName.replace(/\s+/g, "_");
      logoUrl = await uploadLogoToR2(buffer, companySlug, safeName, mimeType);
    } catch (err) {
      console.error("Logo upload failed:", err);
      // Non-fatal — proceed without logo rather than blocking the registration
      logoUrl = "";
    }
  }

  try {
    await appendSponsorRow({
      companyName: str(body.companyName),
      sponsorTier: str(body.sponsorTier),
      companyWebsite: normalizeWebsite(str(body.companyWebsite)),
      paymentType: str(body.paymentType),
      captainName: str(body.captainName),
      phone: str(body.phone),
      email: str(body.email),
      player2: str(body.player2),
      player3: str(body.player3),
      player4: str(body.player4),
      comments: str(body.comments),
      logoUrl,
    });
  } catch (err) {
    console.error("Failed to append sponsor row:", err);
    return jsonError("Something went wrong submitting your registration. Please try again or email us directly.", 500);
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

// Sponsors type things like "example.com" or "www.example.com" without a
// scheme — the form field intentionally doesn't require "https://" since
// that's an unreasonable ask. Add it here so the value stored in the Sheet
// is still a clickable, valid URL.
function normalizeWebsite(value: string): string {
  if (!value) return "";
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ ok: false, error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
