import type { APIRoute } from "astro";
import { appendSponsorRow } from "../../lib/sheets";

export const prerender = false;

const REQUIRED_FIELDS = [
  "companyName",
  "sponsorTier",
  "captainFirstName",
  "captainLastName",
  "phone",
  "email",
] as const;

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
      companyWebsite: str(body.companyWebsite),
      paymentType: str(body.paymentType),
      captainFirstName: str(body.captainFirstName),
      captainLastName: str(body.captainLastName),
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

function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ ok: false, error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
