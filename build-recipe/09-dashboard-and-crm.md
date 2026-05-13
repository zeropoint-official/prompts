# 09 — Admin Dashboard: Turso + Clerk + CRM + Analytics

This is the largest single phase. It adds an admin-only `/dashboard` with a full lead CRM and custom first-party analytics. There's an existing reference implementation in the codebase at [`dashboard-workflow/`](../dashboard-workflow/) — Claude should read those four files first, then implement.

Paste the [business brief](./00-business-brief-template.md) at the top of the session, then this prompt.

> **Prerequisite — accounts.** Before pasting this prompt, complete the "pre-build setup" from [`dashboard-workflow/pre-build-setup.md`](../dashboard-workflow/pre-build-setup.md): create a Turso DB, create a Clerk app, create a Resend API key (Resend wiring lands in phase 10 but the key is needed now if you want to verify the contact-form path end-to-end). Paste all six values into your `.env.local` before running anything.

---

### ▶ Prompt to Claude

> Read these reference docs **before writing any code**, in order:
>
> 1. [`dashboard-workflow/README.md`](../dashboard-workflow/README.md)
> 2. [`dashboard-workflow/architecture.md`](../dashboard-workflow/architecture.md)
> 3. [`dashboard-workflow/setup-checklist.md`](../dashboard-workflow/setup-checklist.md)
> 4. [`dashboard-workflow/customization.md`](../dashboard-workflow/customization.md)
>
> The reference shipped against a real-estate site. Your job is to implement the same architecture for `{{BRAND_NAME}}` (`{{VERTICAL}}`), adapting only the `page-names.ts` map, the CRM `STATUSES` array if the brief specifies different pipeline stages, and the form fields if the brief differs from the default.
>
> ## What to build, in dependency order
>
> ### 1. Install dependencies
>
> ```bash
> pnpm add @clerk/nextjs @libsql/client resend
> pnpm add -D tsx
> ```
>
> Add the migrate script to `package.json`:
>
> ```json
> "scripts": {
>   "db:migrate": "tsx --env-file=.env.local scripts/migrate.ts"
> }
> ```
>
> ### 2. `.env.local`
>
> Confirm or create with the six required values (`TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`, `RESEND_API_KEY`, `NEXT_PUBLIC_SITE_URL`).
>
> ### 3. Migrations — `migrations/`
>
> Four SQL files exactly matching the reference. Don't modify the schema unless the brief specifies extra fields:
>
> - `0001_create_form_submissions.sql` — base table: id (PK), name, email, phone, service, message, source, status, starred, notes, follow_up_date, last_contacted, estimated_value, tags, is_read, archived, created_at.
> - `0002_create_page_views.sql` — id, path, referrer, user_agent, device_type, country, session_id, created_at.
> - `0003_create_daily_stats.sql` — pre-aggregation table (unused now; future scheduled job hook).
> - `0004_add_crm_fields.sql` — appends starred/notes/follow_up_date/last_contacted/estimated_value/tags to form_submissions (the reference originally shipped without these, hence the separate migration). If you write the schema fresh in 0001 with all fields already included, **still create an empty/no-op 0004** so the migration tracking table matches between fresh installs and upgrades.
>
> Refer to the column types and defaults in `dashboard-workflow/README.md` § "Database Schema."
>
> ### 4. Migrate runner — `scripts/migrate.ts`
>
> Connects to Turso via `@libsql/client`, ensures a `_migrations` table exists, reads sorted `migrations/*.sql`, splits on `;`, applies any file not in `_migrations`, records each applied file. Idempotent. Run with `pnpm db:migrate`.
>
> ### 5. Auth proxy — `proxy.ts`
>
> Replace the empty stub from phase 02 with Clerk middleware. **In Next.js 16 this file is `proxy.ts`, not `middleware.ts`.** Clerk's `clerkMiddleware()` works identically:
>
> ```ts
> import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
>
> const isProtected = createRouteMatcher([
>   "/dashboard(.*)",
>   "/api/submissions(.*)",
>   "/api/analytics(?!/track)(.*)",  // admin analytics is protected; the public /api/analytics/track beacon isn't
> ]);
>
> export default clerkMiddleware(async (auth, req) => {
>   if (isProtected(req)) {
>     await auth.protect();
>   }
> });
>
> export const config = {
>   matcher: [
>     "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
>     "/(api|trpc)(.*)",
>   ],
> };
> ```
>
> ### 6. Mount ClerkProvider in root layout
>
> In `app/layout.tsx`, wrap `<html>…</html>` with `<ClerkProvider>` and mount `<AnalyticsTracker />` once.
>
> ### 7. Library files — `app/lib/`
>
> - **`db.ts`** — `getDB()`. Lazy singleton libSQL client wrapped in a `prepare(sql).bind(...).first()/.all()/.run()` API that mirrors the D1 binding shape (so the route handlers don't care which engine).
> - **`auth.ts`** — `requireAdmin()`. Calls `auth()`, then `clerkClient().users.getUser(userId)`, returns the user if `user.publicMetadata.role === "admin"`, throws `403 NextResponse` otherwise. The admin check uses the Clerk Backend API directly (not session token claims) because `publicMetadata` is NOT in JWT claims by default and customizing the session template is more brittle than this.
> - **`analytics.ts`** — `parseDevice(userAgent)` returns `desktop` | `mobile` | `tablet`. `sessionIdFor(ip, ua)` returns `SHA-256(ip + ua + YYYY-MM-DD).slice(0,16)` for daily-rotating GDPR-friendly fingerprint. `randomId()` returns a 16-char hex.
> - **`page-names.ts`** — `PAGE_NAMES: Record<string, string>` mapping `/`, `{{INDEX_PATH}}`, `/about`, `/contact`, `{{ITEM_BASE_PATH}}/[slug]` → friendly names like "Homepage", "{{INDEX_NAV_LABEL}}", "Studio", "Contact". Used by analytics to show `/ — Homepage` style labels in the Top Pages table.
> - **`utils.ts`** — already exists from phase 02 (`cn()`).
> - **`contact.ts`** — single export `CONTACT_EMAIL = "{{REPLY_TO}}"` and any other contact constants needed by client components.
>
> ### 8. API routes — `app/api/`
>
> All route handlers declare `export const runtime = "nodejs"`. Schemas + behavior per the reference docs:
>
> - `contact/route.ts` — POST. Validates name+email+message, inserts to `form_submissions` with `source: "home" | "contact"`. **Calls Resend** to send both the admin notification and the customer confirmation emails (phase 10 wires those email functions; for now scaffold this route with the inserts only and a `// TODO phase 10: send admin + customer emails`).
> - `submissions/route.ts` — GET (admin). Paginated list with filters: tab (all/unread/starred/follow-up/archived), service, source, status, date range, sort key + direction, full-text search across name/email/phone/message. Returns `{ items, total, counts: { all, unread, starred, followUp, archived } }`.
> - `submissions/[id]/route.ts` — GET single, PATCH update any CRM field, DELETE permanently.
> - `submissions/bulk/route.ts` — POST. Bulk actions: mark read/unread, star, archive, set status, delete. Body `{ ids: string[], action, ...args }`.
> - `submissions/export/route.ts` — GET. Streams `?format=csv` or `?format=json` of all (filtered) submissions.
> - `analytics/route.ts` — GET (admin). Aggregated analytics: summary cards (total views, unique visitors, avg/day, pages visited, bounce rate, % change vs previous period), daily traffic, hour-of-day, top pages, top referrers, device breakdown, country breakdown. Accepts filters (date range, page, referrer, device, country) and a `?period=7d|30d|90d|custom` param.
> - `analytics/track/route.ts` — POST (public). Inserts one page view. Reads `cf-ipcountry` and `cf-connecting-ip` headers for country/IP (populated only if Cloudflare proxy is in front; null otherwise). Parses device from UA. Computes session id. Skips dashboard/sign-in/API paths defensively.
>
> ### 9. Sign-in page — `app/sign-in/[[...sign-in]]/page.tsx`
>
> Renders `<SignIn />` from Clerk centered on a dark page styled to match the rest of the site.
>
> ### 10. Analytics tracker — `app/components/AnalyticsTracker.tsx`
>
> Client component, mounted once in root layout. Fires `navigator.sendBeacon("/api/analytics/track", JSON.stringify({...}))` on each pathname change via `usePathname()`. Falls back to `fetch(..., { keepalive: true })` if `sendBeacon` isn't available. Body: `{ path, referrer, userAgent }`. Skips paths starting with `/dashboard`, `/sign-in`, `/api`, `/_next`.
>
> ### 11. Dashboard pages — `app/dashboard/`
>
> - `layout.tsx` — Sidebar + main content shell. Sidebar shows brand name + Clerk `<UserButton />` + nav links (Overview, Submissions, Analytics, Site →).
> - `loading.tsx` — Skeleton loader.
> - `page.tsx` — Overview (server component). 6 stat cards (today's submissions, 30d total, unread, starred, page views 7d, unique visitors 7d), pipeline chart (bar breakdown by status), due-follow-ups list, recent submissions list.
> - `submissions/page.tsx` — CRM (client component). Uses `<SubmissionsTable />`.
> - `analytics/page.tsx` — Analytics (client component). Uses `<AnalyticsCharts />`.
>
> ### 12. Dashboard components — `app/components/dashboard/`
>
> - `Sidebar.tsx` — Fixed left sidebar, nav links with active state.
> - `StatCard.tsx` — `{ label, value, sublabel?, trend? }` metric card.
> - `SubmissionsTable.tsx` — The full CRM card UI. Reference doc lists every feature: tabs (with live badge counts), pipeline statuses (`new → contacted → quoted → won/lost/spam`), star/priority sort-to-top, follow-up tracking (one-click "needs follow-up" sets today; date picker for explicit date; due items surface in the Follow-up tab + on Overview), estimated value, tags, internal notes (inline edit), full-text search, filter panel (service/source/status/date), sort, bulk actions (mark read/unread, star, archive, set status, delete), CSV/JSON export, per-lead quick actions (copy email, open mail client, call, mark, archive, delete), optimistic UI for read state. **Read the README section "CRM / Submissions" closely.** This is the largest single component — budget ~600 lines.
> - `AnalyticsCharts.tsx` — All the analytics UI: 5 summary cards with % change vs previous, daily traffic bar chart with tooltips + Y-axis labels, traffic-by-hour 24-hour bars, top pages (with friendly names via `page-names.ts`, clickable to filter), top referrers (cleaned hostnames, clickable), device breakdown (stacked bar + icons, clickable), country breakdown (clickable), date range presets (7d/30d/90d/custom date picker), cross-filtering with active filter pills, filter dropdowns panel, refresh button.
>
> ### 13. Customize for the vertical
>
> - Pipeline statuses: keep the default `new → contacted → quoted → won/lost/spam` unless the brief specifies different. Examples: dental clinic might use `new → contacted → consultation-booked → treatment-active → completed/lost`; restaurant booking might use `new → confirmed → seated/no-show/cancelled`. Define in the brief; Claude updates the `STATUSES` array + `STATUS_COLORS` map in `SubmissionsTable.tsx` and `dashboard/page.tsx`.
> - `page-names.ts`: every route in this codebase mapped to a friendly name.
> - Form fields: if the brief has fields beyond the default (name/email/phone/service/message), add a `0005_add_*.sql` migration, update `app/api/contact/route.ts` validation + INSERT, and update `SubmissionsTable.tsx` to show the field in the expanded panel.
>
> ## Apply migrations
>
> ```bash
> pnpm db:migrate
> ```
>
> Reports each migration applied. Idempotent — rerunning is a no-op.
>
> ## Verify
>
> 1. `pnpm dev` → submit the home-page contact form → returns `{ "success": true }`. Confirm a row appeared in Turso: `turso db shell <name>-db "SELECT * FROM form_submissions ORDER BY created_at DESC LIMIT 5;"`. (Email sending still TODO — phase 10 wires that.)
> 2. Browse around → analytics beacon fires on each navigation (visible in Network tab as POST to `/api/analytics/track`).
> 3. Visit `/sign-in` → Clerk sign-in UI appears, dark themed.
> 4. Visit `/dashboard` without signing in → redirects to `/sign-in`.
> 5. Sign in → still redirects (you're not admin yet). Go to Clerk Dashboard → Users → your user → Public Metadata → set `{ "role": "admin" }`. Reload `/dashboard`.
> 6. Dashboard overview loads with stat cards, pipeline chart, recent submissions (the one you just submitted).
> 7. `/dashboard/submissions` — your submission appears. Test the CRM moves: star it, set status to "contacted", set a follow-up date, type a note, archive it, unarchive, delete.
> 8. `/dashboard/analytics` — visible page views from your browsing earlier. Click a top page → filter applies. Click country chip → unfiltered.
>
> ## What NOT to do
>
> - Do NOT use Cloudflare D1 instead of Turso. The reference originally shipped on D1 and was switched to Turso to be hosting-agnostic. The `getDB()` shape is identical to the D1 binding API on purpose.
> - Do NOT replace the client-side `<AnalyticsTracker />` with `proxy.ts` (proxy/middleware) tracking. Proxy fires on every request including static assets — filtering real page views from that at the proxy layer is fragile. Already documented in `architecture.md`.
> - Do NOT use cookies, localStorage, or client fingerprinting for unique-visitor counting. The daily SHA-256 of IP+UA hash is enough — accurate enough for client analytics, GDPR-safe.
> - Do NOT add a third-party analytics provider in parallel. Pick one source of truth.
> - Do NOT customize Clerk's session token to include `publicMetadata`. The admin check via `clerkClient().users.getUser()` is one extra call per protected request, not worth the brittleness of session-template configuration.
> - Do NOT skip `export const runtime = "nodejs"` on the API routes. `@libsql/client` needs Node, not Edge.
> - Do NOT use the `useAuth()` client hook to gate the dashboard pages. The proxy already redirects unauthenticated users. Inside pages, `auth()` server-side + `requireAdmin()` is what enforces admin role.
> - Do NOT install Recharts / Visx / a charting library for the analytics page. The bars are CSS-only. The reference uses plain divs with `height: %` and gradient backgrounds.
>
> ## Acceptance
>
> - `pnpm db:migrate` succeeds.
> - Contact form persists to Turso.
> - Page views log to Turso.
> - Dashboard is admin-only (unauth → /sign-in; auth but not admin → 403).
> - All CRM operations work end-to-end (single + bulk).
> - Analytics filters all cross-apply correctly.
> - Export `?format=csv` downloads a valid CSV.
>
> Report back the final file tree under `app/api/`, `app/dashboard/`, `app/components/dashboard/`, and `app/lib/`, plus the result of `pnpm build` (it should succeed without warnings about server-only modules leaking to client bundles).

---

## Notes for the human

- **Why the existing reference docs?** This dashboard was built and refined across multiple client sites. The architecture decisions (Turso over D1, client beacon over middleware, no cookies for unique visitors, manual admin assignment) all have specific rationale documented in `architecture.md`. Re-deriving them from scratch wastes a Claude session.
- **Manual admin assignment instead of self-service** is deliberate. Self-service admin signup means anyone who finds `/sign-in` and creates an account becomes an admin — bad. With manual assignment via Clerk Dashboard, a non-admin user can sign in but `requireAdmin()` returns 403.
- **The "starred + follow-up" combo carries 80% of CRM value.** Don't skip implementing them carefully. They're what makes a CRM feel like a CRM rather than a database viewer.
- **Country detection depends on Cloudflare proxy.** If you're not behind Cloudflare in production, the `country` column will be null. Add a different geo lookup or accept null — the analytics works without it.
