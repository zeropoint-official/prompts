# 03 — Design Language

Paste the [business brief](./00-business-brief-template.md) values at the top of the session, then this prompt. You're in the same project from phase 02.

---

### ▶ Prompt to Claude

> Fill out the project's design system. Phase 02 left `app/globals.css` as a near-empty stub; this phase replaces it with the full editorial design language. The result has to feel like a real studio shipped it — not "tailwind defaults with a custom color."
>
> ## Design philosophy
>
> Four moves give the site its character. Implement all four:
>
> 1. **Warm ink instead of pure black.** The background is `#0f0b06` with two radial-gradient warm-spots layered on top. Pure `#000` is what makes a site read as "template."
> 2. **Single chromatic accent used like a knife.** The accent (`{{ACCENT_HEX}}`, plus brighter/deeper variants) appears only in: hairlines, eyebrow micro-labels, focused input bottom border, one CTA button background, gradient-text moments in display headings, hover affordances. **Never** as a card fill, never as a large block of color.
> 3. **Three fonts, three sizes, three weights — not the Tailwind preset ladder.** Display weight 200–300 at huge sizes (clamp 3rem–9vw range). Body weight 300–400. Mono weight 300–400 at tiny sizes (~0.55–0.68rem) with `letter-spacing: 0.22em–0.4em` and `text-transform: uppercase`.
> 4. **Hairlines, brackets, and rules** instead of cards/shadows/borders. The structural language is *typographic*, not card-based.
>
> ## Tokens (Tailwind v4 — `@theme inline`)
>
> Replace `app/globals.css` with the full version below. Substitute `{{ACCENT_HEX}}`, `{{ACCENT_BRIGHT_HEX}}`, `{{ACCENT_DEEP_HEX}}` from the brief; the other colors stay as-is. Anywhere a literal "gold" appears in the class names below, **keep the name "gold"** in CSS — it's the project's name for the chromatic accent. We're not renaming the class to `--color-brand`; that buys nothing and breaks pattern recognition for anyone reading the codebase.
>
> ```css
> @import "tailwindcss";
>
> :root {
>   /* warm editorial espresso — not pure black */
>   --ink:       #0f0b06;
>   --ink-soft:  #181108;
>   --ink-panel: #1f1709;
>
>   /* chromatic accent — substitute from the brief */
>   --gold:        {{ACCENT_HEX}};
>   --gold-bright: {{ACCENT_BRIGHT_HEX}};
>   --gold-mid:    /* between accent and deep, ~70/30 lerp */;
>   --gold-deep:   {{ACCENT_DEEP_HEX}};
>   --gold-ember:  /* darkest variant, ~60% darker than deep */;
>
>   --bone:      #ece3cc;
>   --bone-dim:  rgba(236, 227, 204, 0.55);
>   --line:        rgba({{ACCENT_RGB}}, 0.22);   /* line uses accent RGB */
>   --line-strong: rgba({{ACCENT_RGB}}, 0.40);
> }
>
> @theme inline {
>   --color-ink: var(--ink);
>   --color-ink-soft: var(--ink-soft);
>   --color-ink-panel: var(--ink-panel);
>   --color-gold: var(--gold);
>   --color-gold-bright: var(--gold-bright);
>   --color-gold-mid: var(--gold-mid);
>   --color-gold-deep: var(--gold-deep);
>   --color-gold-ember: var(--gold-ember);
>   --color-bone: var(--bone);
>   --color-bone-dim: var(--bone-dim);
>   --color-line: var(--line);
>   --color-line-strong: var(--line-strong);
>   --font-display: var(--font-display);
>   --font-body: var(--font-body);
>   --font-mono: var(--font-mono);
> }
>
> * { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; text-rendering: optimizeLegibility; }
>
> html, body {
>   background: var(--ink);
>   color: var(--bone);
>   font-family: var(--font-body), system-ui, sans-serif;
>   font-feature-settings: "ss01", "cv11";
>   overflow-x: hidden;
> }
>
> /* warm radial spots so the ink never reads flat */
> body {
>   background:
>     radial-gradient(1100px 700px at 80% -10%, rgba({{ACCENT_RGB}}, 0.08), transparent 60%),
>     radial-gradient(900px 600px at -10% 110%, rgba({{ACCENT_RGB}}, 0.06), transparent 60%),
>     var(--ink);
> }
>
> ::selection { background: var(--gold); color: var(--ink); }
>
> ::-webkit-scrollbar { width: 6px; height: 6px; }
> ::-webkit-scrollbar-track { background: transparent; }
> ::-webkit-scrollbar-thumb { background: var(--gold-deep); }
> ::-webkit-scrollbar-thumb:hover { background: var(--gold); }
>
> /* Lenis hooks — needed for smooth-scroll integration. */
> html.lenis, html.lenis body { height: auto; }
> .lenis.lenis-smooth { scroll-behavior: auto !important; }
> .lenis.lenis-smooth [data-lenis-prevent] { overscroll-behavior: contain; }
> .lenis.lenis-stopped { overflow: clip; }
> .lenis.lenis-smooth iframe { pointer-events: none; }
>
> .font-display { font-family: var(--font-display), system-ui, sans-serif; font-feature-settings: "ss01", "cv11", "ss03"; }
> .font-body { font-family: var(--font-body), system-ui, sans-serif; }
> .font-mono { font-family: var(--font-mono), ui-monospace, monospace; }
> ```
>
> Convert `{{ACCENT_HEX}}` to an `R, G, B` triple for `{{ACCENT_RGB}}` (e.g. `#d4b46a` → `212, 180, 106`). Compute `--gold-mid` as a 70/30 mix toward `--gold-deep`; compute `--gold-ember` as ~40% lightness reduction from `--gold-deep`. For the default gold the values were: mid `#c2994d`, ember `#5a4420`.
>
> ## Reusable component classes
>
> Append the following to `globals.css`. Don't put these in a separate file — they're authored alongside the tokens because they reference them, and there's no other consumer.
>
> ### Eyebrow (mono micro-label)
>
> ```css
> .eyebrow {
>   font-family: var(--font-mono), ui-monospace, monospace;
>   text-transform: uppercase;
>   letter-spacing: 0.28em;
>   font-size: 0.66rem;
>   font-weight: 400;
>   color: var(--gold);
> }
> .eyebrow-sm { /* same family, 0.24em tracking, 0.6rem */ }
> ```
>
> ### Hairline (the structural rule used everywhere)
>
> ```css
> .hairline {
>   height: 1px;
>   background: linear-gradient(90deg, transparent, var(--gold-deep), var(--gold), var(--gold-deep), transparent);
> }
> .hairline-v {
>   width: 1px;
>   background: linear-gradient(180deg, transparent, var(--gold-deep), var(--gold), var(--gold-deep), transparent);
> }
> ```
>
> ### Gold-text (gradient-text for one or two words in a display heading)
>
> ```css
> .gold-text {
>   background: linear-gradient(180deg, var(--gold-bright) 0%, var(--gold) 40%, var(--gold-ember) 100%);
>   -webkit-background-clip: text;
>   background-clip: text;
>   -webkit-text-fill-color: transparent;
> }
> .gold-shine {
>   /* horizontal shine that loops every 8s — used very sparingly */
>   background: linear-gradient(100deg, var(--gold-ember) 0%, var(--gold-bright) 35%, var(--gold) 50%, var(--gold-bright) 65%, var(--gold-ember) 100%);
>   background-size: 200% 100%;
>   -webkit-background-clip: text;
>   background-clip: text;
>   -webkit-text-fill-color: transparent;
>   animation: shine 8s linear infinite;
> }
> @keyframes shine { 0% { background-position: 0% 50%; } 100% { background-position: -200% 50%; } }
> ```
>
> ### Noise overlay (full-bleed SVG turbulence, fixed)
>
> ```css
> .noise::before {
>   content: "";
>   position: fixed;
>   inset: 0;
>   pointer-events: none;
>   opacity: 0.04;
>   z-index: 100;
>   mix-blend-mode: overlay;
>   background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
> }
>
> /* CRITICAL: drop the fixed SVG+blend overlay on mobile — it repaints the
>    whole viewport on every scroll frame and is the #1 source of touch jank. */
> @media (max-width: 767px) {
>   .noise::before { display: none; }
> }
> ```
>
> ### Corner-bracket frame
>
> A common motif — a rectangle with four tiny right-angle brackets at its corners. Replaces the temptation to add a 1px border (which looks utilitarian). Used by `<PortfolioStack>` cards.
>
> ```css
> .frame { position: relative; }
> .frame::before, .frame::after,
> .frame > .frame-tr, .frame > .frame-bl {
>   content: "";
>   position: absolute;
>   width: 22px;
>   height: 22px;
>   border: 1px solid var(--gold);
>   pointer-events: none;
> }
> .frame::before { top: 0; left: 0;     border-right: 0; border-bottom: 0; }
> .frame::after  { bottom: 0; right: 0; border-left: 0;  border-top: 0;    }
> .frame > .frame-tr { top: 0; right: 0;     border-left: 0;  border-bottom: 0; }
> .frame > .frame-bl { bottom: 0; left: 0;   border-right: 0; border-top: 0;    }
> ```
>
> Usage: `<div class="frame">…<span class="frame-tr" /><span class="frame-bl" /></div>`. The component supplies the two extra spans because pseudo-elements can only do two of the four corners.
>
> ### Buttons (two and only two)
>
> ```css
> @layer components {
>   .btn-gold {
>     position: relative;
>     display: inline-flex;
>     align-items: center;
>     gap: 0.8rem;
>     padding: 0.95rem 1.7rem;
>     border: 1px solid var(--gold);
>     color: var(--gold);
>     font-family: var(--font-mono), ui-monospace, monospace;
>     text-transform: uppercase;
>     letter-spacing: 0.22em;
>     font-size: 0.68rem;
>     font-weight: 400;
>     overflow: hidden;
>     transition: color 0.6s ease, letter-spacing 0.6s ease;
>     isolation: isolate;
>     background: rgba({{ACCENT_RGB}}, 0.03);
>   }
>   .btn-gold::before {
>     content: "";
>     position: absolute;
>     inset: 0;
>     background: linear-gradient(120deg, var(--gold), var(--gold-bright), var(--gold));
>     transform: translateX(-101%);
>     transition: transform 0.7s cubic-bezier(0.7, 0, 0.2, 1);
>     z-index: -1;
>   }
>   .btn-gold:hover { color: var(--ink); letter-spacing: 0.26em; }
>   .btn-gold:hover::before { transform: translateX(0); }
>
>   .btn-ghost {
>     display: inline-flex; align-items: center; gap: 0.7rem;
>     font-family: var(--font-mono), ui-monospace, monospace;
>     text-transform: uppercase;
>     letter-spacing: 0.22em;
>     font-size: 0.66rem;
>     color: var(--bone-dim);
>     transition: color 0.5s, gap 0.5s;
>   }
>   .btn-ghost:hover { color: var(--gold); gap: 1rem; }
> }
> ```
>
> ### Reveal class (animation hook for `<Reveal>` component built in phase 07)
>
> ```css
> .reveal {
>   opacity: 0;
>   transform: translateY(44px);
>   transition: opacity 1.3s cubic-bezier(0.2,0.7,0.2,1),
>               transform 1.3s cubic-bezier(0.2,0.7,0.2,1);
> }
> .reveal.in { opacity: 1; transform: translateY(0); }
> ```
>
> ### Fade-up keyframe (CSS-driven first-paint reveal — used inside ScrollVideo hero)
>
> ```css
> @keyframes fadeup { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
> .fade-up { animation: fadeup 1.4s cubic-bezier(0.2, 0.7, 0.2, 1) both; }
> ```
>
> ### Inputs (no boxes — bottom-border only)
>
> ```css
> .input-field {
>   width: 100%;
>   background: transparent;
>   border: 0;
>   border-bottom: 1px solid var(--line);
>   padding: 1.1rem 0;
>   color: var(--bone);
>   font-family: var(--font-body);
>   font-size: 1rem;
>   outline: none;
>   transition: border-color 0.4s ease;
> }
> .input-field:focus { border-color: var(--gold); }
> .input-field::placeholder { color: rgba(236, 227, 204, 0.3); letter-spacing: 0.04em; }
> .input-field option { background: var(--ink); color: var(--bone); }
> ```
>
> ### Misc utilities
>
> ```css
> @keyframes blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }
> .blink { animation: blink 1.2s steps(1) infinite; }
>
> @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
> .marquee { animation: marquee 50s linear infinite; }
>
> .vertical { writing-mode: vertical-rl; transform: rotate(180deg); }
> .serif-nums { font-variant-numeric: tabular-nums; font-feature-settings: "tnum", "cv11"; }
>
> .glow-hover { position: relative; }
> .glow-hover::after {
>   content: ""; position: absolute; inset: -1px;
>   border: 1px solid transparent;
>   transition: border-color 0.6s, box-shadow 0.6s;
>   pointer-events: none;
> }
> .glow-hover:hover::after {
>   border-color: var(--gold);
>   box-shadow: 0 0 0 1px rgba({{ACCENT_RGB}}, 0.25), 0 20px 60px -20px rgba({{ACCENT_RGB}}, 0.3);
> }
> ```
>
> ## Verify
>
> Update `app/(site)/page.tsx`'s placeholder home to demonstrate the system:
>
> ```tsx
> <section className="min-h-screen flex flex-col items-center justify-center px-6 gap-8">
>   <span className="eyebrow">§ i · {{LOCATION}}</span>
>   <h1 className="font-display font-extralight text-[clamp(3rem,10vw,8rem)] tracking-[-0.04em] leading-[0.88] text-center">
>     <span className="block">{{BRAND_NAME_LINE_1}}</span>
>     <span className="block gold-text">{{BRAND_NAME_LINE_2}}</span>
>   </h1>
>   <div className="hairline w-48" />
>   <p className="font-display text-bone/55 text-xl font-light tracking-[-0.02em] max-w-md text-center">
>     {{TAGLINE}}
>   </p>
>   <div className="flex gap-5 mt-4">
>     <button className="btn-gold">Primary action →</button>
>     <button className="btn-ghost">Secondary ↗</button>
>   </div>
>   <div className="frame p-6 mt-12 max-w-md">
>     <span className="frame-tr" /><span className="frame-bl" />
>     <p className="font-body text-bone/70 text-base">
>       A small block of body copy inside the corner-bracket frame, to demonstrate the structural language.
>     </p>
>   </div>
> </section>
> ```
>
> Run `pnpm dev`. The page should now show: warm-ink background with subtle radial spots, fine grain noise overlay (desktop only), eyebrow micro-label, large extralight display heading with one gradient-text line, hairline rule, paragraph, two buttons (one filled-on-hover, one ghost), corner-bracket frame containing body text. No console errors. The accent should match `{{ACCENT_HEX}}` exactly.
>
> ## What NOT to do
>
> - Do NOT add a `dark:` variant. The site is dark-only; there is no light mode.
> - Do NOT introduce a card / shadow / rounded-rectangle component. The design language is hairlines and brackets, not cards.
> - Do NOT add CSS variables for spacing scale. Tailwind's defaults are fine.
> - Do NOT install a UI kit (shadcn, Radix). Every component below — including the dashboard — is built primitive-up.
> - Do NOT add framer-motion. Animation is GSAP + Lenis + CSS keyframes only. Two animation systems is enough.
> - Do NOT add a logo SVG component yet. The placeholder home shows the brand wordmark in display type until phase 07 ships the real navbar.
>
> ## Acceptance
>
> - The verification page renders correctly with all design elements visible.
> - Hovering `.btn-gold` sweeps the gold gradient in from the left, letter-spacing widens slightly, text turns to ink color.
> - Hovering `.btn-ghost` widens the gap and turns the text gold.
> - Resizing the viewport down to mobile: the `.noise::before` overlay disappears (verified in dev tools — no `pointer-events: none` fixed element with the SVG data URI).
> - No console errors.
>
> Report back: the final `globals.css` length in lines, and a screenshot description of the rendered verification page.

---

## Notes for the human

- **Why is the accent called "gold" in code regardless of your real brand color?** It's the project's name for "the one chromatic accent." If your accent is sage green, the class is still `text-gold`. This is a deliberate choice: consistent naming across all Master-Homes-derived sites means anyone who's worked on one of them can read the others. If that bothers you, rename in CSS after the fact — but don't try to rename mid-build, it's churn.
- **Why no `dark:` variant?** Editorial dark sites of this kind have *one* mode. Adding a light mode doubles the CSS surface and is usually never used. If a client absolutely insists later, fork the tokens then.
- **The noise overlay matters.** Without it the warm ink looks flat. With it, the dark areas have texture that reads as filmic. It's 1 KB of inline SVG — cheap on desktop, but a real cost on mobile because it's `position: fixed` and `mix-blend-mode: overlay`, which forces a full-viewport composite on every scroll frame. The media query that disables it on mobile is load-bearing.
