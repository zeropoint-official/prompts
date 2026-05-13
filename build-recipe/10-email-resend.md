# 10 — Email Notifications via Resend

Wire two emails to fire on every form submission: a lead notification to the admin team, and a confirmation auto-reply to the customer. Both share the design system of the site (warm-ink, gold accent, mono micro-labels, hairlines) and are sent **fire-and-forget** so the API route returns immediately and the customer-facing form feels instant.

Paste the [business brief](./00-business-brief-template.md) at the top of the session.

---

### ▶ Prompt to Claude

> Phase 09 left `app/api/contact/route.ts` with a `// TODO phase 10: send admin + customer emails` line. This phase implements both sends and the email templates.
>
> ## Prerequisite: Resend setup
>
> The brief should already have:
>
> - `RESEND_API_KEY` in `.env.local`
> - A verified sending domain in Resend (e.g. `yourdomain.com` — completed at resend.com → Domains → Add Domain → DNS verification)
> - `{{FROM_EMAIL}}` — e.g. `{{BRAND_NAME}} <hello@yourdomain.com>` (must be on the verified domain)
> - `{{ADMIN_EMAILS}}` — array of admin recipients
> - `{{REPLY_TO}}` — where customer replies route
> - `{{PHONE}}` — used in the customer email's call CTA
> - `{{SITE_URL}}` — used in email-internal links
>
> ## 1. Build `app/lib/email.ts`
>
> Single module that owns: Resend client, top-of-file config constants, two HTML templates, two send functions. **Config constants live at the top of this file, not in env vars** — they're per-client, not per-environment, and inlining them keeps the templates readable.
>
> ```ts
> import { Resend } from "resend";
>
> const resend = new Resend(process.env.RESEND_API_KEY!);
>
> // ============ CONFIG (edit per client) ============
> const FROM         = "{{FROM_EMAIL}}";                       // verified Resend domain
> const ADMIN_EMAILS = {{ADMIN_EMAILS_AS_JSON_ARRAY}};         // string[]
> const REPLY_TO     = "{{REPLY_TO}}";
> const SITE_URL     = "{{SITE_URL}}";
> const BRAND        = "{{BRAND_NAME}}";
> const PHONE        = "{{PHONE}}";
> const PHONE_RAW    = "{{PHONE_RAW}}";                        // no spaces, for tel:
> // ==================================================
>
> export type SubmissionPayload = {
>   id: string;
>   name: string;
>   email: string;
>   phone?: string;
>   service?: string;
>   message?: string;
>   source: "home" | "contact";
>   created_at: string;
> };
>
> export async function sendAdminNotification(s: SubmissionPayload) {
>   try {
>     await resend.emails.send({
>       from: FROM,
>       to: ADMIN_EMAILS,
>       replyTo: s.email,                                     // reply goes back to the lead
>       subject: `New lead — ${s.name} · ${s.service ?? "General"}`,
>       html: adminTemplate(s),
>     });
>   } catch (err) {
>     console.error("[email:admin]", err);
>   }
> }
>
> export async function sendCustomerConfirmation(s: SubmissionPayload) {
>   try {
>     await resend.emails.send({
>       from: FROM,
>       to: [s.email],
>       replyTo: REPLY_TO,
>       subject: `${BRAND} — we've received your message`,
>       html: customerTemplate(s),
>     });
>   } catch (err) {
>     console.error("[email:customer]", err);
>   }
> }
>
> // ----- templates below -----
> ```
>
> ## 2. Admin notification template
>
> Goal: an admin opens this on their phone in the middle of the day, glances at it for 2 seconds, knows what the lead is about, and can tap "Reply to lead" to open mail.app with the customer's address pre-filled and the conversation context inline.
>
> Visual language: dark warm-ink background, gold hairlines, mono micro-labels, display name at top, body of the message in light editorial type, primary CTA `Reply to lead →` (mailto: with reply body and subject pre-filled).
>
> ```ts
> function adminTemplate(s: SubmissionPayload) {
>   const subject = `Re: your enquiry — ${BRAND}`;
>   const replyBody = `Hi ${s.name},%0D%0A%0D%0AThanks for getting in touch with ${BRAND}.%0D%0A%0D%0A`;
>   const replyHref = `mailto:${s.email}?subject=${encodeURIComponent(subject)}&body=${replyBody}`;
>
>   return `
> <!doctype html>
> <html>
>   <body style="margin:0;padding:0;background:#0f0b06;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#ece3cc;">
>     <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f0b06;">
>       <tr><td align="center" style="padding:40px 20px;">
>         <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
>           <tr><td style="padding:0 32px 24px;">
>             <div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#d4b46a;">${BRAND} · new lead</div>
>             <div style="height:1px;background:linear-gradient(90deg,transparent,#d4b46a,transparent);margin:14px 0;"></div>
>           </td></tr>
>
>           <tr><td style="padding:0 32px;">
>             <h1 style="margin:0 0 8px;font-weight:300;font-size:32px;line-height:1.1;letter-spacing:-0.02em;color:#ece3cc;">${escapeHtml(s.name)}</h1>
>             <p style="margin:0;color:rgba(236,227,204,0.6);font-size:15px;">
>               ${escapeHtml(s.service ?? "General enquiry")} · from <span style="color:#d4b46a;">${escapeHtml(s.source)}</span> page
>             </p>
>           </td></tr>
>
>           <tr><td style="padding:32px;">
>             <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#181108;border:1px solid rgba(212,180,106,0.18);">
>               <tr><td style="padding:24px;">
>                 ${row("Email", `<a href="mailto:${s.email}" style="color:#d4b46a;text-decoration:none;">${escapeHtml(s.email)}</a>`)}
>                 ${s.phone ? row("Phone", `<a href="tel:${s.phone}" style="color:#d4b46a;text-decoration:none;">${escapeHtml(s.phone)}</a>`) : ""}
>                 ${row("Service", escapeHtml(s.service ?? "—"))}
>                 ${row("Source", escapeHtml(s.source))}
>                 ${row("Received", new Date(s.created_at).toLocaleString())}
>               </td></tr>
>             </table>
>           </td></tr>
>
>           ${s.message ? `
>           <tr><td style="padding:0 32px 32px;">
>             <div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:#d4b46a;margin-bottom:12px;">§ Message</div>
>             <div style="font-size:16px;line-height:1.7;color:rgba(236,227,204,0.85);font-weight:300;white-space:pre-wrap;">${escapeHtml(s.message)}</div>
>           </td></tr>` : ""}
>
>           <tr><td style="padding:0 32px 40px;" align="center">
>             <a href="${replyHref}" style="display:inline-block;padding:14px 28px;border:1px solid #d4b46a;color:#d4b46a;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;text-decoration:none;">Reply to ${escapeHtml(s.name)} →</a>
>           </td></tr>
>
>           <tr><td style="padding:32px;border-top:1px solid rgba(212,180,106,0.12);text-align:center;">
>             <div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:rgba(236,227,204,0.35);">
>               ${BRAND} · admin notification · <a href="${SITE_URL}/dashboard/submissions/${s.id}" style="color:rgba(236,227,204,0.55);text-decoration:none;">open in dashboard →</a>
>             </div>
>           </td></tr>
>         </table>
>       </td></tr>
>     </table>
>   </body>
> </html>`;
> }
>
> function row(label: string, value: string) {
>   return `
>     <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
>       <tr>
>         <td style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:10px;letter-spacing:0.24em;text-transform:uppercase;color:rgba(236,227,204,0.4);width:90px;vertical-align:top;padding-top:3px;">${label}</td>
>         <td style="font-size:15px;color:#ece3cc;">${value}</td>
>       </tr>
>     </table>`;
> }
>
> function escapeHtml(s: string) {
>   return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
> }
> ```
>
> ## 3. Customer confirmation template
>
> Goal: a customer who just submitted a form receives an email immediately that (a) confirms receipt, (b) restates what they sent so they can verify, (c) sets expectations ("within 24 hours"), (d) offers direct contact channels if they need to reach the team sooner.
>
> ```ts
> function customerTemplate(s: SubmissionPayload) {
>   return `
> <!doctype html>
> <html>
>   <body style="margin:0;padding:0;background:#0f0b06;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#ece3cc;">
>     <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f0b06;">
>       <tr><td align="center" style="padding:40px 20px;">
>         <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
>
>           <tr><td style="padding:0 32px 24px;" align="center">
>             <div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#d4b46a;">${BRAND}</div>
>             <div style="height:1px;background:linear-gradient(90deg,transparent,#d4b46a,transparent);margin:14px auto;width:80px;"></div>
>           </td></tr>
>
>           <!-- confirmation banner -->
>           <tr><td style="padding:0 32px 24px;" align="center">
>             <div style="display:inline-block;padding:8px 18px;border:1px solid rgba(212,180,106,0.4);font-family:'JetBrains Mono',ui-monospace,monospace;font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:#d4b46a;">
>               § Message received
>             </div>
>           </td></tr>
>
>           <tr><td style="padding:0 32px 16px;" align="center">
>             <h1 style="margin:0;font-weight:200;font-size:40px;line-height:1.05;letter-spacing:-0.03em;color:#ece3cc;">
>               Thank you,<br /><span style="color:#d4b46a;">${escapeHtml(firstName(s.name))}.</span>
>             </h1>
>           </td></tr>
>
>           <tr><td style="padding:8px 32px 32px;" align="center">
>             <p style="margin:0;color:rgba(236,227,204,0.65);font-size:17px;line-height:1.6;font-weight:300;max-width:420px;">
>               We've received your message and our team will be in touch within 24 hours.
>             </p>
>           </td></tr>
>
>           <!-- next steps -->
>           <tr><td style="padding:0 32px 32px;">
>             <div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:#d4b46a;margin-bottom:14px;">§ What happens next</div>
>             <ol style="margin:0;padding-left:18px;color:rgba(236,227,204,0.8);font-size:15px;line-height:1.8;font-weight:300;">
>               <li>We'll review your enquiry and prepare a reply tailored to ${escapeHtml(s.service ?? "your interest")}.</li>
>               <li>You'll hear back from us by email — usually within a few hours.</li>
>               <li>If we need to set up a call, we'll suggest a few times that work for us.</li>
>             </ol>
>           </td></tr>
>
>           <!-- request summary -->
>           <tr><td style="padding:0 32px 32px;">
>             <div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:#d4b46a;margin-bottom:14px;">§ Your request</div>
>             <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#181108;border:1px solid rgba(212,180,106,0.18);">
>               <tr><td style="padding:22px;">
>                 ${row("Name",    escapeHtml(s.name))}
>                 ${row("Email",   escapeHtml(s.email))}
>                 ${s.phone   ? row("Phone",   escapeHtml(s.phone))   : ""}
>                 ${row("Service", escapeHtml(s.service ?? "—"))}
>                 ${s.message ? `<div style="margin-top:14px;padding-top:14px;border-top:1px solid rgba(212,180,106,0.12);font-size:14px;color:rgba(236,227,204,0.7);line-height:1.7;white-space:pre-wrap;">${escapeHtml(s.message)}</div>` : ""}
>               </td></tr>
>             </table>
>           </td></tr>
>
>           <!-- direct contact -->
>           <tr><td style="padding:0 32px 32px;" align="center">
>             <div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:rgba(236,227,204,0.5);margin-bottom:14px;">§ Need to reach us sooner?</div>
>             <div style="margin-bottom:8px;">
>               <a href="tel:${PHONE_RAW}" style="display:inline-block;margin:4px;padding:12px 22px;border:1px solid #d4b46a;color:#d4b46a;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;text-decoration:none;">Call ${escapeHtml(PHONE)}</a>
>               <a href="mailto:${REPLY_TO}" style="display:inline-block;margin:4px;padding:12px 22px;border:1px solid rgba(212,180,106,0.3);color:rgba(236,227,204,0.65);font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;text-decoration:none;">Email us →</a>
>             </div>
>           </td></tr>
>
>           <tr><td style="padding:32px;border-top:1px solid rgba(212,180,106,0.12);text-align:center;">
>             <div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:rgba(236,227,204,0.35);">
>               <a href="${SITE_URL}" style="color:rgba(236,227,204,0.55);text-decoration:none;">${SITE_URL.replace(/^https?:\/\//, "")}</a>
>             </div>
>             <div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:rgba(236,227,204,0.25);margin-top:10px;">
>               © ${new Date().getFullYear()} · ${BRAND}
>             </div>
>           </td></tr>
>         </table>
>       </td></tr>
>     </table>
>   </body>
> </html>`;
> }
>
> function firstName(s: string) {
>   return s.trim().split(/\s+/)[0] || s;
> }
> ```
>
> ## 4. Wire into the contact route
>
> Update `app/api/contact/route.ts` — after the successful INSERT, fire both emails **without awaiting**. The form returns immediately; emails ride on the event loop:
>
> ```ts
> import { NextResponse } from "next/server";
> import { getDB } from "@/app/lib/db";
> import { sendAdminNotification, sendCustomerConfirmation, type SubmissionPayload } from "@/app/lib/email";
> import { randomId } from "@/app/lib/analytics";
>
> export const runtime = "nodejs";
>
> export async function POST(req: Request) {
>   const body = await req.json();
>   const { name, email, phone, service, message, source = "contact" } = body ?? {};
>
>   if (!name || !email || !message) {
>     return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
>   }
>
>   const id = randomId();
>   const created_at = new Date().toISOString();
>
>   const db = await getDB();
>   await db.prepare(
>     "INSERT INTO form_submissions (id, name, email, phone, service, message, source, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
>   ).bind(id, name, email, phone ?? null, service ?? null, message, source, created_at).run();
>
>   const payload: SubmissionPayload = { id, name, email, phone, service, message, source, created_at };
>
>   // Fire-and-forget — never block the response on email delivery
>   sendAdminNotification(payload);
>   sendCustomerConfirmation(payload);
>
>   return NextResponse.json({ success: true });
> }
> ```
>
> Why fire-and-forget: Resend usually delivers in ~200–800ms but occasionally takes 5+ seconds when their queue is full. Blocking the form submission on that turns a snappy UX into a lag. Logged errors inside the send functions catch failures for you to investigate later — they don't surface to the customer.
>
> ## 5. Verify
>
> 1. `pnpm dev` → submit the home-page contact form using a real email you can check.
> 2. Confirm the form returns instantly (< 500ms).
> 3. Check the admin email inbox for the "New lead — Name · Service" email.
> 4. Check the customer's inbox for "BRAND — we've received your message".
> 5. Open both in:
>    - Apple Mail (Mac) — should render dark with gold accents.
>    - Gmail web — should render correctly. Note that Gmail strips `<style>` tags so all styling must be inline. (The templates above use inline styles only.)
>    - Outlook (Mac, web) — should render acceptably. Outlook is the toughest mail client; minor visual degradation is expected.
>    - On mobile (iOS Mail / Gmail app) — should be tappable and readable.
> 6. Reply to the admin notification email — it should pre-populate To: the customer's address (because we set `replyTo: s.email`).
> 7. Customer hits Reply on their confirmation — it should go to `{{REPLY_TO}}` (the admin team), not to the no-reply `FROM`.
> 8. Confirm the row in Turso has the data the email shows.
> 9. Open `/dashboard/submissions` — your submission is there.
>
> ## Troubleshooting
>
> - **Emails not arriving.** Check Resend Dashboard → Logs. If the request failed: `{{FROM_EMAIL}}`'s domain isn't verified, or `RESEND_API_KEY` is wrong. If the request succeeded but emails are missing: check spam.
> - **Admin email goes to spam.** Verify SPF/DKIM/DMARC are green in Resend → Domains. Add a real-name `From` field (already done — `{{BRAND_NAME}} <hello@…>`). Don't use subject lines with `URGENT`, `!!`, etc.
> - **Customer email goes to spam.** Same DNS checks. Also: don't include "we received your message" too often in the same paragraph — anti-spam filters score that.
> - **Dark backgrounds render gray in Gmail.** Gmail forces a light theme on some clients regardless of the body bg. Acceptable degradation — the content is still readable. If unacceptable, lighten the background to `#1a130a` (still dark, less aggressive).
> - **The "Reply to lead" button doesn't pre-fill in Gmail web.** Gmail strips `mailto:` body parameters in some clients. Subject pre-fill always works. Body is best-effort.
>
> ## What NOT to do
>
> - Do NOT `await` the email sends inside the contact route. The form must return immediately.
> - Do NOT use a separate emailer library (Nodemailer + SMTP) on top of Resend. Resend's SDK is the whole point — one call, deliverability handled.
> - Do NOT inline a large logo image as base64 in the email HTML. Mail clients downgrade or block it; it bloats the message. The wordmark in text is enough.
> - Do NOT add unsubscribe links to the customer confirmation email. It's a transactional reply to a form they just submitted, not marketing. Adding an unsubscribe link is what makes transactional mail look like marketing to spam filters.
> - Do NOT use Tailwind classes in the email HTML. Inline styles only. Mail clients don't run Tailwind.
> - Do NOT use modern CSS (flexbox, grid, custom properties) in email HTML. Tables and inline `style="…"` — that's the supported subset.
> - Do NOT add an HTML `<head>` with `<meta charset>` and `<title>`. Some mail clients strip them, some preserve them, some break. The minimal `<!doctype html><html><body>` is what works most consistently.
> - Do NOT call Resend from a Server Component. Email sending lives in the route handler, not in render.
>
> ## Acceptance
>
> - Form submission returns < 500ms.
> - Admin notification arrives in admin inbox within 30 seconds.
> - Customer confirmation arrives in customer inbox within 30 seconds.
> - Both emails render the brand wordmark, gold hairline, dark background, mono micro-labels.
> - Admin notification's "Reply to lead" button opens mail.app with To: pre-filled to the customer.
> - No errors in Resend Logs.
>
> Report back: contents of `app/lib/email.ts`'s top-of-file config block, and screenshots/descriptions of both rendered emails in Apple Mail or Gmail.

---

## Notes for the human

- **`replyTo: s.email` on the admin email** is the small move that makes the dashboard feel like an inbox. Click "Reply" in your mail client → you're replying to the lead directly, not to the no-reply sending address.
- **`replyTo: REPLY_TO` on the customer email** is the symmetric move — if the customer hits Reply, the message gets to your real address, not bounced.
- **Why not use Resend's React Email templates?** They're great, but they're another dep, another build step, and they generate HTML that's barely different from what you'd write by hand for an email this small. Inline HTML keeps the template inside the same file as the send function and stays simple to edit.
- **Branding the email matters as much as branding the site.** This is the only piece of your site that lands in someone's inbox — the first thing they see when the next conversation starts. Treat the template seriously.
