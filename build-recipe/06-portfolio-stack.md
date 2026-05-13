# 06 — Portfolio Stack (Pinned Stacking Section)

The third section of the home page. A pinned full-viewport stack where N items slide up over each other, one viewport at a time — the classic Locomotive / Awwwards "card stack" pattern, but tuned to feel editorial rather than gimmicky.

Paste the [business brief](./00-business-brief-template.md) at the top of the session.

---

### ▶ Prompt to Claude

> Build two files:
>
> 1. **`app/lib/items.ts`** — the static data file for the stack items. (Rename to `homes.ts` for real-estate, `services.ts` for an agency, `menu.ts` for a restaurant, etc. Default: `items.ts`.)
> 2. **`app/components/PortfolioStack.tsx`** — the pinned-stack section.
>
> ## Data file
>
> ```ts
> // app/lib/items.ts
> export type Item = {
>   slug: string;
>   index: string;              // "Villa" / "Service" / "Dish" — short category label
>   name: string;
>   subtitle: string;
>   location: string;           // or category / department / cuisine
>   region?: string;
>   year: string;
>   metricA: { label: string; value: string };   // e.g. Area / 259 m²
>   metricB: { label: string; value: string };   // Rooms / 4·4
>   metricC: { label: string; value: string };   // Year / 2026
>   price: string;              // displayed as "guide price" / "from $X" / "rates from …"
>   status: string;             // free-text — "Available" / "Now open" / "Coming spring"
>   cover: string;              // /path/to/cover.png
>   // any additional fields the detail page (phase 08) needs:
>   description?: string[];     // 2–4 paragraph strings
>   gallery?: string[];
>   architect?: string;
>   coordinates?: string;
> };
>
> export const ITEMS: Item[] = [
>   // 4–6 items; brief.STACK_ITEMS feeds these
> ];
> ```
>
> Hardcode 4–6 items from `{{STACK_ITEMS}}` in the brief. Use real image paths under `/public/` — if the image files don't exist yet, the prompt should still build (the cover will 404 in the browser, fine for now).
>
> ## Component
>
> ```tsx
> "use client";
>
> import { useEffect, useRef } from "react";
> import Image from "next/image";
> import Link from "next/link";
> import { gsap } from "gsap";
> import { ScrollTrigger } from "gsap/ScrollTrigger";
> import type { Item } from "../lib/items";
>
> gsap.registerPlugin(ScrollTrigger);
> ```
>
> ### Inner `<Card>` component
>
> Each item renders as a card with:
>
> - **Huge ghost number** in the background (top-left or top-right, alternating), `26vw` / `22vw`, very low opacity, brightens slightly on hover.
> - **Cover image** in a `.frame` (corner-bracket) container, 5:3 aspect on desktop, 16:10 on mobile, with:
>   - `object-cover` and a 1.8s cubic-bezier `group-hover:scale-[1.04]`.
>   - A bottom-up scrim (`from-ink/80 via-ink/5 to-transparent`).
>   - A radial gold glow that fades in on hover.
>   - A floating mono pill at the top-left showing `item.index`.
> - **Right column** (md:col-span-4): location with leading hairline, large display name, subtitle, three metrics row with a hairline top + bottom, "guide price" and a "Dossier →" link affordance.
> - Alternating cards reverse direction: even-indexed cards have image on the left, odd-indexed have image on the right (using `md:[direction:rtl]` + `md:[direction:ltr]` on the inner column to flip layout without re-ordering the DOM).
>
> ```tsx
> function Card({ item, i, reverse }: { item: Item; i: number; reverse: boolean }) {
>   return (
>     <div className="w-full max-w-[1700px] mx-auto px-5 md:px-12">
>       <Link href={`${"{{ITEM_BASE_PATH}}"}/${item.slug}`} className="group block relative">
>         {/* HUGE ghost number */}
>         <span
>           className={`pointer-events-none select-none absolute font-display font-light text-[26vw] md:text-[22vw] leading-none tracking-[-0.06em] text-gold/[0.05] group-hover:text-gold/[0.09] transition-colors duration-700 ${
>             reverse ? "right-0 -top-10 md:-top-16" : "left-0 -top-10 md:-top-16"
>           }`}
>         >
>           {String(i + 1).padStart(2, "0")}
>         </span>
>
>         <div className={`relative grid grid-cols-12 gap-4 md:gap-14 items-end ${reverse ? "md:[direction:rtl]" : ""}`}>
>           {/* IMAGE column */}
>           <div className={`col-span-12 md:col-span-8 relative ${reverse ? "md:[direction:ltr]" : ""}`}>
>             <div className="relative frame p-1.5 md:p-3">
>               <span className="frame-tr" />
>               <span className="frame-bl" />
>               <div className="relative aspect-[16/10] md:aspect-[5/3] overflow-hidden bg-ink-soft">
>                 <Image
>                   src={item.cover}
>                   alt={item.name}
>                   fill
>                   sizes="(max-width: 768px) 100vw, 66vw"
>                   className="object-cover transition-transform duration-[1800ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:scale-[1.04]"
>                   priority={i < 2}
>                 />
>                 <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/5 to-transparent" />
>                 <div
>                   className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
>                   style={{ background: "radial-gradient(600px 400px at 50% 50%, rgba({{ACCENT_RGB}},0.1), transparent 60%)" }}
>                 />
>                 <div className="absolute top-5 left-5">
>                   <span className="font-mono text-[0.62rem] uppercase tracking-[0.32em] text-bone/90 backdrop-blur-sm bg-ink/20 px-3 py-1.5">
>                     {item.index}
>                   </span>
>                 </div>
>               </div>
>             </div>
>           </div>
>
>           {/* META column */}
>           <div className={`col-span-12 md:col-span-4 space-y-4 md:space-y-7 ${reverse ? "md:[direction:ltr]" : ""}`}>
>             <div className="flex items-center gap-3">
>               <span className="h-px flex-1 bg-gradient-to-r from-gold to-transparent" />
>               <span className="font-mono text-[0.6rem] uppercase tracking-[0.35em] text-gold">
>                 {item.location}
>               </span>
>             </div>
>             <div>
>               <h3 className="font-display font-light text-[2.4rem] md:text-[4.6vw] leading-[0.95] tracking-[-0.045em] text-bone group-hover:text-gold transition-colors duration-700">
>                 {item.name}
>               </h3>
>               <p className="font-body text-[0.95rem] md:text-[1.05rem] text-bone/55 mt-2.5 md:mt-5 leading-[1.5] max-w-md font-light line-clamp-2 md:line-clamp-none">
>                 {item.subtitle}.
>               </p>
>             </div>
>             <div className="grid grid-cols-3 gap-2 border-y border-line py-3 md:py-5">
>               {[item.metricA, item.metricB, item.metricC].map((m) => (
>                 <div key={m.label}>
>                   <div className="font-mono text-[0.55rem] uppercase tracking-[0.22em] text-bone/40">{m.label}</div>
>                   <div className="font-display text-base md:text-lg text-bone mt-1 serif-nums font-light tracking-[-0.01em]">{m.value}</div>
>                 </div>
>               ))}
>             </div>
>             <div className="flex items-end justify-between pt-1 md:pt-2">
>               <div>
>                 <div className="font-mono text-[0.55rem] uppercase tracking-[0.22em] text-bone/40 mb-1">Guide price</div>
>                 <div className="font-display text-2xl md:text-3xl gold-text serif-nums font-light tracking-[-0.02em]">{item.price}</div>
>               </div>
>               <span className="font-mono text-[0.64rem] uppercase tracking-[0.22em] text-bone/60 group-hover:text-gold transition-[color,letter-spacing] duration-500 group-hover:tracking-[0.26em]">
>                 Dossier →
>               </span>
>             </div>
>           </div>
>         </div>
>       </Link>
>     </div>
>   );
> }
> ```
>
> ### Outer `<PortfolioStack>` — the pinning behavior
>
> ```tsx
> export default function PortfolioStack({ items }: { items: Item[] }) {
>   const sectionRef = useRef<HTMLDivElement>(null);
>   const containerRef = useRef<HTMLDivElement>(null);
>
>   useEffect(() => {
>     const section = sectionRef.current;
>     const container = containerRef.current;
>     if (!section || !container) return;
>
>     const mm = gsap.matchMedia();
>
>     // Desktop only — pinned scrub stack.
>     // Mobile renders a plain vertical stack (no pin, no scrub) — touch + pinning is brutal.
>     mm.add("(min-width: 768px)", () => {
>       const ctx = gsap.context(() => {
>         const panels = gsap.utils.toArray<HTMLElement>(".portfolio-panel", container);
>         if (panels.length < 2) return;
>
>         // Each subsequent panel starts off-screen (yPercent: 100) and tweens to 0
>         // over the duration of one viewport's worth of scroll.
>         panels.forEach((panel, i) => {
>           if (i === 0) return;
>           gsap.set(panel, { yPercent: 100 });
>
>           ScrollTrigger.create({
>             trigger: section,
>             start: () => `top+=${i * window.innerHeight} top`,
>             end:   () => `top+=${(i + 1) * window.innerHeight} top`,
>             scrub: true,
>             animation: gsap.to(panel, { yPercent: 0, ease: "none" }),
>           });
>         });
>
>         // Pin the whole section for N viewports' worth of scroll
>         ScrollTrigger.create({
>           trigger: section,
>           start: "top top",
>           end:   () => `+=${panels.length * window.innerHeight}`,
>           pin: true,
>           pinSpacing: true,
>           anticipatePin: 1,
>           invalidateOnRefresh: true,
>         });
>       }, section);
>
>       return () => ctx.revert();
>     });
>
>     return () => mm.revert();
>   }, []);
>
>   return (
>     <div ref={sectionRef} className="relative">
>       <div ref={containerRef} className="relative md:h-[100dvh] w-full md:overflow-hidden">
>         {items.map((item, i) => {
>           const reverse = i % 2 === 1;
>           return (
>             <div
>               key={item.slug}
>               className="portfolio-panel relative md:absolute md:inset-0 md:h-[100dvh] w-full bg-ink md:overflow-hidden flex flex-col justify-center py-16 md:py-0"
>               style={{ zIndex: i + 1 }}
>             >
>               <Card item={item} i={i} reverse={reverse} />
>             </div>
>           );
>         })}
>       </div>
>     </div>
>   );
> }
> ```
>
> ### Key behaviors
>
> - **Each subsequent panel** starts at `yPercent: 100` (one full viewport below) and tweens to `0` as the user scrolls one viewport's worth. Result: panels stack on top of each other one at a time.
> - **`zIndex` grows with index** — later panels visually cover earlier ones once they finish their slide-up.
> - **Pin duration** = `panels.length * window.innerHeight` — enough scroll to play through all N transitions, plus the implicit "dwell" at the end.
> - **Mobile bypass**: on mobile, `.portfolio-panel` is `relative` and `md:absolute md:inset-0` doesn't apply, so panels render in document order, each at `100dvh` becomes flow-height (`py-16`). No pin, no scrub.
> - **`invalidateOnRefresh: true`** is critical — when the viewport resizes (e.g. address bar collapse on mobile), the start/end formulas recompute against the new `window.innerHeight`.
>
> ## Mount it
>
> ```tsx
> // app/(site)/page.tsx
> import ScrollVideo from "@/app/components/ScrollVideo";
> import CollectionOverture from "@/app/components/CollectionOverture";
> import PortfolioStack from "@/app/components/PortfolioStack";
> import { ITEMS } from "@/app/lib/items";
>
> export default function Home() {
>   return (
>     <>
>       <ScrollVideo heightVh={220} />
>       <CollectionOverture />
>       <section id="collection" className="relative bg-ink border-y border-line">
>         <PortfolioStack items={ITEMS.filter((x) => x.slug !== "{{FEATURED_SLUG}}")} />
>         {/* closure block — after the stack finishes */}
>         <div className="relative z-10 bg-ink px-6 md:px-12 max-w-[1700px] mx-auto py-24 md:py-36">
>           <div className="text-center">
>             <div className="hairline max-w-sm mx-auto mb-8" />
>             <p className="font-display text-2xl md:text-3xl text-bone/55 font-light tracking-[-0.02em]">
>               The current portfolio.
>             </p>
>             <p className="mt-3 font-mono text-[0.62rem] uppercase tracking-[0.28em] text-gold">
>               New {{ITEM_NOUN}}s · by correspondence
>             </p>
>           </div>
>         </div>
>       </section>
>     </>
>   );
> }
> ```
>
> The filter excludes the featured item (already shown in the hero scroll-video). If your hero doesn't feature a specific item, pass `ITEMS` unfiltered.
>
> ## Verify
>
> - Desktop ≥ 768px: scroll through the section → first card visible → second card slides up over it → third over that → … → final card visible → section unpins, closure block appears below.
> - Mobile: cards render as a normal flowing vertical list, no pin.
> - Resize window: pin recalculates against new viewport height (no broken end position).
> - Browse to a card's `href`: clicks reach the link (the absolute-positioned ghost number has `pointer-events-none` — verify this didn't get dropped).
> - Hover a card on desktop: image scales gently, gold radial appears behind it, name turns gold, "Dossier →" widens letter-spacing.
>
> ## What NOT to do
>
> - Do NOT pin on mobile.
> - Do NOT animate `top` instead of `yPercent` — `yPercent` is GPU-composited via `transform`, `top` triggers layout.
> - Do NOT remove `invalidateOnRefresh: true` — the formula-based start/end calculations need to re-run on resize, especially for mobile-Safari address-bar geometry shifts.
> - Do NOT add a parallax-on-cover-image effect on the active panel. We tried it. It fights the scrub. The hover scale on the cover is enough.
> - Do NOT make the ghost number a full-page background. It's per-card. Trying to bleed it across the section breaks when panels overlap.
> - Do NOT use `position: sticky` instead of GSAP pin. Sticky doesn't compose with scrub-driven sibling animations.
>
> ## Acceptance
>
> - All N cards animate in correctly with no skipped or stuck panel.
> - Closure block ("The current portfolio.") appears once the stack finishes.
> - Mobile renders all cards as a flowing list with `py-16` between each.
> - No console errors on route in/out.
>
> Report back the final file structure and a description of how the stack renders on first run.

---

## Notes for the human

- **How many items should the stack have?** 3–6. Two looks accidental, seven feels endless. Master Homes shipped with 4 (after the featured one is filtered out). If you have a longer catalog, put 4 in the stack and link out to `{{INDEX_PATH}}` for the rest.
- **Alternating card direction matters.** The eye expects the next card to feel "different." Strict left-image / right-image alternation is the cheapest way to deliver that.
- **The "guide price" → "Dossier →" pairing is the conversion moment.** Whatever your vertical, keep one piece of pricing/availability information on the left and the affordance to read more on the right. Don't move them to the bottom of the card or split them onto separate rows.
