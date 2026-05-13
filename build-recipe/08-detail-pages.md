# 08 — Detail Pages: Item Dossier, Index, About, Contact

Build the four secondary pages: a per-item dossier (`{{ITEM_BASE_PATH}}/[slug]`), the index of all items (`{{INDEX_PATH}}`), the about page (`/about`), and the contact page (`/contact`).

Paste the [business brief](./00-business-brief-template.md) at the top of the session.

---

### ▶ Prompt to Claude

> Build four route files under `app/(site)/`. They share the `(site)` layout (navbar + footer + smooth-scroll) automatically.
>
> ```
> app/(site)/
> ├── {{ITEM_BASE_PATH_SEG}}/[slug]/page.tsx     # item dossier
> ├── {{INDEX_PATH_SEG}}/page.tsx                # index
> ├── about/page.tsx
> └── contact/page.tsx
> ```
>
> Where `{{ITEM_BASE_PATH_SEG}}` is the URL segment without leading slash, e.g. `homes`, `cases`, `dishes`. Same for `{{INDEX_PATH_SEG}}` → `properties`, `work`, `menu`.
>
> ---
>
> ## 1. Item dossier — `app/(site)/{{ITEM_BASE_PATH_SEG}}/[slug]/page.tsx`
>
> Server component. Reads from `ITEMS` (built in phase 06). 404 if slug not found. Composition:
>
> 1. **Top spacer + back link** — `← Back to {{INDEX_NAV_LABEL}}` mono.
> 2. **Heading block** — eyebrow `§ {{ITEM_NUMBER}} · {{LOCATION}}`, huge display name (extralight, italic-subtitle below), four metric tiles (Area / Rooms / Year / Status), guide price, primary CTA `Request a dossier →` scrolls to the contact form anchor.
> 3. **Hero image** — full-bleed cover at 16:9, inside a `.frame`.
> 4. **Description** — three short paragraphs from `item.description[]`, large display-light type. Each in a `<Reveal>`.
> 5. **Exteriors carousel** — `<Carousel images={item.exteriors ?? [item.cover]} alt={item.name} />` with eyebrow `§ Exteriors`.
> 6. **Interiors carousel** — same, with eyebrow `§ Interiors`.
> 7. **Specs grid** — labeled rows of architect, coordinates, plot size, internal area, verandas, garage etc. Lined with hairlines.
> 8. **Inline contact form** — `<ContactForm source="home" />` wrapped in a section with id `correspondence` so the CTA scrolls to it.
> 9. **Next / prev links** at the bottom that wrap around the items array.
>
> Skeleton:
>
> ```tsx
> import { notFound } from "next/navigation";
> import Image from "next/image";
> import Link from "next/link";
> import { ITEMS } from "@/app/lib/items";
> import Reveal from "@/app/components/Reveal";
> import Carousel from "@/app/components/Carousel";
> import ContactForm from "@/app/components/ContactForm";
>
> export async function generateStaticParams() {
>   return ITEMS.map((item) => ({ slug: item.slug }));
> }
>
> export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
>   const { slug } = await params;
>   const item = ITEMS.find((x) => x.slug === slug);
>   if (!item) return {};
>   return {
>     title: `${item.name} — {{BRAND_NAME}}`,
>     description: item.subtitle,
>   };
> }
>
> export default async function ItemPage({ params }: { params: Promise<{ slug: string }> }) {
>   const { slug } = await params;
>   const item = ITEMS.find((x) => x.slug === slug);
>   if (!item) notFound();
>
>   const idx = ITEMS.findIndex((x) => x.slug === slug);
>   const prev = ITEMS[(idx - 1 + ITEMS.length) % ITEMS.length];
>   const next = ITEMS[(idx + 1) % ITEMS.length];
>
>   return (
>     <article className="pt-28 md:pt-32 pb-24 md:pb-32">
>       <div className="max-w-[1700px] mx-auto px-6 md:px-12 space-y-16 md:space-y-24">
>         {/* HEADING BLOCK */}
>         <header className="grid grid-cols-12 gap-y-8 md:gap-12 items-end">
>           <div className="col-span-12 md:col-span-7 space-y-5">
>             <Link href="{{INDEX_PATH}}" className="btn-ghost">← Back to {{INDEX_NAV_LABEL}}</Link>
>             <div className="eyebrow">§ {String(idx + 1).padStart(2, "0")} · {item.location}</div>
>             <h1 className="font-display font-extralight text-5xl md:text-[6vw] leading-[0.92] tracking-[-0.045em]">
>               {item.name}
>             </h1>
>             <p className="font-display font-light text-lg md:text-2xl text-bone/65 tracking-[-0.02em] max-w-xl">
>               {item.subtitle}.
>             </p>
>           </div>
>           <div className="col-span-12 md:col-span-5 grid grid-cols-2 gap-px bg-line">
>             {[item.metricA, item.metricB, item.metricC, { label: "Status", value: item.status }].map((m) => (
>               <div key={m.label} className="bg-ink px-5 py-5">
>                 <div className="font-mono text-[0.55rem] uppercase tracking-[0.28em] text-bone/40">{m.label}</div>
>                 <div className="font-display text-xl md:text-2xl text-bone mt-2 serif-nums font-light tracking-[-0.02em]">{m.value}</div>
>               </div>
>             ))}
>           </div>
>         </header>
>
>         {/* PRICE + CTA */}
>         <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-y border-line py-8">
>           <div>
>             <div className="eyebrow-sm">Guide price</div>
>             <div className="font-display gold-text text-4xl md:text-5xl mt-2 serif-nums font-light tracking-[-0.02em]">{item.price}</div>
>           </div>
>           <a href="#correspondence" className="btn-gold">Request a dossier →</a>
>         </div>
>
>         {/* HERO IMAGE */}
>         <div className="relative frame p-1.5 md:p-3">
>           <span className="frame-tr" /><span className="frame-bl" />
>           <div className="relative aspect-[16/9] overflow-hidden bg-ink-soft">
>             <Image src={item.cover} alt={item.name} fill sizes="100vw" priority className="object-cover" />
>           </div>
>         </div>
>
>         {/* DESCRIPTION */}
>         <div className="grid grid-cols-12 gap-y-8 md:gap-12">
>           <div className="col-span-12 md:col-span-3"><div className="eyebrow">§ Notes</div></div>
>           <div className="col-span-12 md:col-span-9 space-y-7">
>             {item.description?.map((p, i) => (
>               <Reveal key={i} delay={i * 80}>
>                 <p className="font-display font-light text-xl md:text-2xl leading-[1.45] tracking-[-0.015em] text-bone/85 max-w-3xl">{p}</p>
>               </Reveal>
>             ))}
>           </div>
>         </div>
>
>         {/* EXTERIORS */}
>         {item.gallery && item.gallery.length > 0 && (
>           <section className="space-y-6">
>             <div className="eyebrow">§ Exteriors</div>
>             <Carousel images={item.gallery} alt={item.name} />
>           </section>
>         )}
>
>         {/* SPECS GRID */}
>         <section className="space-y-6">
>           <div className="eyebrow">§ Specifications</div>
>           <dl className="grid grid-cols-1 md:grid-cols-2 gap-y-2">
>             {[
>               ["Architect", item.architect],
>               ["Coordinates", item.coordinates],
>               ["Region", item.region],
>               ["Year", item.year],
>             ].filter(([_, v]) => v).map(([k, v]) => (
>               <div key={k} className="flex items-baseline justify-between border-b border-line py-4">
>                 <dt className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-bone/50">{k}</dt>
>                 <dd className="font-display text-lg text-bone tracking-[-0.01em]">{v}</dd>
>               </div>
>             ))}
>           </dl>
>         </section>
>
>         {/* CONTACT */}
>         <section id="correspondence" className="border-t border-line pt-16 md:pt-20 grid grid-cols-12 gap-y-10 md:gap-16">
>           <div className="col-span-12 md:col-span-5 space-y-6">
>             <div className="eyebrow">§ Correspondence</div>
>             <h2 className="font-display font-extralight text-4xl md:text-5xl tracking-[-0.04em]">
>               Request the<br />
>               <span className="gold-text">full dossier.</span>
>             </h2>
>             <p className="font-body text-bone/65 text-base leading-[1.8] font-light max-w-md">
>               Floor plans, materials specification, build timeline. Sent by reply within 24 hours.
>             </p>
>           </div>
>           <div className="col-span-12 md:col-span-7 md:pl-8">
>             <ContactForm source="home" />
>           </div>
>         </section>
>
>         {/* NEXT / PREV */}
>         <nav className="border-t border-line pt-10 grid grid-cols-2 gap-8">
>           <Link href={`{{ITEM_BASE_PATH}}/${prev.slug}`} className="group">
>             <div className="eyebrow-sm mb-2">← Previous</div>
>             <div className="font-display text-xl md:text-2xl tracking-[-0.02em] text-bone/65 group-hover:text-gold transition-colors">{prev.name}</div>
>           </Link>
>           <Link href={`{{ITEM_BASE_PATH}}/${next.slug}`} className="group text-right">
>             <div className="eyebrow-sm mb-2">Next →</div>
>             <div className="font-display text-xl md:text-2xl tracking-[-0.02em] text-bone/65 group-hover:text-gold transition-colors">{next.name}</div>
>           </Link>
>         </nav>
>       </div>
>     </article>
>   );
> }
> ```
>
> ---
>
> ## 2. Index page — `app/(site)/{{INDEX_PATH_SEG}}/page.tsx`
>
> The browse-all page. Hero scroll-video at top (optional — depends on whether you generated a second frame set), then a grid of all items as cards. Master Homes used a second `<ScrollVideo framesBase="frames-properties" />` here; if you don't have a second frame set yet, replace the hero with a simple `<section>` showing the index headline + eyebrow.
>
> ```tsx
> import Link from "next/link";
> import Image from "next/image";
> import Reveal from "@/app/components/Reveal";
> import { ITEMS } from "@/app/lib/items";
> // Optional second hero:
> // import ScrollVideo from "@/app/components/ScrollVideo";
>
> export const metadata = {
>   title: "{{INDEX_NAV_LABEL}} — {{BRAND_NAME}}",
>   description: "The full collection of {{ITEM_NOUN}}s.",
> };
>
> export default function IndexPage() {
>   return (
>     <>
>       {/* Hero — either a second ScrollVideo or a static headline section */}
>       <section className="relative min-h-[70vh] flex flex-col justify-center pt-28 md:pt-32 pb-16 md:pb-24 px-6 md:px-12">
>         <div className="max-w-[1700px] mx-auto w-full">
>           <span className="eyebrow">§ ii · {{INDEX_NAV_LABEL}}</span>
>           <h1 className="mt-6 font-display font-extralight text-6xl md:text-[10vw] leading-[0.9] tracking-[-0.045em]">
>             The <span className="italic font-extralight">{{INDEX_HERO_ITALIC}}</span>
>             <br />
>             <span className="gold-text">{{INDEX_HERO_BOLD}}.</span>
>           </h1>
>           <p className="mt-8 font-display font-light text-xl md:text-2xl tracking-[-0.02em] text-bone/55 max-w-xl">
>             {{INDEX_INTRO}}
>           </p>
>         </div>
>       </section>
>
>       <section className="bg-ink border-t border-line py-20 md:py-28">
>         <div className="max-w-[1700px] mx-auto px-6 md:px-12 grid grid-cols-12 gap-x-8 gap-y-16 md:gap-y-24">
>           {ITEMS.map((item, i) => (
>             <Reveal key={item.slug} delay={i * 60} className="col-span-12 md:col-span-6">
>               <Link href={`{{ITEM_BASE_PATH}}/${item.slug}`} className="group block">
>                 <div className="relative frame p-1.5 md:p-3">
>                   <span className="frame-tr" /><span className="frame-bl" />
>                   <div className="relative aspect-[5/3] overflow-hidden bg-ink-soft">
>                     <Image
>                       src={item.cover}
>                       alt={item.name}
>                       fill
>                       sizes="(max-width: 768px) 100vw, 50vw"
>                       className="object-cover transition-transform duration-[1800ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:scale-[1.04]"
>                     />
>                     <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
>                   </div>
>                 </div>
>                 <div className="mt-5 flex items-baseline justify-between gap-4">
>                   <div>
>                     <div className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-gold mb-2">{item.location}</div>
>                     <h2 className="font-display font-light text-3xl tracking-[-0.03em] text-bone group-hover:text-gold transition-colors duration-700">{item.name}</h2>
>                   </div>
>                   <span className="font-display gold-text serif-nums text-2xl">{item.price}</span>
>                 </div>
>               </Link>
>             </Reveal>
>           ))}
>         </div>
>       </section>
>     </>
>   );
> }
> ```
>
> ---
>
> ## 3. About page — `app/(site)/about/page.tsx`
>
> Long-form. Eyebrow + display headline → hero image (the studio portrait) → 4–6 stacked text blocks each in a `<Reveal>`, alternating heading-left / body-right grids. End with a CTA strip linking to contact.
>
> ```tsx
> import Image from "next/image";
> import Link from "next/link";
> import Reveal from "@/app/components/Reveal";
>
> export const metadata = {
>   title: "Studio — {{BRAND_NAME}}",
>   description: "{{ABOUT_META_DESCRIPTION}}",
> };
>
> export default function AboutPage() {
>   return (
>     <article className="pt-28 md:pt-32 pb-24 md:pb-32">
>       <div className="max-w-[1500px] mx-auto px-6 md:px-12 space-y-20 md:space-y-28">
>         <header className="space-y-6">
>           <span className="eyebrow">§ iii · studio</span>
>           <h1 className="font-display font-extralight text-5xl md:text-[7vw] leading-[0.92] tracking-[-0.045em] max-w-3xl">
>             {{ABOUT_HEADLINE_1}}
>             <br />
>             <span className="gold-text">{{ABOUT_HEADLINE_2}}</span>
>           </h1>
>         </header>
>
>         <Reveal>
>           <div className="relative aspect-[16/9] w-full overflow-hidden">
>             <Image src="{{ABOUT_IMAGE}}" alt="{{BRAND_NAME}} studio" fill sizes="100vw" priority className="object-cover" />
>           </div>
>         </Reveal>
>
>         {/* alternating text blocks — Claude: build 4 blocks from the brief */}
>         {[
>           ["Origin",       "{{ABOUT_BLOCK_1}}"],
>           ["Method",       "{{ABOUT_BLOCK_2}}"],
>           ["Material",     "{{ABOUT_BLOCK_3}}"],
>           ["What's next",  "{{ABOUT_BLOCK_4}}"],
>         ].map(([label, body], i) => (
>           <Reveal key={label}>
>             <div className="grid grid-cols-12 gap-y-6 md:gap-12">
>               <div className="col-span-12 md:col-span-3">
>                 <div className="eyebrow">§ {label}</div>
>               </div>
>               <div className="col-span-12 md:col-span-9">
>                 <p className="font-display font-light text-xl md:text-2xl leading-[1.45] tracking-[-0.015em] text-bone/85 max-w-3xl">
>                   {body}
>                 </p>
>               </div>
>             </div>
>           </Reveal>
>         ))}
>
>         <div className="border-t border-line pt-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
>           <div className="font-display text-3xl font-light tracking-[-0.03em] text-bone/85">
>             Want to talk about a project?
>           </div>
>           <Link href="/contact" className="btn-gold">Get in touch →</Link>
>         </div>
>       </div>
>     </article>
>   );
> }
> ```
>
> ---
>
> ## 4. Contact page — `app/(site)/contact/page.tsx`
>
> Minimal — eyebrow + headline + the `<ContactForm source="contact" />` + reachable channels (email, phone, address).
>
> ```tsx
> import ContactForm from "@/app/components/ContactForm";
>
> export const metadata = {
>   title: "Contact — {{BRAND_NAME}}",
>   description: "Get in touch with {{BRAND_NAME}}.",
> };
>
> export default function ContactPage() {
>   return (
>     <article className="pt-28 md:pt-32 pb-24 md:pb-32">
>       <div className="max-w-[1500px] mx-auto px-6 md:px-12 grid grid-cols-12 gap-y-14 md:gap-16">
>         <header className="col-span-12 md:col-span-5 space-y-6">
>           <span className="eyebrow">§ iv · contact us</span>
>           <h1 className="font-display font-extralight text-5xl md:text-[5.5vw] leading-[0.95] tracking-[-0.04em]">
>             Get in<br /><span className="gold-text">touch.</span>
>           </h1>
>           <p className="font-body text-bone/65 text-base leading-[1.8] font-light max-w-md">
>             {{CONTACT_INTRO}}
>           </p>
>           <div className="hairline w-32" />
>           <div className="space-y-2 pt-2">
>             <a href="mailto:{{REPLY_TO}}" className="block font-display text-xl text-bone hover:text-gold transition-colors">{{REPLY_TO}}</a>
>             <a href="tel:{{PHONE_RAW}}" className="block font-mono text-[0.7rem] uppercase tracking-[0.22em] text-bone/65 hover:text-gold transition-colors">{{PHONE}} →</a>
>             <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-bone/45 pt-3">{{LOCATION}}</p>
>           </div>
>         </header>
>         <div className="col-span-12 md:col-span-7 md:pl-8">
>           <ContactForm source="contact" />
>         </div>
>       </div>
>     </article>
>   );
> }
> ```
>
> ## Verify
>
> - `pnpm dev` → visit `{{ITEM_BASE_PATH}}/{first-slug}` → page renders with all 9 sections. Click "Request a dossier →" — page smooth-scrolls to the inline contact form (Lenis handles the `#correspondence` anchor).
> - 404 a bogus slug → `notFound()` renders the default Next.js 404. (Optional: drop in `app/not-found.tsx` later for a branded 404.)
> - Visit `{{INDEX_PATH}}` → grid of all items, hover scales the cover, link wraps the whole card.
> - Visit `/about` → 4 stacked text blocks fade up.
> - Visit `/contact` → form posts (still logs to console; phase 09 wires the real endpoint).
> - Click navbar nav links between these pages — `<SmoothScroll>`'s route-change reset takes you to the top of each.
>
> ## What NOT to do
>
> - Do NOT make any of these pages `"use client"`. They're server components; the form/carousel inside are the only client islands.
> - Do NOT use `<a>` for internal navigation. `<Link>` is required for the smooth-scroll route-reset to fire on the route change.
> - Do NOT add a "share" or "save" affordance unless the brief says so. They look generic.
> - Do NOT use Next's image optimization for the hero on the index page if it's a scroll video — the scroll video paints directly to canvas; no `<Image>` needed.
> - Do NOT use `params.slug` synchronously. In Next.js 16, `params` is a Promise — `await params` first, then destructure.
>
> ## Acceptance
>
> - All four routes render without console errors.
> - `generateStaticParams` produces one entry per item, verified by running `pnpm build` (optional but recommended).
> - Dossier page's prev/next loops correctly at array boundaries.
> - Reveal blocks fade in on scroll, stay visible.
>
> Report back with the file tree under `app/(site)/` after building, and confirm `pnpm build` succeeds.

---

## Notes for the human

- **Why a dossier page at all (vs. a modal)?** A real URL per item is what gets indexed, shared in messages, and linked from email signatures. Modals lose all of that.
- **Why prev/next at the bottom of the dossier?** It mirrors editorial / magazine convention. Users who bounce off the contact CTA still have somewhere intentional to go next.
- **The contact form is duplicated three places.** Home (Correspondence section), dossier (inline `#correspondence`), and `/contact`. That's intentional — the conversion moment shouldn't be one extra click away.
