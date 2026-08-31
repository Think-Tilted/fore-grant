import { google } from "googleapis";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export interface SponsorSubmission {
  companyName: string;
  sponsorTier: string;
  companyWebsite: string;
  paymentType: string;
  captainName: string;
  phone: string;
  email: string;
  player2: string;
  player3: string;
  player4: string;
  comments: string;
  logoUrl: string;
}

function requireEnv(name: string): string {
  const value = import.meta.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function getAuth() {
  const email = requireEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  const privateKey = requireEnv("GOOGLE_PRIVATE_KEY").replace(/\\n/g, "\n");

  return new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

function getR2Client(): S3Client {
  const accountId = requireEnv("CLOUDFLARE_R2_ACCOUNT_ID");
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: requireEnv("CLOUDFLARE_R2_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("CLOUDFLARE_R2_SECRET_ACCESS_KEY"),
    },
  });
}

export async function uploadLogoToR2(
  fileBuffer: Buffer,
  companySlug: string,
  filename: string,
  mimeType: string,
): Promise<string> {
  const client    = getR2Client();
  const bucket    = requireEnv("CLOUDFLARE_R2_BUCKET_NAME");
  const publicUrl = requireEnv("CLOUDFLARE_R2_PUBLIC_URL");

  // Store under logos/{CompanySlug}/filename — creates a per-company folder
  // in the R2 dashboard for easy browsing.
  const key = `logos/${companySlug}/${filename}`;

  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: fileBuffer,
    ContentType: mimeType,
  }));

  return `${publicUrl}/${key}`;
}

export async function appendSponsorRow(submission: SponsorSubmission): Promise<void> {
  const auth   = getAuth();
  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = requireEnv("GOOGLE_SHEET_ID");
  const tab = import.meta.env.GOOGLE_SHEET_TAB || "Sheet1";

  // Column order matches the Sheet header row (A–O):
  // A Timestamp | B Company Name | C Sponsor Tier | D Company Website | E Payment Type |
  // F Captain Name | G Phone | H Email | I Player 2 | J Player 3 | K Player 4 | L Comments |
  // M Internal Alert Sent (Apps Script) | N Invoice Number (Apps Script) | O Logo URL
  const row = [
    new Date().toLocaleString("en-US", {
      timeZone: "America/Los_Angeles",
      month: "short", day: "numeric", year: "numeric",
      hour: "numeric", minute: "2-digit", hour12: true,
    }),
    submission.companyName,
    submission.sponsorTier,
    submission.companyWebsite,
    submission.paymentType,
    submission.captainName,
    submission.phone,
    submission.email,
    submission.player2,
    submission.player3,
    submission.player4,
    submission.comments,
    "",                    // M — Internal Alert Sent, written by Apps Script
    "",                    // N — Invoice Number, written by Apps Script
    submission.logoUrl,    // O — Logo URL
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${tab}!A:O`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [row] },
  });
}
