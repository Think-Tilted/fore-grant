# Communication sequence — submission through day-of

**Decided with Kyle, 2026-08-26.** One automated email; everything after it is Jessica replying
in the thread that email created.

**Event:** Friday, 6 November 2026 · San Vicente Golf Course, Ramona CA · 9:00 AM shotgun start

---

## The shape

| # | When | Channel | Automated? | Purpose |
|---|---|---|---|---|
| 1 | Submit | Site form → Google Sheet | ✅ | Row created, status *Registered — unpaid* |
| 2 | Instantly | Confirmation page | ✅ | Reassurance in the moment |
| 3 | Instantly | **Confirmation + invoice email, CC Jessica** | ✅ | Invoice, how to pay, due date. **Creates the thread** |
| 4 | ~7 days after, if unpaid | Reply in thread | Manual | Payment nudge — deadline is **Fri 30 Oct 2026** |
| 5 | **Early, and ongoing** | Reply in thread | Manual | Sponsors only — logo chase. Needed well before payment |
| 6 | ~4 weeks out | Reply in thread → roster form | Manual | Final player names |
| 7 | ~4 days out | Reply in thread | Manual | Group and hole are live |
| 8 | Day before | Reply in thread | Manual | Arrival, check-in, weather |
| 9 | Day of | Tournament Day page | — | No email. The page is the reference |
| 10 | After | New email | Manual | Thanks + total raised |

**Email config for #3:** `From:` an event address · `Reply-To:` Jessica · `CC:` Jessica.
If it sends *from* her address the CC is redundant — it lands in Sent, not her inbox, and the
thread will not behave the way it should.

**Everything below is plain text on purpose.** It sends from Jessica's own reply, in her voice.
Only #3 is designed and branded — see `05 — EMAIL` in Figma.

---

## 4 · Payment nudge
*Send ~7 days after registration, only to rows still marked unpaid. Reply in thread.*

> Subject: (reply — keeps the thread)
>
> Hi {{first_name}},
>
> Just circling back on this one. We have you down for {{tier_name}} at {{amount}}, and it's
> still showing as unpaid on our end. The final deadline is Friday, October 30.
>
> Easiest options are Venmo to @Jessica-Carlson-15, or a check payable to Jessica Carlson with
> "Teeing Off Fore Grant" on the memo line — mailed to 907 Neighborly Lane, Ramona, CA 92065, or
> just handed to us at check-in.
>
> If something's changed and you need to adjust, no problem at all, just let me know.
>
> Thanks so much,
> Jessica

---

## 5 · Sponsor artwork chase
*Sponsors only. **Send this early and expect to send it more than once** — Kyle, 2026-08-26:
artwork is needed well before payment, and most of these get chased down by hand anyway.
No fixed date, deliberately: the real constraint is when signage goes to print, and a date the
copy can't honour is worse than none.*

> Hi {{first_name}},
>
> We're getting signage and the flyer ready, and I don't have your logo yet.
>
> If you can reply to this email with it in the next week or so, it'll be on your hole signage
> and everywhere else your package covers. Vector is ideal — .ai, .eps or .svg — but a
> high-resolution PNG works too.
>
> Once the signs go to print I can still get you into the digital pieces, just not the printed
> ones.
>
> Thank you,
> Jessica

---

## 6 · Roster request
*~4 weeks out. The one that carries a link. Everyone with a foursome — golfers and any sponsor
tier that includes players.*

> Hi {{first_name}},
>
> We're at the point where the course needs every player by name.
>
> Here's your roster form — it's four names and takes about a minute:
> {{roster_link}}
>
> If it's easier, just reply to this email with the names and I'll add them myself.
>
> Either way, we'd love to have them by {{roster_deadline}} so we can set the pairings.
>
> Thanks,
> Jessica

---

## 7 · Groups are live
*~4 days out, once the pairings tab is populated and writing to the Tournament Day page.*

> Hi {{first_name}},
>
> Pairings are set. You can find your group and starting hole here:
> {{tournament_day_link}}
>
> Type any player's name into the lookup and it'll pull up the group.
>
> See you Friday,
> Jessica

---

## 8 · Day before
*Send to everyone the afternoon before.*

> Hi {{first_name}},
>
> Tomorrow's the day. A few practical things:
>
> Check-in opens at 7:00 AM and breakfast is served — please come hungry. Announcements are at
> 8:50 and we go out shotgun at 9:00 sharp, so give yourself time to park and find your cart.
>
> Your group and starting hole: {{tournament_day_link}}
>
> Bring cash if you'd like raffle or 50/50 tickets, and if you still owe for your spot you can
> settle up at check-in.
>
> Thank you for doing this for Grant. It means everything.
>
> Jessica

---

## 10 · After
*Within a week. This is also the moment people decide about next year, so ask.*

> Hi {{first_name}},
>
> Thank you. Truly.
>
> Together we raised {{total_raised}} for Grant, and every bit of it goes to his family as they
> keep fighting.
>
> {{one_line_highlight}}
>
> We're already thinking about next year — if you'd like us to hold your spot, just reply and
> say the word.
>
> His fight is our fight.
> Jessica

---

## Open inputs

- **Payment deadline — SET: Friday, 30 October 2026** (seven days before the event). Sooner is
  better; that date is the drop-dead. Same for everyone, so hardcode it — it is not a merge field.
- **Artwork — no date, on purpose.** It is needed *well* before payment and is chased manually
  per sponsor. The only hard constraint is the signage print run. Nothing in the site copy or the
  invoice claims an artwork date, so there is nothing to contradict; the one place ordering could
  have implied "logo comes after payment" — step 02 of the invoice email — now says the opposite.
- `{{roster_deadline}}` — recommend ~2 weeks out, so there's time to chase stragglers.
- ~~No mailing address~~ **RESOLVED 2026-08-26** from the 2025 invoice: Jessica Carlson,
  907 Neighborly Lane, Ramona, CA 92065. Checks carry "Teeing Off Fore Grant" on the memo line.
- `{{total_raised}}` and `{{one_line_highlight}}` are filled in by hand after the event.
