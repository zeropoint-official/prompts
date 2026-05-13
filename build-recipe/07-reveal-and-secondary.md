# 07 — Reveal Primitive + Navbar + Footer + Contact Section + Carousel

The "connective tissue" components. None are individually large, but the design depends on every one of them being in place — without `<Reveal>`, no section below the fold feels intentional; without the navbar, route-changes don't feel like a site.

Paste the [business brief](./00-business-brief-template.md) at the top of the session.

---

### ▶ Prompt to Claude

> Build five components and wire them into the layout. Build them in this order; each one is small.
>
> ## 1. `<Reveal>` — `app/components/Reveal.tsx`
>
> Intersection-observer-driven fade-up reveal. Used everywhere below the fold for content blocks (about-us paragraphs, contact section, gallery sections). The CSS class `.reveal` and `.reveal.in` already exist (added in phase 03).
>
> ```tsx
> "use client";
>
> import { useEffect, useRef } from "react";
>
> export default function Reveal({
>   children,
>   delay = 0,
>   as: Tag = "div",
>   className = "",
> }: {
>   children: React.ReactNode;
>   delay?: number;        // ms — delay between intersection and class add (for staggered groups)
>   as?: keyof React.JSX.IntrinsicElements;
>   className?: string;
> }) {
>   const ref = useRef<HTMLElement | null>(null);
>
>   useEffect(() => {
>     const el = ref.current;
>     if (!el) return;
>     const io = new IntersectionObserver(
>       (entries) => {
>         for (const e of entries) {
>           if (e.isIntersecting) {
>             setTimeout(() => el.classList.add("in"), delay);
>             io.unobserve(el);
>           }
>         }
>       },
>       { threshold: 0.15 },
>     );
>     io.observe(el);
>     return () => io.disconnect();
>   }, [delay]);
>
>   const Component = Tag as React.ElementType;
>   return (
>     <Component ref={ref as React.Ref<HTMLElement>} className={`reveal ${className}`}>
>       {children}
>     </Component>
>   );
> }
> ```
>
> Use it like:
>
> ```tsx
> <Reveal delay={100}><h2>Heading</h2></Reveal>
> <Reveal delay={200}><p>Body paragraph that fades in slightly after the heading.</p></Reveal>
> ```
>
> Don't wrap individual inline elements. Wrap a block — a heading, a paragraph, an image, a CTA group. The fade-up is at the block level.
>
> ## 2. `<Navbar>` — `app/components/Navbar.tsx`
>
> Sticky-style top navigation that:
>
> - Knows the current route (`usePathname()`) and highlights the active link.
> - Becomes denser after scrolling > 24px (sticky color shift / smaller padding).
> - On click of a same-path link, force-scrolls to top (route-change logic in `<SmoothScroll>` only fires when pathname changes).
> - Closes mobile menu when the user navigates.
> - When mobile menu is open, lock body scroll (`document.body.style.overflow = "hidden"`).
>
> ```tsx
> "use client";
>
> import Link from "next/link";
> import Image from "next/image";
> import { useEffect, useState } from "react";
> import { usePathname } from "next/navigation";
>
> const links = [
>   { href: "/",                       label: "Index",       roman: "i",   match: (p: string) => p === "/" },
>   { href: "{{INDEX_PATH}}",          label: "{{INDEX_NAV_LABEL}}", roman: "ii", match: (p: string) => p === "{{INDEX_PATH}}" || p.startsWith("{{ITEM_BASE_PATH}}") },
>   { href: "/about",                  label: "Studio",      roman: "iii", match: (p: string) => p === "/about" },
>   { href: "/contact",                label: "Contact Us",  roman: "iv",  match: (p: string) => p === "/contact" },
> ];
>
> export default function Navbar() {
>   const [scrolled, setScrolled] = useState(false);
>   const [open, setOpen] = useState(false);
>   const pathname = usePathname();
>
>   const scrollTopIfSamePath = (href: string) => {
>     if (href !== pathname) return;
>     window.scrollTo(0, 0);
>     window.__lenis?.scrollTo(0, { immediate: true, force: true });
>   };
>
>   useEffect(() => {
>     const onScroll = () => setScrolled(window.scrollY > 24);
>     onScroll();
>     window.addEventListener("scroll", onScroll, { passive: true });
>     return () => window.removeEventListener("scroll", onScroll);
>   }, []);
>
>   useEffect(() => setOpen(false), [pathname]);
>
>   useEffect(() => {
>     document.body.style.overflow = open ? "hidden" : "";
>     return () => { document.body.style.overflow = ""; };
>   }, [open]);
>
>   return (
>     <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
>       scrolled ? "py-3 backdrop-blur-md bg-ink/65 border-b border-line" : "py-5"
>     }`}>
>       <div className="max-w-[1700px] mx-auto px-6 md:px-12 flex items-center justify-between">
>         <Link href="/" onClick={() => scrollTopIfSamePath("/")} className="flex items-center gap-3">
>           <Image src="/logo.png" alt="{{BRAND_NAME}}" width={28} height={28} className="object-contain" />
>           <span className="font-display font-light text-base tracking-[-0.02em] text-bone">{{BRAND_NAME}}</span>
>         </Link>
>
>         <nav className="hidden md:flex items-center gap-9">
>           {links.map((l) => {
>             const active = l.match(pathname);
>             return (
>               <Link
>                 key={l.href}
>                 href={l.href}
>                 onClick={() => scrollTopIfSamePath(l.href)}
>                 className="group flex items-baseline gap-2"
>               >
>                 <span className="font-mono text-[0.55rem] uppercase tracking-[0.32em] text-gold/60">§ {l.roman}</span>
>                 <span className={`font-mono text-[0.7rem] uppercase tracking-[0.22em] transition-colors duration-500 ${
>                   active ? "text-gold" : "text-bone/65 group-hover:text-gold"
>                 }`}>
>                   {l.label}
>                 </span>
>               </Link>
>             );
>           })}
>         </nav>
>
>         <button
>           className="md:hidden font-mono text-[0.65rem] uppercase tracking-[0.3em] text-bone"
>           onClick={() => setOpen((o) => !o)}
>           aria-label={open ? "Close menu" : "Open menu"}
>         >
>           {open ? "Close" : "Menu"}
>         </button>
>       </div>
>
>       {/* Mobile drawer */}
>       {open && (
>         <div className="md:hidden fixed inset-0 top-[57px] bg-ink z-40 flex flex-col items-center justify-center gap-10 px-6">
>           {links.map((l) => (
>             <Link
>               key={l.href}
>               href={l.href}
>               onClick={() => { scrollTopIfSamePath(l.href); setOpen(false); }}
>               className="font-display text-3xl font-light tracking-[-0.03em] text-bone"
>             >
>               <span className="font-mono text-[0.55rem] uppercase tracking-[0.32em] text-gold/60 mr-3">§ {l.roman}</span>
>               {l.label}
>             </Link>
>           ))}
>         </div>
>       )}
>     </header>
>   );
> }
> ```
>
> ## 3. `<Footer>` and `<FooterMarquee>` — `app/components/Footer.tsx`, `app/components/FooterMarquee.tsx`
>
> Two pieces. The marquee is the big horizontally-scrolling band of brand-name text at the top of the footer; the footer proper is below it with copy, contact, nav.
>
> **`FooterMarquee.tsx`** — uses the `.marquee` keyframe from phase 03:
>
> ```tsx
> export default function FooterMarquee() {
>   const word = "{{BRAND_NAME}}";
>   const items = Array.from({ length: 12 }, (_, i) => i);
>   return (
>     <div className="relative overflow-hidden border-y border-line py-6 md:py-10 bg-ink">
>       <div className="flex marquee whitespace-nowrap" style={{ width: "max-content" }}>
>         {items.concat(items).map((i) => (
>           <span key={i} className="font-display font-extralight text-[13vw] md:text-[10vw] leading-none tracking-[-0.05em] text-bone/[0.08] mx-8 md:mx-14 flex-shrink-0">
>             {word} <span className="text-gold/30">·</span>
>           </span>
>         ))}
>       </div>
>     </div>
>   );
> }
> ```
>
> **`Footer.tsx`** — composes the marquee + a grid of brand / nav / contact / colophon:
>
> ```tsx
> import Link from "next/link";
> import FooterMarquee from "./FooterMarquee";
>
> export default function Footer() {
>   const year = new Date().getFullYear();
>   return (
>     <footer className="relative">
>       <FooterMarquee />
>       <div className="max-w-[1700px] mx-auto px-6 md:px-12 py-16 md:py-20 grid grid-cols-12 gap-y-10 md:gap-10">
>         <div className="col-span-12 md:col-span-5 space-y-5">
>           <div className="eyebrow">§ Colophon</div>
>           <h3 className="font-display font-extralight text-3xl md:text-4xl leading-[1.05] tracking-[-0.03em] text-bone max-w-md">
>             {{TAGLINE}}
>           </h3>
>           <div className="hairline w-32" />
>           <p className="font-body text-bone/55 text-sm max-w-sm leading-[1.7]">
>             {{FOOTER_BLURB}}
>           </p>
>         </div>
>
>         <div className="col-span-6 md:col-span-3 space-y-3">
>           <div className="eyebrow-sm">Pages</div>
>           {[
>             ["/", "Index"],
>             ["{{INDEX_PATH}}", "{{INDEX_NAV_LABEL}}"],
>             ["/about", "Studio"],
>             ["/contact", "Contact"],
>           ].map(([href, label]) => (
>             <Link key={href} href={href} className="block font-mono text-[0.7rem] uppercase tracking-[0.22em] text-bone/65 hover:text-gold transition-colors">
>               {label} →
>             </Link>
>           ))}
>         </div>
>
>         <div className="col-span-6 md:col-span-4 space-y-3">
>           <div className="eyebrow-sm">Reach</div>
>           <a href="mailto:{{REPLY_TO}}" className="block font-display text-xl text-bone hover:text-gold transition-colors">{{REPLY_TO}}</a>
>           <a href="tel:{{PHONE_RAW}}" className="block font-mono text-[0.7rem] uppercase tracking-[0.22em] text-bone/65 hover:text-gold transition-colors">{{PHONE}} →</a>
>           <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-bone/45 pt-3">{{LOCATION}}</p>
>         </div>
>
>         <div className="col-span-12 border-t border-line pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3 font-mono text-[0.55rem] uppercase tracking-[0.3em] text-bone/35">
>           <span>© {year} · {{BRAND_NAME}}</span>
>           <span>{{LOCATION}} · {{FOUNDED}}</span>
>         </div>
>       </div>
>     </footer>
>   );
> }
> ```
>
> Where `{{PHONE_RAW}}` is the unformatted version of `{{PHONE}}` (no spaces, plus-sign optional) used in `tel:` href. Where `{{FOOTER_BLURB}}` is two short sentences from the brief.
>
> ## 4. `<Correspondence>` — `app/components/Correspondence.tsx`
>
> The contact-section block embedded on the home page (and reused on the dedicated `/contact` page). It uses the `<ContactForm>` component (build that too, below).
>
> ```tsx
> import Reveal from "./Reveal";
> import ContactForm from "./ContactForm";
>
> export default function Correspondence() {
>   return (
>     <section id="correspondence" className="relative py-20 md:py-32 overflow-hidden bg-ink-soft">
>       <div className="absolute top-12 left-10 font-mono text-[0.62rem] uppercase tracking-[0.3em] text-gold/40 select-none">§ v</div>
>       <div className="max-w-[1500px] mx-auto px-6 md:px-12 grid grid-cols-12 gap-y-14 md:gap-16">
>         <div className="col-span-12 md:col-span-5 space-y-7">
>           <Reveal><span className="eyebrow">§ v · correspondence</span></Reveal>
>           <Reveal delay={100}>
>             <h2 className="font-display font-light text-4xl md:text-[3rem] leading-[1.05] tracking-[-0.04em]">
>               {{CORRESPONDENCE_HEADLINE_1}}
>               <br />
>               <span className="gold-text">{{CORRESPONDENCE_HEADLINE_2}}</span>
>             </h2>
>           </Reveal>
>           <Reveal delay={200}>
>             <p className="font-body text-bone/65 text-base leading-[1.8] font-light max-w-md">
>               {{CORRESPONDENCE_BODY}}
>             </p>
>           </Reveal>
>           <Reveal delay={300}>
>             <div className="hairline w-32" />
>             <div className="pt-2 space-y-2">
>               <a href="mailto:{{REPLY_TO}}" className="block font-display text-xl text-bone hover:text-gold transition-colors">{{REPLY_TO}}</a>
>               <a href="tel:{{PHONE_RAW}}" className="block font-mono text-[0.7rem] uppercase tracking-[0.22em] text-bone/65 hover:text-gold transition-colors">{{PHONE}} →</a>
>             </div>
>           </Reveal>
>         </div>
>         <div className="col-span-12 md:col-span-7 md:pl-8">
>           <Reveal delay={150}>
>             <ContactForm source="home" />
>           </Reveal>
>         </div>
>       </div>
>     </section>
>   );
> }
> ```
>
> ## 5. `<ContactForm>` — `app/components/ContactForm.tsx`
>
> The form used in both the home-page Correspondence section and the dedicated `/contact` page. POSTs to `/api/contact` (built in phase 09) but for now just `console.log`s the payload — phase 09 wires the real endpoint.
>
> Use the `.input-field` class from phase 03 (bottom-border-only inputs) for every field. Fields driven by `{{FORM_FIELDS}}` in the brief; defaults are name / email / phone / service select / message textarea.
>
> ```tsx
> "use client";
>
> import { useState } from "react";
>
> export default function ContactForm({ source = "contact" }: { source?: "home" | "contact" }) {
>   const [submitting, setSubmitting] = useState(false);
>   const [submitted, setSubmitted] = useState(false);
>
>   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
>     e.preventDefault();
>     setSubmitting(true);
>     try {
>       const form = e.currentTarget;
>       const data = Object.fromEntries(new FormData(form));
>       // Phase 09 wires the real /api/contact endpoint. For now:
>       console.log("[contact submission]", { ...data, source });
>       await new Promise((r) => setTimeout(r, 600));
>       setSubmitted(true);
>     } finally {
>       setSubmitting(false);
>     }
>   };
>
>   if (submitted) {
>     return (
>       <div className="frame p-8 md:p-12">
>         <span className="frame-tr" /><span className="frame-bl" />
>         <div className="eyebrow mb-3">§ Received</div>
>         <h3 className="font-display font-light text-2xl md:text-3xl tracking-[-0.03em]">
>           Thank you.<br />
>           <span className="text-bone/55">We'll be in touch shortly.</span>
>         </h3>
>       </div>
>     );
>   }
>
>   return (
>     <form onSubmit={handleSubmit} className="space-y-7">
>       <div className="grid grid-cols-2 gap-6">
>         <input name="name" required placeholder="Name" className="input-field" />
>         <input name="email" type="email" required placeholder="Email" className="input-field" />
>       </div>
>       <input name="phone" placeholder="Phone (optional)" className="input-field" />
>       <select name="service" defaultValue="" required className="input-field">
>         <option value="" disabled>{{FORM_SERVICE_PROMPT}}</option>
>         {/* Map from {{FORM_SERVICES}} */}
>       </select>
>       <textarea name="message" required placeholder="Message" rows={5} className="input-field resize-none" />
>
>       <div className="flex items-center justify-between pt-3">
>         <button type="submit" disabled={submitting} className="btn-gold disabled:opacity-50">
>           {submitting ? "Sending…" : "Send →"}
>         </button>
>         <span className="font-mono text-[0.55rem] uppercase tracking-[0.3em] text-bone/35">
>           Replies typically within 24 hours
>         </span>
>       </div>
>     </form>
>   );
> }
> ```
>
> ## 6. `<Carousel>` — `app/components/Carousel.tsx`
>
> A horizontal gallery used on the per-item detail page (built in phase 08). Simple controls (← / →), one image at a time, snap-scroll on touch. Don't pull in a library — `scroll-snap-type: x mandatory` + a `ref.current.scrollBy` does the job.
>
> ```tsx
> "use client";
>
> import { useRef } from "react";
> import Image from "next/image";
>
> export default function Carousel({ images, alt }: { images: string[]; alt: string }) {
>   const ref = useRef<HTMLDivElement>(null);
>   const scroll = (dir: -1 | 1) => {
>     const el = ref.current;
>     if (!el) return;
>     el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
>   };
>
>   return (
>     <div className="relative">
>       <div
>         ref={ref}
>         className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth gap-3 md:gap-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
>         data-lenis-prevent
>       >
>         {images.map((src, i) => (
>           <div key={src + i} className="relative flex-shrink-0 snap-start w-[88vw] md:w-[60vw] aspect-[16/10] bg-ink-soft frame p-1.5">
>             <span className="frame-tr" /><span className="frame-bl" />
>             <Image src={src} alt={`${alt} — ${i + 1}`} fill sizes="(max-width: 768px) 88vw, 60vw" className="object-cover" />
>           </div>
>         ))}
>       </div>
>       <div className="flex items-center justify-between mt-5">
>         <button onClick={() => scroll(-1)} className="btn-ghost">← Prev</button>
>         <button onClick={() => scroll(1)} className="btn-ghost">Next →</button>
>       </div>
>     </div>
>   );
> }
> ```
>
> **The `data-lenis-prevent` attribute is essential** — without it Lenis tries to translate horizontal wheel events into vertical scroll. With it, the carousel scrolls independently.
>
> ## Mount navbar + footer in the layout
>
> Replace `app/(site)/layout.tsx`'s placeholder header/footer:
>
> ```tsx
> import Navbar from "@/app/components/Navbar";
> import Footer from "@/app/components/Footer";
> import SmoothScroll from "@/app/components/SmoothScroll";
>
> export default function SiteLayout({ children }: { children: React.ReactNode }) {
>   return (
>     <>
>       <SmoothScroll />
>       <Navbar />
>       <main>{children}</main>
>       <Footer />
>     </>
>   );
> }
> ```
>
> Add `<Correspondence />` to the home page between the portfolio stack closure and the about block:
>
> ```tsx
> // app/(site)/page.tsx
> import Correspondence from "@/app/components/Correspondence";
>
> // …after the portfolio stack section…
> <Correspondence />
> ```
>
> ## Verify
>
> - Navbar fades-shifts at scroll > 24px.
> - Active route link is gold.
> - Mobile menu opens, locks body scroll, closes on link click.
> - Reveal blocks fade-up as they enter viewport (the about block in phase-04's home page, plus the new Correspondence block).
> - Marquee scrolls smoothly without jumping. (If it jumps, double the items array.)
> - Contact form submits (logs to console for now), shows "Thank you" frame.
>
> ## What NOT to do
>
> - Do NOT swap `<Reveal>` for framer-motion. The IntersectionObserver + CSS class is 30 lines and does the job; framer is 80 KB of script for the same effect.
> - Do NOT use `position: sticky` for the navbar. `position: fixed` is what allows the backdrop-blur trick when scrolled.
> - Do NOT put the Correspondence section inside the pinned portfolio stack. It must come after the unpin so it scrolls normally.
> - Do NOT animate the marquee with GSAP. The CSS keyframe is GPU-accelerated and free; GSAP would just bind the timeline.
> - Do NOT add `<Suspense>` boundaries around these client components. They don't suspend — they're synchronous.
>
> ## Acceptance
>
> - All five components render without console errors.
> - Hover affordances feel slow (≥500ms transitions) — not snappy.
> - Mobile navbar drawer covers the viewport, locks scroll, dismisses on link tap.
> - Carousel scrolls independently of page (Lenis doesn't hijack it).
> - Reveal blocks animate on first view, stay visible on subsequent scroll.

---

## Notes for the human

- **Why `§ i`, `§ ii`, `§ iii`?** Section-mark glyphs from editorial typography. They cost nothing and make the site read as "designed by someone who read a book." Swap for `01.`, `02.`, `03.` if your brand needs to feel more technical (SaaS, fintech).
- **Why a marquee?** Brand recognition + cheap motion. A page that's all-static between fold and footer feels dead. The marquee provides ambient motion at the seam between content and contact.
- **Why no animation library for `<Carousel>`?** A snap-scroll horizontal scroller is one of the few primitives the browser ships at the right quality. Adding a library here is pure overhead.
