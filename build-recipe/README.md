# Build Recipe — Cinematic Editorial Websites with Claude Code

A complete recipe for building a website like Master Homes — scroll-linked hero film, pinned-stack scrolling sections, smooth Lenis scroll, GSAP ScrollTrigger reveals, a real admin dashboard with CRM + analytics, and Resend email — for **any business, in any vertical.**

This folder is a set of **prompts** you hand to Claude Code, one at a time, in order. Each file is self-contained: paste it into a fresh Claude Code session and Claude will produce the part of the site that file describes. The first file sets up the project; the last one deploys it.

---

## What you're building

A single Next.js 16 codebase that includes:

1. **A cinematic public site** with:
   - A scroll-scrubbed hero animation driven by 60-ish frames extracted from an AI-generated video (the "scroll video"). The frames are baked from a Kling / Sora / Veo render — see [01-scroll-video-workflow.md](./01-scroll-video-workflow.md).
   - Smooth-scroll via [Lenis](https://github.com/darkroomengineering/lenis), composed with GSAP `ScrollTrigger` so pinned timelines, parallax, and scrub effects all share one scroll authority.
   - A pinned **collection overture** section: a single image expands from a tiny clip-path slit into full bleed while two large display words drift in opposite directions behind it.
   - A pinned **portfolio stack**: a list of items (residences / case studies / products / projects) that slide up over each other, one viewport at a time.
   - A correspondence section, footer marquee, navbar with route-aware active states, and per-item dossier pages.
   - An editorial design language: warm ink background, gold accent (or your brand's accent), display + body + mono font triad, corner-bracket frames, hairline rules, eyebrow labels, vertical progress rails, generous letter-spacing on uppercase mono.

2. **An admin dashboard at `/dashboard`** with:
   - Lead CRM (statuses, follow-ups, star/priority, tags, internal notes, full-text search, bulk actions, CSV/JSON export).
   - Custom first-party analytics (page views, unique visitors, referrers, devices, countries, hour-of-day, daily traffic, top pages).
   - Auth via Clerk (admin-only, `publicMetadata.role === "admin"`).
   - Email via Resend (admin notification + customer auto-reply on every form submit).
   - Turso (libSQL / SQLite) for storage. Hosting-agnostic — no Cloudflare / Vercel binding required.

3. **A frame pipeline** that converts an AI-generated MP4 into the responsive WebP frame tiers the hero loads (mobile / desktop-1x / desktop-2x).

---

## Use these prompts in order

| # | File | What Claude will do |
|---|------|---------------------|
| 1 | [01-scroll-video-workflow.md](./01-scroll-video-workflow.md) | **You** (manual) — generate the hero video on Kling and convert it to scroll frames using ffmpeg. This is the only step you do *before* Claude builds. |
| 2 | [02-stack-and-foundation.md](./02-stack-and-foundation.md) | Scaffold the Next.js 16 project, install deps, set up Tailwind v4 design tokens, fonts, layout shell, smooth scroll. |
| 3 | [03-design-language.md](./03-design-language.md) | Build the global CSS design system: editorial typography, gold accent, hairlines, corner-bracket frames, buttons, inputs, noise overlay, reveal animations. |
| 4 | [04-scroll-video-hero.md](./04-scroll-video-hero.md) | Build the `<ScrollVideo>` component — the canvas-based scroll-scrubbed hero film with responsive frame tiers, mobile optimization, and overlay UI. |
| 5 | [05-pinned-overture.md](./05-pinned-overture.md) | Build the `<CollectionOverture>` section — pinned aperture-style image reveal with drifting display words, corner brackets, vertical progress rail. |
| 6 | [06-portfolio-stack.md](./06-portfolio-stack.md) | Build the `<PortfolioStack>` — items stack on each other via GSAP `ScrollTrigger` pin (desktop) and a plain vertical list (mobile). |
| 7 | [07-reveal-and-secondary.md](./07-reveal-and-secondary.md) | Build the supporting components: `<Reveal>`, `<Navbar>`, `<Footer>`, `<FooterMarquee>`, `<Correspondence>` contact section, `<Carousel>`. |
| 8 | [08-detail-pages.md](./08-detail-pages.md) | Build the per-item dossier pages (`/homes/[slug]`, `/properties` index, `/about`, `/contact`). |
| 9 | [09-dashboard-and-crm.md](./09-dashboard-and-crm.md) | Build the full admin dashboard: Turso schema + migrations, API routes, Clerk auth proxy, CRM submissions UI, analytics page, overview. |
| 10 | [10-email-resend.md](./10-email-resend.md) | Wire Resend — admin lead-notification email + customer auto-reply confirmation. |
| 11 | [11-deploy.md](./11-deploy.md) | Deploy to your chosen host (Vercel, Fly, Render, VPS, Cloudflare Pages with Node runtime). |

There's also [00-business-brief-template.md](./00-business-brief-template.md) — a fill-in-the-blanks brief you complete *once* before starting. Every later prompt references it so Claude can plug in your brand name, accent color, vertical, copy direction, etc.

---

## How to use a prompt

1. Open a fresh Claude Code session in an empty directory (or in an existing repo, depending on the file).
2. Paste the full contents of the prompt file. The prompt is written *to Claude*, not to you — it already contains all the context Claude needs.
3. Where the prompt says `{{BRAND_NAME}}`, `{{VERTICAL}}`, `{{ACCENT_HEX}}` etc., replace them with the values from your business brief before pasting. (Or paste the brief first and let Claude fill them in.)
4. Wait for Claude to finish, review the diff, and run `pnpm dev`.

You can stop and resume between any two files. The prompts are designed so that each one leaves the codebase in a runnable state.

---

## Mental model

Think of the website as five **layers**, stacked:

```
┌────────────────────────────────────────────────────────────────────┐
│  L5  CRM + Email + Auth + Analytics  (the dashboard)               │
├────────────────────────────────────────────────────────────────────┤
│  L4  Detail pages  (dossier / item / about / contact)              │
├────────────────────────────────────────────────────────────────────┤
│  L3  Reveals, navbar, footer, contact section, carousel            │
├────────────────────────────────────────────────────────────────────┤
│  L2  Pinned sections  (overture, portfolio stack)                  │
├────────────────────────────────────────────────────────────────────┤
│  L1  Hero scroll-video + smooth-scroll + design tokens             │
├────────────────────────────────────────────────────────────────────┤
│  L0  Next.js 16 + Tailwind v4 + fonts + Lenis + GSAP foundation    │
└────────────────────────────────────────────────────────────────────┘
```

Build bottom-up. Don't skip layers — every layer above depends on the design tokens, smooth-scroll authority, and `<Reveal>` primitive from the layers below.

---

## What makes this kind of site distinctive

These are the moves that separate "generic AI-built site" from "this looks like a real studio shipped it":

- **Scroll IS the timeline.** Every motion on the page is locked to scroll position via GSAP `ScrollTrigger` + Lenis. Nothing autoplays in a way that competes with the user's scroll input.
- **Canvas frames, not video.** The hero is a `<canvas>` drawing pre-decoded WebP frames, not a `<video>` element. This is what lets it scrub buttery-smooth at any scroll speed.
- **Mobile is a different page.** GSAP `matchMedia` gates the heavy pinned timelines to desktop. On touch devices, the same sections render statically. Pinning + scrub on mobile is the #1 source of jank.
- **Direct DOM mutation on the hot scroll path.** Inside `<ScrollVideo>`, scroll handlers write to refs and `el.style.*` directly — never `setState` — because re-rendering five overlay divs at 120Hz is what kills frame rate.
- **Editorial typography hierarchy.** Display weight 200–300 at huge sizes, body weight 300–400, mono weight 300 at tiny sizes with `letter-spacing: 0.28em–0.4em uppercase`. Three fonts, three sizes — not the Tailwind preset ladder.
- **Warm ink, not pure black.** `#0f0b06` plus two radial-gradient warm spots, never `#000`. A pure-black background is what makes a site read as "template."
- **Gold accent (or your equivalent) used like a knife.** Hairlines, eyebrow labels, focused-input bottom borders, a single CTA button background, gradient-text in display headings. Never as a card fill or large area.

Keep these moves intact even when you swap the vertical to dental clinic / fitness studio / SaaS landing / restaurant — they're what give the site its character.

---

## When NOT to use this recipe

- **You need a CMS-driven site.** This recipe ships content as TypeScript data files. Excellent for 5–50 items maintained by a developer. Wrong for a 500-page blog or a non-technical content team.
- **You need SEO at the level of a content marketing site.** The hero scroll video is heavy. It loads ~60 WebP frames eagerly. Cool brand sites can afford that; an organic-search-driven site cannot.
- **You're not allowed to use Clerk / Turso / Resend.** Two of those have generous free tiers but they're third-party SaaS dependencies. If your stack must be self-hosted-only, swap them for: Auth.js + your own SQLite + Nodemailer — most of the recipe still applies.

---

## Glossary

- **Scroll video** — A traditional video animation pre-rendered with AI (Kling, Sora, Veo, Runway) then decomposed into ~60 still frames that a canvas paints based on scroll position. The result feels like video, but scrubs at any speed in either direction.
- **Frame tiers** — Three resolution sets (`mobile/`, `desktop-1x/`, `desktop-2x/`) of the same frames. The hero picks one based on viewport width and DPR. Halves mobile bandwidth.
- **Pinned section** — A section that becomes `position: fixed` for the duration of a scroll range, while inner elements animate against scroll. Implemented via GSAP `ScrollTrigger { pin: true }`.
- **Lenis** — The smooth-scroll library that virtualizes wheel events into a tweened scroll position. `ScrollTrigger.update` is wired to Lenis's frame callback so GSAP and Lenis share one timeline.
- **Overture** — Our name for the pinned hero-image reveal section between the scroll video and the portfolio stack. Aperture-style clip-path opening + drifting words behind.
