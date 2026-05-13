# 02 — Stack & Foundation

Hand this whole file to a fresh Claude Code session opened in an **empty directory**. Paste your filled-out [business brief](./00-business-brief-template.md) at the top first, then paste the prompt below.

---

### ▶ Prompt to Claude

> Set up a new website project for **`{{BRAND_NAME}}`** — a `{{VERTICAL}}` business in `{{LOCATION}}`. The site will be cinematic and editorial: scroll-scrubbed hero video, pinned-stack sections, smooth scroll, dark warm-ink background with a `{{ACCENT_HEX}}` accent. We're building bottom-up across 11 phases; this file is **phase 02 — Stack & Foundation**.
>
> ## Hard requirements
>
> **This is NOT the Next.js you know.** I am using Next.js **16.x** and React **19.x**. Several APIs have moved or been renamed since your training data. Before writing any code that touches Next.js APIs (Link prefetching, middleware, fonts, metadata, server actions, route handlers, image), open `node_modules/next/dist/docs/` and read the relevant doc. In particular:
>
> - `middleware.ts` no longer exists at the app root — it is now `proxy.ts`. Same API surface, new filename. The Clerk integration uses `clerkMiddleware()` inside `proxy.ts`.
> - Heed every deprecation notice. If a doc says "X is deprecated, use Y", use Y.
> - When in doubt, prefer the App Router primitives (`app/`) over anything `pages/`-shaped.
>
> If you find a real conflict between this prompt and the in-repo Next.js docs, the in-repo docs win.
>
> ## What to build in this phase
>
> 1. **Scaffold a new Next.js 16 + React 19 + TypeScript app** with the App Router. Do NOT use `create-next-app` — it will pull a templated `app/page.tsx` and other defaults that conflict with what we're building. Instead, build the file tree by hand:
>
>    ```
>    .
>    ├── package.json
>    ├── tsconfig.json
>    ├── next.config.ts
>    ├── postcss.config.mjs
>    ├── eslint.config.mjs
>    ├── .gitignore
>    ├── .env.local                 # empty placeholder, fill in phase 09
>    ├── proxy.ts                   # empty stub for now; Clerk goes here in phase 09
>    ├── app/
>    │   ├── layout.tsx
>    │   ├── globals.css            # tiny stub; phase 03 fills it
>    │   ├── (site)/
>    │   │   ├── layout.tsx
>    │   │   └── page.tsx           # placeholder home
>    │   ├── components/
>    │   │   └── SmoothScroll.tsx   # built in this phase
>    │   └── lib/
>    │       └── utils.ts           # cn() helper
>    └── public/                    # empty
>    ```
>
>    **`app/lib/` and `app/components/` are nested inside `app/`, not at the repo root.** All imports are `@/app/lib/...` and `@/app/components/...`. Configure `tsconfig.json` paths accordingly.
>
> 2. **Install dependencies via pnpm**:
>
>    ```json
>    "dependencies": {
>      "next": "16.2.4",
>      "react": "19.2.4",
>      "react-dom": "19.2.4",
>      "gsap": "^3.15.0",
>      "lenis": "^1.3.23"
>    },
>    "devDependencies": {
>      "typescript": "^5",
>      "@types/node": "^20",
>      "@types/react": "^19",
>      "@types/react-dom": "^19",
>      "eslint": "^9",
>      "eslint-config-next": "16.2.4",
>      "tailwindcss": "^4",
>      "@tailwindcss/postcss": "^4"
>    }
>    ```
>
>    Use `pnpm` (`pnpm install`). The Resend, Clerk, Turso, and tsx packages get added in phases 09/10 — do not add them yet.
>
> 3. **Tailwind v4 setup**. Tailwind 4 uses CSS-first config — there is no `tailwind.config.ts`. Configuration lives **inside `app/globals.css`** via `@theme` directives. For now `globals.css` should contain only:
>
>    ```css
>    @import "tailwindcss";
>
>    :root {
>      /* Filled in phase 03 — design tokens */
>    }
>
>    html, body {
>      background: #0f0b06;
>      color: #ece3cc;
>      overflow-x: hidden;
>    }
>    ```
>
>    `postcss.config.mjs` must use `@tailwindcss/postcss`:
>
>    ```js
>    export default { plugins: { "@tailwindcss/postcss": {} } };
>    ```
>
> 4. **Fonts.** Configure three Google fonts via `next/font/google` in `app/layout.tsx`:
>    - Display: `{{DISPLAY_FONT}}` — weights `200, 300, 400, 500, 600, 700, 800`, variable `--font-display`
>    - Body: `{{BODY_FONT}}` — weights `300, 400, 500, 600`, variable `--font-body`
>    - Mono: `{{MONO_FONT}}` — weights `300, 400, 500`, variable `--font-mono`
>
>    All three with `display: "swap"`. Attach all three CSS variables to the `<html>` element.
>
> 5. **Root `app/layout.tsx`** exports `metadata` (`title: "{{BRAND_NAME}} — {{TAGLINE}}"`, `description`, `icons: { icon: "/favicon.ico" }`) and renders:
>
>    ```tsx
>    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable} h-full`}>
>      <body className="noise min-h-full flex flex-col bg-ink text-bone">
>        {children}
>      </body>
>    </html>
>    ```
>
>    Do NOT add the Clerk provider yet — phase 09 adds it.
>
> 6. **`app/(site)/layout.tsx`** is a route group layout that renders `<SmoothScroll />` once, plus a placeholder `<header>` and `<main>{children}</main>` and `<footer>`. Header and footer become real components in phase 07.
>
> 7. **`app/(site)/page.tsx`** is a placeholder home — a single full-viewport section with the brand name and tagline centered, so we can verify the foundation runs. Real home content comes in phases 04–08.
>
> 8. **Build `app/components/SmoothScroll.tsx`** as a client component (`"use client"`). It owns the page's scroll authority for the rest of the project — every other animation (`<ScrollVideo>`, `<CollectionOverture>`, `<PortfolioStack>`) hooks into the same Lenis instance via GSAP's `ScrollTrigger`. Behavior:
>
>    - On mount, create a single `Lenis` instance with: `duration: 1.25`, easing `(t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))`, `smoothWheel: true`, `wheelMultiplier: 0.95`, `touchMultiplier: 1.1`, `lerp: 0.095`.
>    - **Skip entirely** if the user has `prefers-reduced-motion: reduce` OR if `pointer: coarse` (touch device). In those cases the component renders nothing and native scroll takes over. Touch devices get awful jank from Lenis composed with pinned GSAP timelines — accept the native scroll there.
>    - Bridge Lenis ↔ GSAP: `lenis.on("scroll", ScrollTrigger.update)`, `gsap.ticker.add((time) => lenis.raf(time * 1000))`, `gsap.ticker.lagSmoothing(0)`.
>    - Expose the instance on `window.__lenis` (typed via `declare global { interface Window { __lenis?: Lenis } }`). Other components (the navbar) read it to programmatically scroll-to-top on same-route clicks.
>    - Intercept clicks on any anchor `a[href^='#']` or `a[href*='/#']` whose target exists in the current document. `preventDefault()` and call `lenis.scrollTo(target, { offset: -80, duration: 1.4 })`. Anchors whose target is on a different page should fall through to Next.js Link navigation.
>    - On **route change** (use `usePathname()` from `next/navigation` and a `useRef` to skip the first run): stop any in-flight Lenis scroll, then:
>      - If the new URL has a hash, wait one `requestAnimationFrame` for the new page to mount, find the target by id, and `lenis.scrollTo(target, { offset: -80, duration: 1.1, force: true })`. If the target doesn't exist, fall back to scroll-to-top.
>      - Otherwise hard-reset: `window.scrollTo(0, 0)` then `lenis.scrollTo(0, { immediate: true, force: true })` then `lenis.start()`.
>      - After mount, `requestAnimationFrame(() => ScrollTrigger.refresh())` so any pinned section in the new page binds to the new geometry, not the previous page's.
>    - Returns `null`.
>
>    **Why the route-reset block matters**: Next.js 16's Link maintains scroll position by default when the new page is in the viewport. On tall same-background pages that makes the second page inherit the first page's scroll position — breaking the expected "click nav → land on hero" behavior and leaving pinned sections mid-pin.
>
> 9. **`app/lib/utils.ts`** exports a `cn(...inputs: ClassValue[])` helper using `clsx` + `tailwind-merge`. (Add those two as deps: `pnpm add clsx tailwind-merge`.)
>
> 10. **`.gitignore`**: standard Next.js gitignore — `node_modules`, `.next`, `.env*.local`, `*.tsbuildinfo`, `.DS_Store`, `dist`, `build`, `coverage`. Keep `.env.local.example` if you create one. The frame folders under `public/frames*` should NOT be gitignored — they're shipped assets.
>
> 11. **`eslint.config.mjs`** extends `next/core-web-vitals` and `next/typescript`. Allow `@typescript-eslint/no-unused-vars` warning, not error.
>
> 12. **Verify**: run `pnpm install` then `pnpm dev`. Open `http://localhost:3000`. Expected outcome: a full-viewport dark page showing the brand name + tagline centered. Open dev tools → no console errors. Scroll: should feel smooth (Lenis active on desktop) or native (on touch / reduced-motion).
>
> ## What NOT to do this phase
>
> - Do NOT install Clerk, Resend, `@libsql/client`, or `tsx`. Those land in phases 09/10.
> - Do NOT add a Tailwind config file. Tailwind 4 is CSS-first; everything goes in `globals.css`.
> - Do NOT write any `<ScrollVideo>`, `<PortfolioStack>`, or `<CollectionOverture>` code yet. Those each get their own phase.
> - Do NOT add reveal animations, navbar, or footer with real content. Stubs only.
> - Do NOT touch ESLint with custom rules beyond extending the Next.js presets — premature.
> - Do NOT install GSAP plugins (only the core `gsap` package; `ScrollTrigger` ships inside `gsap/ScrollTrigger`).
>
> ## Acceptance
>
> - `pnpm dev` runs without warnings.
> - Page renders brand name + tagline centered.
> - Smooth scroll works on desktop, native scroll on mobile / reduced-motion.
> - No console errors.
> - Lenis is on `window.__lenis` (verify in the console: `window.__lenis` returns the instance on desktop, `undefined` on mobile).
>
> Report back the resulting file tree and the contents of `package.json` when done.

---

## Notes for the human (not for Claude)

- **Why CSS-first Tailwind v4?** Tailwind 4 ships a Lightning CSS-based engine. Configuration via CSS `@theme` is significantly faster than the v3 JS config and is the supported path going forward. If you've worked in v3, the muscle-memory move of editing `tailwind.config.ts` no longer applies.
- **Why ban touch-device Lenis?** Touch devices generate sub-pixel scroll events at high frequency. Composing them with GSAP-pinned timelines that update on every Lenis frame produces stuttering that costs more in user-perception than the smooth scroll buys. The site degrades gracefully to native momentum scroll on phones; everything still works.
- **Why `proxy.ts` and not `middleware.ts`?** Next.js 16 renamed `middleware.ts` to `proxy.ts` at the same time it stabilized the new request lifecycle. Same API. If a tutorial elsewhere says "create middleware.ts", they're on Next.js 15.
