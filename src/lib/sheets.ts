import { google } from "googleapis";

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
}

function requireEnv(name: string): string {
  const value = import.meta.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function getSheetsClient() {
  const email = requireEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  const privateKey = requireEnv("GOOGLE_PRIVATE_KEY").replace(/\\n/g, "\n");

  const auth = new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return google.sheets({ version: "v4", auth });
}

export async function appendSponsorRow(submission: SponsorSubmission): Promise<void> {
  const sheets = getSheetsClient();
  const spreadsheetId = requireEnv("GOOGLE_SHEET_ID");
  const tab = import.meta.env.GOOGLE_SHEET_TAB || "Sheet1";

  // Column order matches the Sheet header row (A–L):
  // Timestamp | Company Name | Sponsor Tier | Company Website | Payment Type |
  // Captain Name | Phone | Email | Player 2 | Player 3 | Player 4 | Comments
  const row = [
    new Date().toISOString(),
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
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${tab}!A:L`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [row] },
  });
}
