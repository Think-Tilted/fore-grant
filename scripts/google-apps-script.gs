/**
 * Fore Grant — Google Apps Script
 * Bound to: Google Sheet (Sheet1 — sponsor registrations)
 *
 * v1.0.0  2026-08-27  Internal alert only — no PDF
 * v1.1.0  2026-08-27  Adds HTML → PDF invoice attachment to internal alert
 * v1.2.0  2026-08-27  PDF content matches EMAIL-SPEC exactly: invoice # / FOR row /
 *                     orange accent bar / · bullets / "What happens next" with orange
 *                     step numbers / "Send your logo" step for sponsors / thank-you line /
 *                     shotgun start in footer / isFoursome flag collapses step 02
 * v1.3.0  2026-08-27  Internal alert email gets full brand treatment: dark green header,
 *                     orange accent bar, Georgia/Courier type, orange-bordered contact
 *                     callout, mono labels, right-aligned values, empty player rows omitted
 * v1.4.0  2026-08-27  Sequential invoice numbers (FG-001, FG-002...) generated in trigger,
 *                     written to sheet column N; passed into PDF so number is consistent.
 *                     Email body rewritten as registrant-ready (no internal language).
 *                     Subject line carries phone + email for Jess to verify at a glance.
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

var SPONSOR_SHEET_NAME    = "Sheet1";
var ALERT_SENT_COLUMN     = 13;   // column M
var INVOICE_NUMBER_COLUMN = 14;   // column N
var INTERNAL_ALERT_TO     = "trevadelman@gmail.com,kadelman760@gmail.com";

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

  var data = sheet.getRange(2, 1, lastRow - 1, 14).getValues();

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

    // Sequential invoice number — scan column N for highest existing FG-NNN and increment.
    // Reads all 14 columns already fetched; col index 13 = column N.
    var maxNum = 0;
    for (var j = 0; j < data.length; j++) {
      var existing = String(data[j][13] || "");
      var match = existing.match(/^FG-(\d+)$/);
      if (match) maxNum = Math.max(maxNum, parseInt(match[1], 10));
    }
    var invoiceNum = "FG-" + String(maxNum + 1).padStart(3, "0");
    Logger.log("Row " + rowNumber + ": invoice number " + invoiceNum);

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

    var MONO_I = "font-family:'Courier New',monospace;font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#5D5C58;";
    var BODY_I = "font-family:Georgia,serif;font-size:14px;color:#000000;";
    var ROW_I  = "border-bottom:1px solid #CDD3C3;";
    var firstName = (captainName || "").split(" ")[0] || captainName;

    var htmlBody = "<table width='600' cellpadding='0' cellspacing='0' border='0' style='margin:0 auto;background:#F4F3E8;font-family:Georgia,serif;'>"

      // Header bar
      + "<tr><td bgcolor='#31532D' style='background:#31532D;padding:20px 32px;'>"
      + "<p style='margin:0;color:#E4E1C5;font-size:20px;font-weight:700;font-family:Georgia,serif;'>Teeing Off Fore Grant</p>"
      + "<p style='margin:4px 0 0;color:#E4E1C5;font-size:13px;font-family:Georgia,serif;'>Friday, November 6, 2026 &middot; San Vicente Golf Course, Ramona CA</p>"
      + "</td></tr>"

      // Orange accent bar
      + "<tr><td bgcolor='#F05323' style='background:#F05323;height:4px;font-size:1px;line-height:4px;'>&nbsp;</td></tr>"

      // Title — registrant-facing
      + "<tr><td style='padding:32px 32px 0;'>"
      + "<p style='margin:0;font-size:36px;font-weight:700;color:#31532D;font-family:Georgia,serif;line-height:1.1;'>You&rsquo;re registered.</p>"
      + "<p style='margin:12px 0 0;font-size:14px;color:#5D5C58;font-family:Georgia,serif;line-height:1.7;'>"
      + "Thanks, " + firstName + " &mdash; your spot in Teeing Off Fore Grant is confirmed. "
      + "Your invoice is attached to this email; keep it for your records.</p>"
      + "<hr style='border:none;border-top:1px solid #CDD3C3;margin:22px 0;'>"

      // Package summary
      + "<table width='100%' cellpadding='0' cellspacing='0' border='0'>"
      + "<tr><td style='padding:7px 0;" + MONO_I + ROW_I + "'>Package</td>"
      + "<td style='padding:7px 0;" + BODY_I + ROW_I + "text-align:right;'>" + sponsorTier + "</td></tr>"
      + "<tr><td style='padding:7px 0;" + MONO_I + ROW_I + "'>Invoice</td>"
      + "<td style='padding:7px 0;" + BODY_I + ROW_I + "text-align:right;'>" + invoiceNum + "</td></tr>"
      + "<tr><td style='padding:7px 0;" + MONO_I + ROW_I + "'>Due</td>"
      + "<td style='padding:7px 0;font-size:13px;font-family:Georgia,serif;color:#000;" + ROW_I + "text-align:right;'>On receipt &mdash; final deadline Friday, October 30, 2026</td></tr>"
      + "</table>"
      + "<hr style='border:none;border-top:1px solid #CDD3C3;margin:22px 0;'>"

      // What happens next — brief
      + "<p style='margin:0 0 14px;font-size:16px;font-weight:700;color:#31532D;font-family:Georgia,serif;'>What happens next</p>"
      + "<p style='margin:0 0 8px;font-size:14px;color:#000;font-family:Georgia,serif;line-height:1.7;'>"
      + "<strong style='color:#F05323;'>01 &mdash;</strong> Your invoice is attached. Keep it &mdash; it has your payment details.</p>"
      + "<p style='margin:0 0 8px;font-size:14px;color:#000;font-family:Georgia,serif;line-height:1.7;'>"
      + "<strong style='color:#F05323;'>02 &mdash;</strong> Send payment by Friday, October 30 via Venmo (@Jessica-Carlson-15), check, or cash.</p>"
      + "<p style='margin:0;font-size:14px;color:#000;font-family:Georgia,serif;line-height:1.7;'>"
      + "<strong style='color:#F05323;'>03 &mdash;</strong> Tee times go out closer to the day. See you on November 6!</p>"
      + "<hr style='border:none;border-top:1px solid #CDD3C3;margin:22px 0;'>"

      // Questions
      + "<p style='margin:0;font-size:13px;color:#5D5C58;font-family:Georgia,serif;'>"
      + "Questions? Reply to this email or reach Jessica at grantstallbattle@gmail.com &middot; 619-344-7687</p>"
      + "</td></tr>"

      // Footer bar
      + "<tr><td bgcolor='#31532D' style='background:#31532D;padding:16px 32px;'>"
      + "<p style='margin:0;color:#E4E1C5;font-size:13px;font-family:Georgia,serif;line-height:1.8;'>"
      + "Teeing Off Fore Grant &middot; Friday, November 6, 2026<br>"
      + "San Vicente Golf Course &middot; Ramona, CA &middot; 9:00 AM shotgun start<br>"
      + "@GrantsTALLBattle</p>"
      + "</td></tr>"

      + "</table>";

    var pdf = buildInvoicePdf({
      captainName: captainName, companyName: companyName,
      sponsorTier: sponsorTier, companyWebsite: companyWebsite,
      paymentType: paymentType, phone: phone, email: email,
      player2: player2, player3: player3, player4: player4,
      comments: comments, timestamp: timestamp,
      invoiceNum: invoiceNum,
    });

    MailApp.sendEmail({
      to: INTERNAL_ALERT_TO,
      // Subject carries contact info so Jess can verify before opening/forwarding
      subject: invoiceNum + " — " + captainName + " (" + phone + " · " + email + ")",
      body: plainBody, htmlBody: htmlBody, attachments: [pdf],
    });

    sheet.getRange(rowNumber, ALERT_SENT_COLUMN).setValue("Yes");
    sheet.getRange(rowNumber, INVOICE_NUMBER_COLUMN).setValue(invoiceNum);
    Logger.log("Row " + rowNumber + ": done — " + invoiceNum);
  }
}

// ─── PDF builder (part 1 — setup + HTML header/meta/package) ─────────────────
// v1.1.0 — matches EMAIL-SPEC content order exactly.
// Table-based, inline styles only. Georgia ≈ Bitter. Courier New ≈ mono.

function buildInvoicePdf(d) {
  var tier        = TIER_DATA[d.sponsorTier] || {};
  var price       = tier.price    || d.sponsorTier;
  var includes    = tier.includes || "—";
  var benefits    = tier.benefits || [];
  var firstName   = (d.captainName || "").split(" ")[0] || d.captainName;
  var billTo      = d.companyName || d.captainName;
  var now         = new Date();
  var invoiceDate = Utilities.formatDate(now, "America/Los_Angeles", "MMMM d, yyyy");
  var invoiceNum  = d.invoiceNum || "FG-000";
  var tierParts   = (d.sponsorTier || "").split(" — ");
  var tierName    = tierParts.length > 1 ? tierParts.slice(0, -1).join(" — ") : d.sponsorTier;
  var isFoursome  = (d.sponsorTier || "").indexOf("Foursome") !== -1;
  var MONO = "font-family:'Courier New',monospace;font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#5D5C58;";
  var BODY = "font-family:Georgia,serif;font-size:14px;color:#000000;";
  var RULE = "border:none;border-top:1px solid #CDD3C3;margin:22px 0;";

  // Benefit rows — · bullet per spec
  var benefitRows = "";
  for (var b = 0; b < benefits.length; b++) {
    benefitRows += "<tr><td style='padding:5px 0;font-size:14px;font-family:Georgia,serif;"
      + "border-bottom:1px solid #CDD3C3;'>&middot;&nbsp;&nbsp;" + benefits[b] + "</td></tr>";
  }

  // Player rows — skip empties
  var playerRows = ""; var hasPlayers = false;
  var players = [d.player2, d.player3, d.player4];
  for (var p = 0; p < players.length; p++) {
    if (players[p]) {
      hasPlayers = true;
      playerRows += "<tr>"
        + "<td style='width:90px;padding:4px 0;color:#5D5C58;font-size:13px;font-family:Georgia,serif;'>Player " + (p+2) + "</td>"
        + "<td style='padding:4px 0;font-size:13px;font-family:Georgia,serif;'>" + players[p] + "</td></tr>";
    }
  }

  var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"></head>'
    + '<body style="margin:0;padding:0;background:#F4F3E8;">'
    + '<table width="600" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;background:#F4F3E8;">'

    // Header bar — dark green
    + '<tr><td bgcolor="#31532D" style="background:#31532D;padding:24px 40px;">'
    + '<p style="margin:0;color:#E4E1C5;font-size:22px;font-weight:700;font-family:Georgia,serif;">Teeing Off Fore Grant</p>'
    + '<p style="margin:5px 0 0;color:#E4E1C5;font-size:13px;font-family:Georgia,serif;">Friday, November 6, 2026 &middot; San Vicente Golf Course, Ramona CA &middot; 9:00 AM shotgun start</p>'
    + '</td></tr>'

    // Orange accent bar
    + '<tr><td bgcolor="#F05323" style="background:#F05323;height:4px;font-size:1px;line-height:4px;">&nbsp;</td></tr>'

    // Title + intro
    + '<tr><td style="padding:36px 40px 0;">'
    + '<p style="margin:0;font-size:40px;font-weight:700;color:#31532D;font-family:Georgia,serif;line-height:1.1;">You&rsquo;re registered.</p>'
    + '<p style="margin:12px 0 0;font-size:14px;color:#5D5C58;font-family:Georgia,serif;line-height:1.7;">'
    + 'Thanks, ' + firstName + ' &mdash; your spot in Teeing Off Fore Grant is confirmed. '
    + 'This email is your invoice; keep it for your records.</p>'
    + '<hr style="' + RULE + '">'

    // Invoice meta — stacked label/value pairs
    + '<table width="100%" cellpadding="0" cellspacing="0" border="0">'
    + '<tr><td style="padding:5px 0;' + MONO + '">Invoice #</td>'
    + '<td style="padding:5px 0;' + BODY + 'text-align:right;">' + invoiceNum + '</td></tr>'
    + '<tr><td style="padding:5px 0;' + MONO + '">Date</td>'
    + '<td style="padding:5px 0;' + BODY + 'text-align:right;">' + invoiceDate + '</td></tr>'
    + '<tr><td style="padding:5px 0;' + MONO + '">Bill To</td>'
    + '<td style="padding:5px 0;' + BODY + 'text-align:right;">' + billTo + '</td></tr>'
    + '<tr><td style="padding:5px 0;' + MONO + '">For</td>'
    + '<td style="padding:5px 0;' + BODY + 'text-align:right;">Teeing Off Fore Grant 2026 &mdash; ' + tierName + '</td></tr>'
    + '</table>'
    + '<hr style="' + RULE + '">'

    // Package / Total / Due / Entry
    + '<table width="100%" cellpadding="0" cellspacing="0" border="0">'
    + '<tr><td style="width:120px;padding:8px 0;' + MONO + 'border-bottom:1px solid #CDD3C3;">Package</td>'
    + '<td style="padding:8px 0;' + BODY + 'text-align:right;border-bottom:1px solid #CDD3C3;">' + tierName + '</td></tr>'
    + '<tr><td style="padding:8px 0;' + MONO + 'border-bottom:1px solid #CDD3C3;">Total</td>'
    + '<td style="padding:8px 0;font-size:32px;font-weight:700;color:#F05323;text-align:right;border-bottom:1px solid #CDD3C3;font-family:Georgia,serif;">' + price + '</td></tr>'
    + '<tr><td style="padding:8px 0;' + MONO + 'border-bottom:1px solid #CDD3C3;">Due</td>'
    + '<td style="padding:8px 0;font-size:13px;font-family:Georgia,serif;text-align:right;border-bottom:1px solid #CDD3C3;color:#000;">On receipt &mdash; final deadline Friday, October 30, 2026</td></tr>'
    + '<tr><td style="padding:8px 0;' + MONO + 'border-bottom:1px solid #CDD3C3;">Entry</td>'
    + '<td style="padding:8px 0;font-size:13px;font-family:Georgia,serif;text-align:right;border-bottom:1px solid #CDD3C3;color:#000;">' + includes + '</td></tr>'
    + '</table></td></tr>';

  return buildInvoicePdfPart2(html, d, benefits, benefitRows, hasPlayers, playerRows, MONO, BODY, RULE, isFoursome);
}

// ─── PDF builder (part 2 — included/team/payment/steps/footer + export) ───────

function buildInvoicePdfPart2(html, d, benefits, benefitRows, hasPlayers, playerRows, MONO, BODY, RULE, isFoursome) {
  if (benefitRows) {
    html += '<tr><td style="padding:20px 40px 0;">'
      + '<p style="margin:0 0 8px;' + MONO + '">Included</p>'
      + '<table width="100%" cellpadding="0" cellspacing="0" border="0">' + benefitRows + '</table>'
      + '</td></tr>';
  }
  if (hasPlayers) {
    html += '<tr><td style="padding:20px 40px 0;">'
      + '<p style="margin:0 0 8px;' + MONO + '">Team</p>'
      + '<table width="100%" cellpadding="0" cellspacing="0" border="0">'
      + '<tr><td style="width:100px;padding:4px 0;color:#5D5C58;font-size:13px;font-family:Georgia,serif;">Captain</td>'
      + '<td style="padding:4px 0;font-size:13px;font-family:Georgia,serif;">' + d.captainName + '</td></tr>'
      + playerRows + '</table></td></tr>';
  }

  html += '<tr><td style="padding:0 40px;"><hr style="' + RULE + '"></td></tr>'
    + '<tr><td style="padding:0 40px;">'
    + '<p style="margin:0 0 4px;' + MONO + '">How to Pay</p>'
    + '<p style="margin:0 0 14px;font-size:14px;color:#5D5C58;font-family:Georgia,serif;">Nothing is charged online. Whichever of these is easiest.</p>'
    + '<table width="100%" cellpadding="0" cellspacing="0" border="0">'
    + '<tr><td style="width:60px;padding:10px 0;vertical-align:top;' + MONO + 'border-top:1px solid #CDD3C3;">Venmo</td>'
    + '<td style="padding:10px 0;' + BODY + 'border-top:1px solid #CDD3C3;">@Jessica-Carlson-15</td></tr>'
    + '<tr><td style="padding:10px 0;vertical-align:top;' + MONO + 'border-top:1px solid #CDD3C3;">Check</td>'
    + '<td style="padding:10px 0;' + BODY + 'border-top:1px solid #CDD3C3;line-height:1.7;">'
    + 'Payable to Jessica Carlson, with &ldquo;Teeing Off Fore Grant&rdquo; on the memo line.<br>'
    + 'Bring it on the day, or mail it to:<br>'
    + 'Jessica Carlson &middot; 907 Neighborly Lane &middot; Ramona, CA 92065</td></tr>'
    + '<tr><td style="padding:10px 0;vertical-align:top;' + MONO + 'border-top:1px solid #CDD3C3;">Cash</td>'
    + '<td style="padding:10px 0;' + BODY + 'border-top:1px solid #CDD3C3;">Hand it to us at check-in on tournament day.</td></tr>'
    + '</table></td></tr>'
    + '<tr><td style="padding:20px 40px 0;">'
    + '<p style="margin:0 0 12px;font-size:12px;color:#5D5C58;font-family:Georgia,serif;">Teeing Off Fore Grant is a personal fundraiser, not a registered 501(c)(3). Sponsorships and entries are not tax-deductible.</p>'
    + '<p style="margin:0;font-size:14px;color:#000;font-family:Georgia,serif;font-style:italic;line-height:1.7;">Thank you for supporting Grant&rsquo;s T-ALL Battle and helping us drive out leukemia one swing at a time.</p>'
    + '</td></tr>'
    + '<tr><td style="padding:0 40px;"><hr style="' + RULE + '"></td></tr>'
    + '<tr><td style="padding:0 40px;">'
    + '<p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#31532D;font-family:Georgia,serif;">What happens next</p>'
    + '<table width="100%" cellpadding="0" cellspacing="0" border="0">'
    + '<tr><td style="padding:12px 0;border-top:1px solid #CDD3C3;">'
    + '<p style="margin:0;font-size:22px;font-weight:700;color:#F05323;font-family:Georgia,serif;line-height:1;">01</p>'
    + '<p style="margin:4px 0 0;font-size:14px;font-weight:700;color:#000;font-family:Georgia,serif;">Send payment</p>'
    + '<p style="margin:4px 0 0;font-size:13px;color:#5D5C58;font-family:Georgia,serif;line-height:1.6;">Sooner is better. Friday, October 30 is the final deadline, and you can pay by Venmo, check or cash.</p>'
    + '</td></tr>'
    + (isFoursome ? '' :
        '<tr><td style="padding:12px 0;border-top:1px solid #CDD3C3;">'
      + '<p style="margin:0;font-size:22px;font-weight:700;color:#F05323;font-family:Georgia,serif;line-height:1;">02</p>'
      + '<p style="margin:4px 0 0;font-size:14px;font-weight:700;color:#000;font-family:Georgia,serif;">Send your logo</p>'
      + '<p style="margin:4px 0 0;font-size:13px;color:#5D5C58;font-family:Georgia,serif;line-height:1.6;">Sponsors: send this as early as you can. Signage and the flyer go to print well before the payment deadline, so reply to this email with your artwork.</p>'
      + '</td></tr>')
    + '<tr><td style="padding:12px 0;border-top:1px solid #CDD3C3;">'
    + '<p style="margin:0;font-size:22px;font-weight:700;color:#F05323;font-family:Georgia,serif;line-height:1;">' + (isFoursome ? '02' : '03') + '</p>'
    + '<p style="margin:4px 0 0;font-size:14px;font-weight:700;color:#000;font-family:Georgia,serif;">We see you on the 6th</p>'
    + '<p style="margin:4px 0 0;font-size:13px;color:#5D5C58;font-family:Georgia,serif;line-height:1.6;">Your tee time and starting hole go out closer to the day.</p>'
    + '</td></tr>'
    + '</table></td></tr>'
    + '<tr><td style="padding:20px 40px;">'
    + '<p style="margin:0;font-size:13px;color:#5D5C58;font-family:Georgia,serif;">Questions? Reply to this email or reach Jessica at grantstallbattle@gmail.com &middot; 619-344-7687</p>'
    + '</td></tr>'
    + '<tr><td bgcolor="#31532D" style="background:#31532D;padding:20px 40px;">'
    + '<p style="margin:0;color:#E4E1C5;font-size:13px;font-family:Georgia,serif;line-height:1.9;">'
    + 'Teeing Off Fore Grant &middot; Friday, November 6, 2026<br>'
    + 'San Vicente Golf Course &middot; Ramona, CA &middot; 9:00 AM shotgun start<br>'
    + '@GrantsTALLBattle</p></td></tr>'
    + '</table></body></html>';

  var blob = Utilities.newBlob(html, "text/html", "invoice.html");
  var pdf  = blob.getAs("application/pdf");
  pdf.setName("ForeGrant_Invoice_" + d.captainName.replace(/\s+/g, "_") + ".pdf");
  return pdf;
}
