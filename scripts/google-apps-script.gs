/**
 * Fore Grant — Google Apps Script
 * Bound to: Google Sheet (Sheet1 — sponsor registrations)
 *
 * v1.0.0  2026-08-27  Internal alert only — no PDF
 * v1.1.0  2026-08-27  Adds HTML → PDF invoice attachment to internal alert
 *
 * Trigger: onChange on the spreadsheet.
 * Dedup:   Column M ("Internal Alert Sent") — set to "Yes" after each send.
 *
 * Sheet columns (A–M, 0-indexed):
 *   0  Timestamp        1  Company Name     2  Sponsor Tier
 *   3  Company Website  4  Payment Type     5  Captain Name
 *   6  Phone            7  Email            8  Player 2
 *   9  Player 3        10  Player 4        11  Comments
 *  12  Internal Alert Sent
 *
 * Workflow:
 *   Registration → Sheet1 row appended → script fires →
 *   builds PDF invoice → sends internal alert with PDF attached →
 *   Jessica forwards PDF to registrant with one click.
 */

// ─── Config ───────────────────────────────────────────────────────────────────

var SPONSOR_SHEET_NAME = "Sheet1";
var ALERT_SENT_COLUMN  = 13;
var INTERNAL_ALERT_TO  = "trevadelman@gmail.com,kadelman760@gmail.com";

// ─── Tier data ────────────────────────────────────────────────────────────────
// Keys must match the exact "Name — Price" string in column C.
// Keep in sync with src/data/tiers.ts.

var TIER_DATA = {
  "Orange Ribbon Champion — $5,000+": {
    price: "$5,000+", includes: "Includes 8 golfers",
    benefits: [
      "Premier logo placement on event signage, flyer, and communication",
      "Recognition in all social media posts & cart name tags",
      "Logo displayed on signage at your designated hole",
      "Complimentary entry for 2 foursomes (8 players); 10 lunch tickets",
      "Speaking opportunity at awards ceremony",
      "Includes Adopt-a-Hole at premier holes",
    ],
  },
  '"19th Hole" Lunch Sponsor — $2,000': {
    price: "$2,000", includes: "Includes 4 golfers",
    benefits: [
      "Premier recognition as the sponsor of the tournament lunch",
      "Logo featured on lunch signage",
      "Acknowledgment during awards and lunch program",
      "Complimentary entry for 1 foursome (4 players)",
      "Promotional items in every golfer's goodie bag",
    ],
  },
  '"Pre-Round Fuel" Breakfast Sponsor — $1,750': {
    price: "$1,750", includes: "Includes 4 golfers",
    benefits: [
      "Premier recognition as the sponsor of the tournament breakfast",
      "Logo featured on breakfast signage",
      "Acknowledgment during awards and lunch program",
      "Complimentary entry for 1 foursome (4 players)",
      "Promotional items in every golfer's goodie bag",
    ],
  },
  "Premium Adopt-A-Hole — Contest Holes — $1,750": {
    price: "$1,750", includes: "Includes 4 golfers",
    benefits: [
      "Drive Out Leukemia (Longest Drive) or Swing for Strength (Closest to the Pin)",
      "Recognition in all social media posts",
      "Logo displayed on signage at your designated hole",
      "Hand out food, drinks, or giveaways at a hole",
      "Complimentary entry for 1 foursome (4 players)",
    ],
  },
  "Adopt-a-Hole Sponsor — $1,500": {
    price: "$1,500", includes: "Includes 4 golfers",
    benefits: [
      "Recognition in all social media posts",
      "Logo displayed on signage at your designated hole",
      "Hand out food, drinks, or giveaways at a hole",
      "Decorate the table with your branding",
      "Complimentary entry for 1 foursome (4 players)",
    ],
  },
  "Putting for a Cure Sponsor — $1,000": {
    price: "$1,000", includes: "Includes 4 golfers",
    benefits: [
      "Host the putting contest",
      "Logo displayed on signage at the putting green",
      "Recognition in event program and website",
      "Complimentary entry for 1 foursome (4 players)",
    ],
  },
  "Tee Sign Sponsor — $250": {
    price: "$250", includes: "Signage only",
    benefits: [
      "Your name or logo on a tee sign at a hole",
      "Promotional items in every golfer's goodie bag",
    ],
  },
  "Foursome Entry — Group Package — $600": {
    price: "$600", includes: "Four players",
    benefits: [
      "18 holes for four players",
      "Cart rental",
      "Breakfast & lunch",
      "Player swag bags",
    ],
  },
};

// ─── Main trigger ─────────────────────────────────────────────────────────────

function onSponsorRowAdded(e) {
  var sheet = e.source.getActiveSheet();
  Logger.log("active sheet name: " + sheet.getName());

  if (sheet.getName() !== SPONSOR_SHEET_NAME) { Logger.log("Exiting: wrong sheet"); return; }

  var lastRow = sheet.getLastRow();
  Logger.log("lastRow: " + lastRow);
  if (lastRow < 2) { Logger.log("Exiting: no data rows"); return; }

  var data = sheet.getRange(2, 1, lastRow - 1, 13).getValues();

  for (var i = 0; i < data.length; i++) {
    var row       = data[i];
    var rowNumber = i + 2;
    var captainName      = row[5];
    var alertAlreadySent = row[12];

    if (!captainName)      { Logger.log("Row " + rowNumber + ": skipping — no captain"); continue; }
    if (alertAlreadySent)  { Logger.log("Row " + rowNumber + ": skipping — already sent"); continue; }

    var timestamp      = row[0];
    var companyName    = row[1];
    var sponsorTier    = row[2];
    var companyWebsite = row[3];
    var paymentType    = row[4];
    var phone          = row[6];
    var email          = row[7];
    var player2        = row[8];
    var player3        = row[9];
    var player4        = row[10];
    var comments       = row[11];

    Logger.log("Row " + rowNumber + ": building invoice for " + captainName);

    var plainBody = [
      "New registration — forward invoice PDF to registrant.", "",
      "Captain:  " + captainName,  "Phone:    " + phone,
      "Email:    " + email, "",
      "Tier:     " + sponsorTier,
      "Company:  " + (companyName    || "—"),
      "Website:  " + (companyWebsite || "—"),
      "Payment:  " + paymentType,
      "Player 2: " + (player2  || "—"),
      "Player 3: " + (player3  || "—"),
      "Player 4: " + (player4  || "—"),
      "Comments: " + (comments || "—"),
      "Time:     " + timestamp,
    ].join("\n");

    var htmlBody = "<div style='font-family:Arial,sans-serif;color:#222;max-width:520px;'>"
      + "<h2 style='color:#2f4a34;margin-bottom:4px;'>New Registration &mdash; " + captainName + "</h2>"
      + "<p style='color:#666;margin-top:0;'>Invoice PDF attached &mdash; forward to registrant.</p>"
      + "<div style='background:#fdece3;border-radius:6px;padding:12px 16px;margin:16px 0;'>"
      + "<p style='margin:0 0 4px;font-size:11px;font-weight:bold;color:#de6a3a;text-transform:uppercase;'>Double-check before forwarding</p>"
      + "<p style='margin:4px 0;'><strong>Phone:</strong> " + phone + "</p>"
      + "<p style='margin:4px 0;'><strong>Email:</strong> " + email + "</p>"
      + "</div>"
      + "<table style='width:100%;border-collapse:collapse;font-size:14px;'>"
      + "<tr><td style='padding:5px 0;color:#666;'>Tier</td><td>"     + sponsorTier           + "</td></tr>"
      + "<tr><td style='padding:5px 0;color:#666;'>Company</td><td>"  + (companyName    || "—") + "</td></tr>"
      + "<tr><td style='padding:5px 0;color:#666;'>Website</td><td>"  + (companyWebsite || "—") + "</td></tr>"
      + "<tr><td style='padding:5px 0;color:#666;'>Payment</td><td>"  + paymentType            + "</td></tr>"
      + "<tr><td style='padding:5px 0;color:#666;'>Captain</td><td>"  + captainName            + "</td></tr>"
      + "<tr><td style='padding:5px 0;color:#666;'>Player 2</td><td>" + (player2  || "—")      + "</td></tr>"
      + "<tr><td style='padding:5px 0;color:#666;'>Player 3</td><td>" + (player3  || "—")      + "</td></tr>"
      + "<tr><td style='padding:5px 0;color:#666;'>Player 4</td><td>" + (player4  || "—")      + "</td></tr>"
      + "<tr><td style='padding:5px 0;color:#666;'>Comments</td><td>" + (comments || "—")      + "</td></tr>"
      + "</table>"
      + "<p style='color:#999;font-size:12px;margin-top:20px;'>Submitted: " + timestamp + "</p>"
      + "</div>";

    var pdf = buildInvoicePdf({
      captainName: captainName, companyName: companyName,
      sponsorTier: sponsorTier, companyWebsite: companyWebsite,
      paymentType: paymentType, phone: phone, email: email,
      player2: player2, player3: player3, player4: player4,
      comments: comments, timestamp: timestamp,
    });

    MailApp.sendEmail({
      to: INTERNAL_ALERT_TO,
      subject: "New registration: " + captainName + " — " + sponsorTier,
      body: plainBody, htmlBody: htmlBody, attachments: [pdf],
    });

    sheet.getRange(rowNumber, ALERT_SENT_COLUMN).setValue("Yes");
    Logger.log("Row " + rowNumber + ": done");
  }
}

// ─── PDF builder (part 1 — setup + HTML header/meta/package) ─────────────────
// Converts an HTML invoice to a PDF blob via Utilities.newBlob().
// Table-based, inline styles only. Georgia ≈ Bitter. Courier New ≈ mono.

function buildInvoicePdf(d) {
  var tier     = TIER_DATA[d.sponsorTier] || {};
  var price    = tier.price    || d.sponsorTier;
  var includes = tier.includes || "—";
  var benefits = tier.benefits || [];
  var firstName   = (d.captainName || "").split(" ")[0] || d.captainName;
  var billTo      = d.companyName || d.captainName;
  var invoiceDate = Utilities.formatDate(new Date(), "America/Los_Angeles", "MMMM d, yyyy");
  var tierParts   = (d.sponsorTier || "").split(" — ");
  var tierName    = tierParts.length > 1 ? tierParts.slice(0, -1).join(" — ") : d.sponsorTier;
  var MONO = "font-family:'Courier New',monospace;font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#5D5C58;";

  var benefitRows = "";
  for (var b = 0; b < benefits.length; b++) {
    benefitRows += "<tr><td style='padding:6px 0;font-size:13px;font-family:Georgia,serif;"
      + "border-bottom:1px solid #CDD3C3;'>&#9658; " + benefits[b] + "</td></tr>";
  }

  var playerRows = ""; var hasPlayers = false;
  var players = [d.player2, d.player3, d.player4];
  for (var p = 0; p < players.length; p++) {
    if (players[p]) {
      hasPlayers = true;
      playerRows += "<tr>"
        + "<td style='width:90px;padding:5px 0;color:#5D5C58;font-size:13px;font-family:Georgia,serif;'>Player " + (p+2) + "</td>"
        + "<td style='padding:5px 0;font-size:13px;font-family:Georgia,serif;'>" + players[p] + "</td></tr>";
    }
  }

  var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"></head>'
    + '<body style="margin:0;padding:0;background:#F4F3E8;">'
    + '<table width="600" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;background:#F4F3E8;">'
    // Header bar
    + '<tr><td bgcolor="#31532D" style="background:#31532D;padding:20px 32px;">'
    + '<p style="margin:0;color:#E4E1C5;font-size:20px;font-weight:700;font-family:Georgia,serif;">Teeing Off Fore Grant</p>'
    + '<p style="margin:4px 0 0;color:#E4E1C5;font-size:13px;font-family:Georgia,serif;">Friday, November 6, 2026 &middot; San Vicente Golf Course, Ramona CA</p>'
    + '</td></tr>'
    // Title + intro
    + '<tr><td style="padding:32px 32px 0;">'
    + '<p style="margin:0;font-size:36px;font-weight:700;color:#31532D;font-family:Georgia,serif;">You&rsquo;re registered.</p>'
    + '<p style="margin:10px 0 0;font-size:14px;color:#5D5C58;font-family:Georgia,serif;line-height:1.6;">Thanks, ' + firstName + ' &mdash; your spot is confirmed.<br>This document is your invoice; keep it for your records.</p>'
    + '<hr style="border:none;border-top:1px solid #CDD3C3;margin:22px 0;">'
    // Invoice meta
    + '<table width="100%" cellpadding="0" cellspacing="0" border="0">'
    + '<tr><td style="width:90px;padding:5px 0;' + MONO + '">Bill To</td><td style="padding:5px 0;font-size:14px;font-family:Georgia,serif;">' + billTo + '</td></tr>'
    + '<tr><td style="padding:5px 0;' + MONO + '">Date</td><td style="padding:5px 0;font-size:14px;font-family:Georgia,serif;">' + invoiceDate + '</td></tr>'
    + '<tr><td style="padding:5px 0;' + MONO + '">For</td><td style="padding:5px 0;font-size:14px;font-family:Georgia,serif;">Teeing Off Fore Grant &mdash; Tournament Sponsorship</td></tr>'
    + '</table>'
    + '<hr style="border:none;border-top:1px solid #CDD3C3;margin:22px 0;">'
    // Package / Total / Due / Entry
    + '<table width="100%" cellpadding="0" cellspacing="0" border="0">'
    + '<tr><td style="width:90px;padding:8px 0;' + MONO + 'border-bottom:1px solid #CDD3C3;">Package</td>'
    + '<td style="padding:8px 0;font-size:14px;text-align:right;font-family:Georgia,serif;border-bottom:1px solid #CDD3C3;">' + tierName + '</td></tr>'
    + '<tr><td style="padding:8px 0;' + MONO + 'border-bottom:1px solid #CDD3C3;">Total</td>'
    + '<td style="padding:8px 0;font-size:28px;font-weight:700;color:#F05323;text-align:right;border-bottom:1px solid #CDD3C3;font-family:Georgia,serif;">' + price + '</td></tr>'
    + '<tr><td style="padding:8px 0;' + MONO + 'border-bottom:1px solid #CDD3C3;">Due</td>'
    + '<td style="padding:8px 0;font-size:13px;text-align:right;font-family:Georgia,serif;border-bottom:1px solid #CDD3C3;">On receipt &mdash; final deadline Friday, October 30, 2026</td></tr>'
    + '<tr><td style="padding:8px 0;' + MONO + 'border-bottom:1px solid #CDD3C3;">Entry</td>'
    + '<td style="padding:8px 0;font-size:13px;text-align:right;font-family:Georgia,serif;border-bottom:1px solid #CDD3C3;">' + includes + '</td></tr>'
    + '</table></td></tr>';

  return buildInvoicePdfPart2(html, d, benefits, benefitRows, hasPlayers, playerRows, MONO);
}

// ─── PDF builder (part 2 — benefits/team/payment/footer + export) ─────────────

function buildInvoicePdfPart2(html, d, benefits, benefitRows, hasPlayers, playerRows, MONO) {
  if (benefitRows) {
    html += '<tr><td style="padding:20px 32px 0;">'
      + '<p style="margin:0 0 8px;' + MONO + '">Included</p>'
      + '<table width="100%" cellpadding="0" cellspacing="0" border="0">' + benefitRows + '</table>'
      + '</td></tr>';
  }
  if (hasPlayers) {
    html += '<tr><td style="padding:20px 32px 0;">'
      + '<p style="margin:0 0 8px;' + MONO + '">Team</p>'
      + '<table width="100%" cellpadding="0" cellspacing="0" border="0">'
      + '<tr><td style="width:90px;padding:5px 0;color:#5D5C58;font-size:13px;font-family:Georgia,serif;">Captain</td>'
      + '<td style="padding:5px 0;font-size:13px;font-family:Georgia,serif;">' + d.captainName + '</td></tr>'
      + playerRows + '</table></td></tr>';
  }

  html += '<tr><td style="padding:0 32px;"><hr style="border:none;border-top:1px solid #CDD3C3;margin:22px 0;"></td></tr>'
    + '<tr><td style="padding:0 32px;">'
    + '<p style="margin:0 0 4px;' + MONO + '">How to Pay</p>'
    + '<p style="margin:0 0 12px;font-size:13px;color:#5D5C58;font-family:Georgia,serif;">Nothing is charged online. Whichever is easiest:</p>'
    + '<table width="100%" cellpadding="0" cellspacing="0" border="0">'
    + '<tr>'
    + '<td style="width:60px;padding:8px 0;vertical-align:top;' + MONO + 'border-top:1px solid #CDD3C3;">Venmo</td>'
    + '<td style="padding:8px 0;font-size:13px;font-family:Georgia,serif;border-top:1px solid #CDD3C3;">@Jessica-Carlson-15</td>'
    + '</tr>'
    + '<tr>'
    + '<td style="padding:8px 0;vertical-align:top;' + MONO + 'border-top:1px solid #CDD3C3;">Check</td>'
    + '<td style="padding:8px 0;font-size:13px;font-family:Georgia,serif;border-top:1px solid #CDD3C3;line-height:1.6;">'
    + 'Payable to Jessica Carlson, with &ldquo;Teeing Off Fore Grant&rdquo; on the memo line.<br>'
    + 'Bring it on the day, or mail it to:<br>'
    + 'Jessica Carlson &middot; 907 Neighborly Lane &middot; Ramona, CA 92065</td>'
    + '</tr>'
    + '<tr>'
    + '<td style="padding:8px 0;vertical-align:top;' + MONO + 'border-top:1px solid #CDD3C3;">Cash</td>'
    + '<td style="padding:8px 0;font-size:13px;font-family:Georgia,serif;border-top:1px solid #CDD3C3;">Hand it to us at check-in on tournament day.</td>'
    + '</tr>'
    + '</table></td></tr>'
    + '<tr><td style="padding:16px 32px 0;">'
    + '<p style="margin:0;font-size:12px;color:#5D5C58;font-family:Georgia,serif;">'
    + 'Teeing Off Fore Grant is a personal fundraiser, not a registered 501(c)(3). '
    + 'Sponsorships and entries are not tax-deductible.</p></td></tr>'
    + '<tr><td style="padding:0 32px;"><hr style="border:none;border-top:1px solid #CDD3C3;margin:22px 0;"></td></tr>'
    + '<tr><td style="padding:0 32px;">'
    + '<p style="margin:0 0 12px;' + MONO + '">What Happens Next</p>'
    + '<table width="100%" cellpadding="0" cellspacing="0" border="0">'
    + '<tr><td style="padding:7px 0;border-top:1px solid #CDD3C3;font-size:13px;font-family:Georgia,serif;"><strong>01 &mdash; Check your inbox.</strong> A copy of this is on its way to you.</td></tr>'
    + '<tr><td style="padding:7px 0;border-top:1px solid #CDD3C3;font-size:13px;font-family:Georgia,serif;"><strong>02 &mdash; Send payment.</strong> Sooner is better. Deadline is Friday, October 30.</td></tr>'
    + '<tr><td style="padding:7px 0;border-top:1px solid #CDD3C3;font-size:13px;font-family:Georgia,serif;"><strong>03 &mdash; See you on the 6th.</strong> Tee times post on the Tournament Day page closer to the event.</td></tr>'
    + '</table></td></tr>'
    + '<tr><td style="padding:24px 32px 0;">'
    + '<p style="margin:0;font-size:13px;color:#5D5C58;font-family:Georgia,serif;">'
    + 'Questions? Reply to this email or reach Jessica at grantstallbattle@gmail.com or 619-344-7687.</p></td></tr>'
    + '<tr><td bgcolor="#31532D" style="background:#31532D;padding:20px 32px;margin-top:32px;">'
    + '<p style="margin:0;color:#E4E1C5;font-size:13px;font-family:Georgia,serif;line-height:1.8;">'
    + 'Teeing Off Fore Grant &middot; Friday, November 6, 2026<br>'
    + 'San Vicente Golf Course &middot; 24157 San Vicente Rd, Ramona, CA 92065<br>'
    + '@GrantsTALLBattle</p></td></tr>'
    + '</table></body></html>';

  var blob = Utilities.newBlob(html, "text/html", "invoice.html");
  var pdf  = blob.getAs("application/pdf");
  pdf.setName("ForeGrant_Invoice_" + d.captainName.replace(/\s+/g, "_") + ".pdf");
  return pdf;
}
