/**
 * One-off admin script: makes the sponsor tracker Google Sheet as readable
 * as possible — conditional formatting on enum columns, frozen/bold header
 * row, auto-resized columns, text wrapping on long columns, and alternating
 * row banding.
 *
 * Not part of the deployed site — run manually from the fore-grant/ folder:
 *   npm run sheet:format
 *
 * Reads credentials from the local .env file (same vars used by the site).
 * Safe to re-run — banding/conditional rules are cleared and reapplied each
 * time so this script stays idempotent.
 */
import "dotenv/config";
import { google, sheets_v4 } from "googleapis";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

const COLUMN_COUNT = 13; // A–M
const SPONSOR_TIER_COLUMN_INDEX = 2; // column C
const PAYMENT_TYPE_COLUMN_INDEX = 4; // column E
const COMMENTS_COLUMN_INDEX = 12; // column M
const COMPANY_WEBSITE_COLUMN_INDEX = 3; // column D
const FIRST_DATA_ROW_INDEX = 1; // skip header row (row 1 / index 0)

const SPONSOR_TIER_COLORS: Record<string, { red: number; green: number; blue: number }> = {
  "Orange Ribbon Champion — $5,000+": { red: 0.95, green: 0.78, blue: 0.65 },
  "Premium Adopt-A-Hole (Contest Holes) — $1,750": { red: 0.85, green: 0.89, blue: 0.98 },
  "Adopt-a-Hole Sponsor — $1,500": { red: 0.8, green: 0.93, blue: 0.87 },
  '"19th Hole" Lunch Sponsor — $3,500': { red: 0.98, green: 0.87, blue: 0.87 },
  '"Pre-Round Fuel" Breakfast Sponsor — $2,000': { red: 1, green: 0.95, blue: 0.78 },
  "Putting for a Cure Sponsor — $1,000": { red: 0.88, green: 0.83, blue: 0.96 },
  "Tee Sign Sponsor — $250": { red: 0.91, green: 0.91, blue: 0.91 },
  "Foursome Entry — $600": { red: 0.79, green: 0.87, blue: 0.79 },
};

const PAYMENT_TYPE_COLORS: Record<string, { red: number; green: number; blue: number }> = {
  Check: { red: 0.85, green: 0.93, blue: 0.83 },
  "Credit Card": { red: 0.83, green: 0.88, blue: 0.98 },
  Venmo: { red: 0.8, green: 0.93, blue: 0.97 },
  "Invoice Me": { red: 0.97, green: 0.9, blue: 0.75 },
};

async function main() {
  const email = requireEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  const privateKey = requireEnv("GOOGLE_PRIVATE_KEY").replace(/\\n/g, "\n");
  const spreadsheetId = requireEnv("GOOGLE_SHEET_ID");
  const tabName = process.env.GOOGLE_SHEET_TAB || "Sheet1";

  const auth = new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth });

  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
  const sheet = spreadsheet.data.sheets?.find((s) => s.properties?.title === tabName);
  if (!sheet?.properties?.sheetId && sheet?.properties?.sheetId !== 0) {
    throw new Error(`Could not find sheet tab named "${tabName}"`);
  }
  const sheetId = sheet.properties.sheetId;
  const existingConditionalRuleCount = sheet.conditionalFormats?.length ?? 0;
  const existingBandingIds = (sheet.bandedRanges ?? [])
    .map((b) => b.bandedRangeId)
    .filter((id): id is number => id != null);

  const requests: sheets_v4.Schema$Request[] = [
    ...clearExistingConditionalRules(sheetId, existingConditionalRuleCount),
    ...clearExistingBanding(existingBandingIds),
    headerRowFormatting(sheetId),
    freezeHeaderRow(sheetId),
    textWrapRequest(sheetId, COMMENTS_COLUMN_INDEX),
    textWrapRequest(sheetId, COMPANY_WEBSITE_COLUMN_INDEX),
    bandedRowsRequest(sheetId),
    autoResizeColumnsRequest(sheetId),
    ...buildRulesForColumn(sheetId, SPONSOR_TIER_COLUMN_INDEX, SPONSOR_TIER_COLORS),
    ...buildRulesForColumn(sheetId, PAYMENT_TYPE_COLUMN_INDEX, PAYMENT_TYPE_COLORS),
  ];

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests },
  });

  // Auto-resize fits columns to content with zero breathing room, so pad
  // each column's resulting width afterward in a second pass.
  await padColumnWidths(sheets, spreadsheetId, sheetId);

  console.log(`Applied readability formatting to "${tabName}" (${requests.length} requests).`);
}

const COLUMN_RIGHT_PADDING_PX = 24;

async function padColumnWidths(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string,
  sheetId: number,
): Promise<void> {
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId,
    ranges: [],
    fields: "sheets(properties(sheetId),data.columnMetadata.pixelSize)",
    includeGridData: true,
  });
  const sheet = spreadsheet.data.sheets?.find((s) => s.properties?.sheetId === sheetId);
  const columnMetadata = sheet?.data?.[0]?.columnMetadata ?? [];

  const requests: sheets_v4.Schema$Request[] = columnMetadata
    .slice(0, COLUMN_COUNT)
    .map((column, index) => ({
      updateDimensionProperties: {
        range: { sheetId, dimension: "COLUMNS", startIndex: index, endIndex: index + 1 },
        properties: { pixelSize: (column.pixelSize ?? 100) + COLUMN_RIGHT_PADDING_PX },
        fields: "pixelSize",
      },
    }));

  if (requests.length > 0) {
    await sheets.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests } });
  }
}


function clearExistingConditionalRules(sheetId: number, count: number): sheets_v4.Schema$Request[] {
  // Delete from the end backwards so indexes stay valid as rules are removed.
  const requests: sheets_v4.Schema$Request[] = [];
  for (let i = count - 1; i >= 0; i--) {
    requests.push({ deleteConditionalFormatRule: { sheetId, index: i } });
  }
  return requests;
}

function clearExistingBanding(bandedRangeIds: number[]): sheets_v4.Schema$Request[] {
  return bandedRangeIds.map((bandedRangeId) => ({ deleteBanding: { bandedRangeId } }));
}

function headerRowFormatting(sheetId: number): sheets_v4.Schema$Request {
  return {
    repeatCell: {
      range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: COLUMN_COUNT },
      cell: {
        userEnteredFormat: {
          backgroundColor: { red: 0.85, green: 0.9, blue: 0.85 }, // light sage green
          textFormat: { bold: true, foregroundColor: { red: 0.11, green: 0.11, blue: 0.11 } },
          verticalAlignment: "MIDDLE",
        },
      },
      fields: "userEnteredFormat(backgroundColor,textFormat,verticalAlignment)",
    },
  };
}


function freezeHeaderRow(sheetId: number): sheets_v4.Schema$Request {
  return {
    updateSheetProperties: {
      properties: { sheetId, gridProperties: { frozenRowCount: 1 } },
      fields: "gridProperties.frozenRowCount",
    },
  };
}

function textWrapRequest(sheetId: number, columnIndex: number): sheets_v4.Schema$Request {
  return {
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: FIRST_DATA_ROW_INDEX,
        startColumnIndex: columnIndex,
        endColumnIndex: columnIndex + 1,
      },
      cell: { userEnteredFormat: { wrapStrategy: "WRAP" } },
      fields: "userEnteredFormat.wrapStrategy",
    },
  };
}

function bandedRowsRequest(sheetId: number): sheets_v4.Schema$Request {
  // Banding range starts at the actual header row (0) so its built-in
  // "header" band lands on row 1 — not on the first data row.
  return {
    addBanding: {
      bandedRange: {
        range: { sheetId, startRowIndex: 0, startColumnIndex: 0, endColumnIndex: COLUMN_COUNT },
        rowProperties: {
          headerColor: { red: 0.85, green: 0.9, blue: 0.85 },
          firstBandColor: { red: 1, green: 1, blue: 1 },
          secondBandColor: { red: 0.95, green: 0.94, blue: 0.89 },
        },
      },
    },
  };
}


function autoResizeColumnsRequest(sheetId: number): sheets_v4.Schema$Request {
  return {
    autoResizeDimensions: {
      dimensions: { sheetId, dimension: "COLUMNS", startIndex: 0, endIndex: COLUMN_COUNT },
    },
  };
}

function buildRulesForColumn(
  sheetId: number,
  columnIndex: number,
  colorMap: Record<string, { red: number; green: number; blue: number }>,
): sheets_v4.Schema$Request[] {
  return Object.entries(colorMap).map(([value, color]) => ({
    addConditionalFormatRule: {
      rule: {
        ranges: [
          {
            sheetId,
            startRowIndex: FIRST_DATA_ROW_INDEX,
            startColumnIndex: columnIndex,
            endColumnIndex: columnIndex + 1,
          },
        ],
        booleanRule: {
          condition: {
            type: "TEXT_EQ",
            values: [{ userEnteredValue: value }],
          },
          format: { backgroundColor: color },
        },
      },
    },
  }));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
