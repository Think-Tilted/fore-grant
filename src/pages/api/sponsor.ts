import type { APIRoute } from "astro";
import { appendSponsorRow } from "../../lib/sheets";

export const prerender = false;

// captainName, phone, and email are always required.
// companyName and sponsorTier are required for sponsor registrations but
// optional for foursome-only registrations (sent as empty string).
const REQUIRED_FIELDS = ["captainName", "phone", "email"] as const;

export const POST: APIRoute = async ({ request }) => {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid request body.", 400);
  }

  const missing = REQUIRED_FIELDS.filter((field) => !String(body[field] ?? "").trim());
  if (missing.length > 0) {
    return jsonError(`Missing required field(s): ${missing.join(", ")}`, 400);
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
