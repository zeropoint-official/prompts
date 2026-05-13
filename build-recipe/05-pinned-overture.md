# 05 — Pinned Overture (Aperture-Reveal Section)

The second section of the home page. A pinned full-viewport timeline where one signature still image opens like a camera aperture — clipped to a thin horizontal slit at the top of the scrub, expanding to full-bleed by the end — with two large display words drifting in opposite directions behind it.

Paste the [business brief](./00-business-brief-template.md) at the top of the session, then this prompt.

---

### ▶ Prompt to Claude

> Build `app/components/CollectionOverture.tsx` — a pinned full-viewport section between `<ScrollVideo>` and `<PortfolioStack>` on the home page. This is the **transition** between the hero film and the portfolio: a single still image of the most-emblematic item in the portfolio, dramatized.
>
> ## Composition (desktop, 768px+)
>
> ```
> ┌────────────────────────────────────────────────────────────────┐
> │                                                              §ii│
> │           ──── § II · {{SECTION_HEADLINE}} ────                │
> │                                                                │
> │           ┌──┐                                       ┌──┐      │
> │           └  ┘                                       └  ┘      │
> │                                                                │
> │                 ┌──────────────────────────────┐         │     │
> │       RESI    ┃ │                              │ ┃    DENCES   │
> │       (ghost) ┃ │     [signature image]        │ ┃    (drift)  │
> │                 │                              │         │     │ progress
> │                 └──────────────────────────────┘         │     │ rail
> │           ┌  ┐                                       ┌──┐      │
> │           └──┘                                       └──┘      │
> │                                                                │
> │   ──── Four residences.                                        │
> │        Alethriko.                  34.707° N · 33.022° E       │
> │                                    The portfolio, below ↓      │
> │                                                       overture │
> └────────────────────────────────────────────────────────────────┘
> ```
>
> Layers (back to front):
>
> 1. **Background**: warm-ink with a radial accent spot, plus a `border-t border-line` separator from the section above.
> 2. **Ghost monumental word** (back plane): the section's anchor word in display weight 200 at `22vw`, color `var(--gold)/[0.055]` — barely visible. Drifts left-to-right across the scrub.
> 3. **Echo word** (counter-drift): a secondary italic word, even fainter (`text-bone/[0.04]`), drifts right-to-left.
> 4. **Eyebrow bar** at top center: `── § II · {{SECTION_HEADLINE}} ──` with two hairlines that scale-X from 0 → 1 on enter.
> 5. **Corner markers** (top-left "§ ii", top-right "overture"): tiny mono labels in `gold/40`.
> 6. **Vertical progress rail** at right edge: 40px tall, 1px wide gold gradient that scales-Y from 0 → 1 as the user scrubs.
> 7. **Center stage**: the signature image (max-width `min(1060px, calc(62vh * 1.6))` so it always fits), wrapped in a `clip-path` rectangle that starts at `inset(49% 18% 49% 18%)` (a thin slit) and animates to `inset(0% 0% 0% 0%)` (full bleed). The image inside is scaled `1.5` at start, `1.02` at end — gentle "pulling away from the lens" feel.
> 8. **Corner brackets** at the image's four corners: 40px L-shape outlines that fade in + scale up from 0.6 in the back half of the scrub.
> 9. **Aperture flare**: a horizontal gold gradient bar that flashes once across the middle of the image early in the scrub (the moment the slit opens).
> 10. **Bottom caption + meta**: caption left ("`{{OVERTURE_CAPTION}}`"), meta right ("`{{COORDINATES}}` / The portfolio, below ↓").
>
> ## Behavior
>
> ### Pinning (desktop only, 768px+)
>
> Use GSAP `matchMedia` to gate everything to desktop. On mobile the section renders **statically** — none of the GSAP timeline runs, no pinning, no scrub. The initial-hidden states are gated behind `md:` Tailwind prefixes so they only apply when the timeline could run them.
>
> ```ts
> useEffect(() => {
>   const section = sectionRef.current;
>   if (!section) return;
>
>   const mm = gsap.matchMedia();
>
>   mm.add("(min-width: 768px)", () => {
>     const ctx = gsap.context(() => {
>       const tl = gsap.timeline({
>         scrollTrigger: {
>           trigger: section,
>           start: "top top",
>           end: "+=220%",
>           pin: true,
>           scrub: 0.6,         // slight smoothing — not instant
>           anticipatePin: 1,
>         },
>       });
>
>       // Position arguments at the END of each tween are the time offsets on the timeline.
>       // Everything between 0 and ~1.0 happens across the 220% scroll.
>
>       // GHOST WORD — drift L → R, fade in, slight letter-spacing widen
>       tl.fromTo(".overture-ghost",
>         { xPercent: 28, opacity: 0, letterSpacing: "-0.02em" },
>         { xPercent: -32, opacity: 1, letterSpacing: "0.02em", ease: "none" },
>         0,
>       );
>
>       // ECHO WORD — counter drift R → L
>       tl.fromTo(".overture-ghost-echo",
>         { xPercent: -22, opacity: 0 },
>         { xPercent: 24, opacity: 1, ease: "none" },
>         0,
>       );
>
>       // EYEBROW BAR fades + lifts in
>       tl.fromTo(".overture-eyebrow",
>         { opacity: 0, y: -10 },
>         { opacity: 1, y: 0, ease: "power2.out" },
>         0,
>       );
>
>       // EYEBROW HAIRLINES scale-X in from origin
>       tl.fromTo(".overture-rule",
>         { scaleX: 0 },
>         { scaleX: 1, ease: "power2.out" },
>         0,
>       );
>
>       // IMAGE CLIP-PATH — slit → full bleed (the centerpiece)
>       tl.fromTo(".overture-clip",
>         { clipPath: "inset(49% 18% 49% 18%)" },
>         { clipPath: "inset(0% 0% 0% 0%)", ease: "power3.inOut", duration: 1.2 },
>         0.1,
>       );
>
>       // IMAGE SCALE — 1.5 → 1.02 (gentle pull back)
>       tl.fromTo(".overture-img",
>         { scale: 1.5 },
>         { scale: 1.02, ease: "none" },
>         0.1,
>       );
>
>       // APERTURE FLARE — quick yoyo flash mid-opening
>       tl.fromTo(".overture-flare",
>         { opacity: 0 },
>         { opacity: 1, ease: "power2.out", duration: 0.25, yoyo: true, repeat: 1 },
>         0.25,
>       );
>
>       // CORNER BRACKETS appear in back half, stagger
>       tl.fromTo(".overture-bracket",
>         { opacity: 0, scale: 0.6 },
>         { opacity: 1, scale: 1, ease: "power2.out", stagger: 0.04 },
>         0.6,
>       );
>
>       // CAPTION rises in near the end
>       tl.fromTo(".overture-caption",
>         { opacity: 0, y: 28 },
>         { opacity: 1, y: 0, ease: "power2.out" },
>         0.72,
>       );
>
>       tl.fromTo(".overture-meta",
>         { opacity: 0, y: 20 },
>         { opacity: 1, y: 0, ease: "power2.out" },
>         0.78,
>       );
>
>       // PROGRESS RAIL — scales Y from 0 → 1 across the full scrub
>       tl.fromTo(".overture-progress",
>         { scaleY: 0 },
>         { scaleY: 1, ease: "none" },
>         0,
>       );
>     }, section);
>
>     return () => ctx.revert();
>   });
>
>   return () => mm.revert();
> }, []);
> ```
>
> ### Mobile: no timeline at all
>
> Pinning + scrubbed `clip-path` + `scale` on touch scroll is the #1 source of mobile jank. The component renders statically on mobile — all GSAP initial-hidden states (`opacity: 0`, `scaleX: 0`, `scale: 1.5`) live behind `md:` prefixes in the markup so they never apply on small screens. The image renders at full bleed, captions visible, no animation, no pin.
>
> ## DOM structure
>
> Wrap the `<section>` in a `<div className="relative">`. **This wrapper is load-bearing.** When GSAP pins the inner `<section>`, ScrollTrigger wraps it in a "pin-spacer" `<div>`. On Next.js route change, React tries to `removeChild` the `<section>` from its original parent — but the pin-spacer sits in between now, and the removeChild call throws `"Node not a child of this node"`, crashing the page. The extra React-owned wrapper gives React the parent it expects regardless of where GSAP put the section.
>
> ```tsx
> return (
>   <div className="relative">
>     <section
>       ref={sectionRef}
>       className="relative w-full overflow-hidden bg-ink border-t border-line py-24 md:py-0 md:h-screen"
>       aria-label="The Collection — overture"
>     >
>       {/* warm radial tie-in */}
>       <div
>         className="pointer-events-none absolute inset-0 opacity-60"
>         style={{
>           background:
>             "radial-gradient(70% 60% at 50% 50%, rgba({{ACCENT_RGB}}, 0.10), transparent 70%)",
>         }}
>       />
>
>       {/* GHOST WORD — back plane, desktop only */}
>       <div className="hidden md:flex pointer-events-none absolute inset-0 items-center justify-center overflow-hidden select-none">
>         <span
>           className="overture-ghost font-display font-light text-[30vw] md:text-[22vw] leading-none tracking-[-0.05em] text-gold/[0.055] whitespace-nowrap opacity-0"
>           style={{ willChange: "transform, opacity" }}
>         >
>           {{GHOST_WORD_PRIMARY}}
>         </span>
>       </div>
>
>       {/* ECHO WORD — counter drift, even fainter, desktop only */}
>       <div className="hidden md:flex pointer-events-none absolute inset-0 items-center justify-center overflow-hidden select-none">
>         <span
>           className="overture-ghost-echo font-display italic font-light text-[16vw] md:text-[10vw] leading-none tracking-[0.02em] text-bone/[0.04] whitespace-nowrap opacity-0"
>           style={{ willChange: "transform, opacity" }}
>         >
>           · {{GHOST_WORD_ECHO}} ·
>         </span>
>       </div>
>
>       {/* EYEBROW BAR */}
>       <div className="overture-eyebrow relative md:absolute md:top-10 md:left-0 md:right-0 flex items-center justify-center gap-4 z-20 px-6 mb-10 md:mb-0 md:opacity-0">
>         <span className="overture-rule h-px w-10 md:w-16 bg-gold/50 origin-right md:scale-x-0" />
>         <span className="eyebrow whitespace-nowrap">
>           § II · {{SECTION_HEADLINE}}
>         </span>
>         <span className="overture-rule h-px w-10 md:w-16 bg-gold/50 origin-left md:scale-x-0" />
>       </div>
>
>       {/* CORNER markers, desktop only */}
>       <div className="hidden md:block absolute top-8 md:top-10 left-6 md:left-10 font-mono text-[0.56rem] uppercase tracking-[0.3em] text-gold/40 z-10">
>         § ii
>       </div>
>       <div className="hidden md:block absolute top-8 md:top-10 right-6 md:right-10 font-mono text-[0.56rem] uppercase tracking-[0.3em] text-gold/40 z-10">
>         overture
>       </div>
>
>       {/* VERTICAL progress rail — desktop only */}
>       <div className="hidden md:block absolute top-1/2 right-8 -translate-y-1/2 h-40 w-px bg-line z-10">
>         <div
>           className="overture-progress absolute inset-0 bg-gradient-to-b from-gold/60 via-gold to-gold/30 origin-top"
>           style={{ transform: "scaleY(0)" }}
>         />
>       </div>
>
>       {/* CENTER STAGE — image */}
>       <div className="relative md:absolute md:inset-0 flex items-center justify-center px-5 md:px-12 z-10">
>         <div
>           className="relative w-full"
>           style={{ maxWidth: "min(1060px, calc(62vh * 1.6))" }}
>         >
>           {/* 4 corner brackets */}
>           <span className="overture-bracket absolute -top-4 -left-4 md:-top-5 md:-left-5 w-8 h-8 md:w-10 md:h-10 border-l border-t border-gold md:opacity-0" />
>           <span className="overture-bracket absolute -top-4 -right-4 md:-top-5 md:-right-5 w-8 h-8 md:w-10 md:h-10 border-r border-t border-gold md:opacity-0" />
>           <span className="overture-bracket absolute -bottom-4 -left-4 md:-bottom-5 md:-left-5 w-8 h-8 md:w-10 md:h-10 border-l border-b border-gold md:opacity-0" />
>           <span className="overture-bracket absolute -bottom-4 -right-4 md:-bottom-5 md:-right-5 w-8 h-8 md:w-10 md:h-10 border-r border-b border-gold md:opacity-0" />
>
>           <div className="overture-clip relative aspect-[16/10] w-full overflow-hidden bg-ink-soft md:[clip-path:inset(49%_18%_49%_18%)]">
>             <div className="overture-img absolute inset-0 md:scale-[1.5]" style={{ willChange: "transform" }}>
>               <Image
>                 src="{{OVERTURE_IMAGE_PATH}}"
>                 alt="{{BRAND_NAME}} — signature work"
>                 fill
>                 sizes="(max-width: 768px) 100vw, 90vw"
>                 className="object-cover"
>                 priority
>               />
>               {/* vignette + warm radial over the photo */}
>               <div className="absolute inset-0 pointer-events-none" style={{
>                 background:
>                   "linear-gradient(180deg, rgba(15,11,6,0.10) 0%, rgba(15,11,6,0) 28%, rgba(15,11,6,0) 68%, rgba(15,11,6,0.55) 100%)",
>               }} />
>               <div className="absolute inset-0 pointer-events-none mix-blend-overlay" style={{
>                 background:
>                   "radial-gradient(80% 60% at 50% 55%, rgba({{ACCENT_RGB}}, 0.14), transparent 70%)",
>               }} />
>             </div>
>
>             {/* aperture flare */}
>             <div
>               className="overture-flare absolute inset-0 pointer-events-none opacity-0"
>               style={{
>                 background:
>                   "linear-gradient(180deg, transparent 45%, rgba({{ACCENT_BRIGHT_RGB}},0.35) 50%, transparent 55%)",
>                 mixBlendMode: "screen",
>               }}
>             />
>           </div>
>         </div>
>       </div>
>
>       {/* BOTTOM caption + meta */}
>       <div className="relative md:absolute mt-10 md:mt-0 md:bottom-16 md:left-0 md:right-0 z-20 px-5 md:px-12">
>         <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-3 md:gap-6 max-w-[1100px] mx-auto">
>           <div className="overture-caption md:opacity-0">
>             <div className="hairline w-16 md:w-24 mb-3 md:mb-4" />
>             <p className="font-display font-light text-[1.7rem] md:text-[2.2rem] leading-[1.05] tracking-[-0.025em] text-bone">
>               {{OVERTURE_CAPTION_LINE_1}}
>               <br />
>               <span className="text-bone/45">{{OVERTURE_CAPTION_LINE_2}}</span>
>             </p>
>           </div>
>           <div className="overture-meta text-left md:text-right md:opacity-0 self-stretch md:self-auto">
>             <p className="font-mono text-[0.56rem] md:text-[0.58rem] uppercase tracking-[0.28em] md:tracking-[0.32em] text-gold/70 mb-1">
>               {{COORDINATES_OR_META}}
>             </p>
>             <p className="font-mono text-[0.52rem] md:text-[0.56rem] uppercase tracking-[0.24em] md:tracking-[0.28em] text-bone/40">
>               The portfolio, below ↓
>             </p>
>           </div>
>         </div>
>       </div>
>     </section>
>   </div>
> );
> ```
>
> ## Brief → fill-ins for this section
>
> | Placeholder | What it is | Real-estate example | Restaurant example | SaaS example |
> |-------------|------------|---------------------|---------------------|---------------|
> | `{{SECTION_HEADLINE}}` | One short phrase, eyebrow | "Alethriko Four Residences" | "The Spring Menu" | "Built for teams of any size" |
> | `{{GHOST_WORD_PRIMARY}}` | Big drift word | "RESIDENCES" | "PLATES" | "WORKFLOWS" |
> | `{{GHOST_WORD_ECHO}}` | Smaller italic echo | "cyprus" | "spring '26" | "shipped fast" |
> | `{{OVERTURE_CAPTION_LINE_1}}` | Caption strong | "Four residences." | "Twelve dishes." | "One workspace." |
> | `{{OVERTURE_CAPTION_LINE_2}}` | Caption soft (bone/45) | "Alethriko." | "One menu." | "Every channel." |
> | `{{COORDINATES_OR_META}}` | Right-side metadata | "34.707° N · 33.022° E" | "Open from Thu — Sun" | "v2.4 · shipping now" |
> | `{{OVERTURE_IMAGE_PATH}}` | Signature still image | `/properties-png/aphrodith-hero.png` | `/menu/spring-cover.jpg` | `/screenshots/dashboard.png` |
>
> ## Mount it
>
> ```tsx
> // app/(site)/page.tsx
> import ScrollVideo from "@/app/components/ScrollVideo";
> import CollectionOverture from "@/app/components/CollectionOverture";
>
> export default function Home() {
>   return (
>     <>
>       <ScrollVideo heightVh={220} />
>       <CollectionOverture />
>       {/* PortfolioStack lands here in phase 06 */}
>     </>
>   );
> }
> ```
>
> ## Verify
>
> - On desktop ≥ 768px: scroll into the section → pins → ghost word drifts → eyebrow + hairlines fade in → image opens from slit → corner brackets appear → captions rise → flare blinks once → progress rail fills. Reverse on scroll-up.
> - On mobile: the section just shows the image full-bleed with caption underneath. No pin, no scrub.
> - Resize from desktop to mobile WHILE on the section: GSAP matchMedia tears down the timeline. No console errors.
> - Route away and back: the page doesn't throw "Node not a child of this node". (This is what the outer `<div className="relative">` wrapper protects against.)
>
> ## What NOT to do
>
> - Do NOT remove the outer `<div className="relative">` wrapper. It's the only thing preventing the route-change removeChild crash.
> - Do NOT animate the clip-path on mobile. The `md:[clip-path:inset(...)]` syntax matters — without `md:` prefix the slit applies on mobile too and the image is invisible.
> - Do NOT add scroll-snap. It fights ScrollTrigger pins.
> - Do NOT pin on mobile under any circumstances. We've tried it. It janks.
> - Do NOT use `useGSAP()` hook from `@gsap/react`. The `useEffect` + `gsap.context` + `gsap.matchMedia` pattern above works correctly in Next.js 16 with React strict mode and double-invocation. The hook abstracts that, but also abstracts away the cleanup we need.
>
> ## Acceptance
>
> - Timeline scrubs smoothly desktop, no jank.
> - Mobile shows static fallback.
> - No route-change crashes.
> - Pin spacer disappears correctly on mobile (because the timeline never runs).
>
> Report back with the final component line count and whether the desktop timeline behaved as expected on first try (otherwise the bug + fix you applied).

---

## Notes for the human

- **Why `scrub: 0.6` and not `scrub: true`?** A small smoothing value (~0.5–1.0) makes the scrubbed motion feel like the timeline is "catching up" to your scroll, which reads as more cinematic. `scrub: true` is perfectly snapped which feels jittery on fast scroll.
- **Why three ghost words?** One primary, one echo, in italic, counter-drifting. That's the move — it makes the back plane feel like a typographic pulse rather than a flat watermark. Don't add a third.
- **The image aspect-ratio matters.** 16:10 has worked for property hero photos, dish overhead shots, dashboard screenshots. If your signature image is portrait (a person, an architectural detail shot vertically), change `aspect-[16/10]` to `aspect-[3/4]` and bump the `maxWidth` formula down accordingly — but the dramatic effect partly depends on the wide horizontal slit. Portrait works less well.
