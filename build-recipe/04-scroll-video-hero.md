# 04 — The Scroll-Video Hero

This is the centerpiece of the site — the canvas-based scroll-scrubbed film. Paste the [business brief](./00-business-brief-template.md) values at the top of the session, then this prompt. You're in the same project from phases 02–03.

> **Prerequisite — frames must exist on disk before the component renders.** The component just paints what's in `public/{{FRAMES_BASE}}/{mobile,desktop-1x,desktop-2x}/001.webp` etc. Either generate them now per [01-scroll-video-workflow.md](./01-scroll-video-workflow.md), or use placeholder frames (e.g. 61 numbered solid-color WebPs) until you have your Kling render. The component will render with placeholders — it just won't be cinematic yet.

---

### ▶ Prompt to Claude

> Build `app/components/ScrollVideo.tsx` — a client component that paints a sequence of WebP frames onto a `<canvas>`, with the frame index driven by scroll position. The hero of the home page (`app/(site)/page.tsx`) will be `<ScrollVideo heightVh={220} />` placed as the very first element.
>
> ## Why canvas, not `<video>`
>
> `<video>` cannot be scrubbed reliably across browsers. Safari refuses to seek inside an HLS chunk while the user is mid-scroll; Chrome decodes asynchronously and falls behind. The widely-shipped fix is: pre-render the video to N still frames, decode them all up-front, and paint the right one to a canvas on every `requestAnimationFrame`. Scrubbing at 120Hz becomes possible because painting a pre-decoded image is essentially free.
>
> ## Component contract
>
> ```tsx
> type ScrollVideoProps = {
>   heightVh?: number;        // total scroll spacer height in vh (desktop default 220)
>   framesBase?: string;      // public folder name under public/ (default "frames")
>   children?: ReactNode;     // overrides the default hero copy block
> };
> ```
>
> ## Constants
>
> ```ts
> const FRAME_COUNT = 61;     // exact count on disk in each tier folder
> const ANIMATION_END = 0.82; // 0..1 — fraction of scroll that scrubs frames; the
>                             // remaining 0.18 fades the hero overlay out so the
>                             // section below can take focus.
> ```
>
> ## Frame-tier selection
>
> ```ts
> function pickTier() {
>   const w = window.innerWidth;
>   const dpr = Math.min(window.devicePixelRatio || 1, 2);
>   if (w < 768) return "mobile";
>   return w * dpr >= 2000 ? "desktop-2x" : "desktop-1x";
> }
>
> function framePath(base: string, tier: string, i: number) {
>   return `/${base}/${tier}/${String(i).padStart(3, "0")}.webp`;
> }
> ```
>
> ## Mobile optimization
>
> On mobile (`pickTier() === "mobile"`), load **every second frame** (31 images instead of 61). Halves bandwidth and memory.
>
> ```ts
> const frameStep = isMobile ? 2 : 1;
> const frameCount = Math.ceil(FRAME_COUNT / frameStep);
> // index i maps to frameNum = i * frameStep + 1
> ```
>
> Also reduce the spacer height from `heightVh` (default 220) to `160` on mobile — the same animation completes with less scroll.
>
> ## Refs (state lives off the React tree)
>
> Hot scroll path runs ~60×/sec. Every `setState` re-renders the entire overlay (5 divs + scrims + title block + status bar) and was the single largest source of mobile scroll jank in the original build. Use refs + direct DOM writes instead:
>
> ```ts
> const spacerRef = useRef<HTMLDivElement | null>(null);
> const overlayRef = useRef<HTMLDivElement | null>(null);
> const canvasRef = useRef<HTMLCanvasElement | null>(null);
> const titleWrapRef = useRef<HTMLDivElement | null>(null);
> const statusWrapRef = useRef<HTMLDivElement | null>(null);
> const progressBarRef = useRef<HTMLDivElement | null>(null);
> const imagesRef = useRef<HTMLImageElement[]>([]);
> const rafRef = useRef<number | null>(null);
> const lastFrameRef = useRef(-1);
> const totalFramesRef = useRef(FRAME_COUNT);
> // "last applied DOM values" so we skip writes when nothing visibly changed
> const lastTitleOpRef = useRef(-1);
> const lastFadeOpRef = useRef(-1);
> const lastProgressRef = useRef(-1);
> const lastHiddenRef = useRef(false);
> ```
>
> State only for things that drive React renders — i.e. the loading splash:
>
> ```ts
> const [loaded, setLoaded] = useState(0);
> const [ready, setReady] = useState(false);
> const [totalFrames, setTotalFrames] = useState(FRAME_COUNT);
> const [effectiveHeight, setEffectiveHeight] = useState(heightVh);
> ```
>
> ## Image preloading
>
> On mount (single `useEffect`, deps `[]`):
>
> ```ts
> for (let i = 0; i < frameCount; i++) {
>   const frameNum = i * frameStep + 1;
>   const img = new Image();
>   // first 8 frames get fetchPriority high so first paint is instant
>   if (i < 8) (img as any).fetchPriority = "high";
>   // attach onload before src so cached images still fire
>   img.onload = () => {
>     done += 1;
>     setLoaded(done);
>     // Gate ready on frame 0 SPECIFICALLY — not the first one to finish.
>     // If we gated on whichever loaded first, drawFrame(0) could be called
>     // while frame 0 is still loading, bail out, and never retry.
>     if (i === 0) {
>       setReady(true);
>       requestAnimationFrame(() => drawFrame(0));
>     }
>   };
>   img.src = framePath(framesBase, tier, frameNum);
>   imgs.push(img);
> }
> imagesRef.current = imgs;
> ```
>
> ## drawFrame(idx)
>
> Draws frame `idx` to the canvas, cover-style (max scale, centered):
>
> ```ts
> const drawFrame = (idx: number) => {
>   const canvas = canvasRef.current;
>   const img = imagesRef.current[idx];
>   if (!canvas || !img || !img.complete || !img.naturalWidth) return;
>
>   const dpr = Math.min(window.devicePixelRatio || 1, 2);
>   const w = window.innerWidth;
>   const h = window.innerHeight;
>
>   const needsResize =
>     canvas.width !== Math.round(w * dpr) ||
>     canvas.height !== Math.round(h * dpr);
>   if (needsResize) {
>     canvas.width = Math.round(w * dpr);
>     canvas.height = Math.round(h * dpr);
>     lastFrameRef.current = -1; // force full redraw after resize
>   }
>
>   const ctx = canvas.getContext("2d");
>   if (!ctx) return;
>   ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
>   ctx.imageSmoothingEnabled = true;
>   ctx.imageSmoothingQuality = isMobile ? "medium" : "high";
>
>   // fill only on first draw or after resize — paint-over otherwise (the image covers the canvas)
>   if (lastFrameRef.current === -1) {
>     ctx.fillStyle = "#0f0b06";
>     ctx.fillRect(0, 0, w, h);
>   }
>
>   const iw = img.naturalWidth;
>   const ih = img.naturalHeight;
>   const scale = Math.max(w / iw, h / ih); // cover
>   const dw = iw * scale;
>   const dh = ih * scale;
>   ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
>   lastFrameRef.current = idx;
> };
> ```
>
> ## onScroll — the hot path
>
> Single `window` scroll listener (passive), rAF-throttled, writes directly to DOM:
>
> ```ts
> const onScroll = () => {
>   if (rafRef.current != null) return;
>   rafRef.current = requestAnimationFrame(() => {
>     rafRef.current = null;
>     const spacer = spacerRef.current;
>     if (!spacer) return;
>     const rect = spacer.getBoundingClientRect();
>     const total = spacer.offsetHeight;
>     const scrolled = Math.max(0, Math.min(total, -rect.top));
>     const t = total > 0 ? scrolled / total : 0;
>
>     // Scrub portion of the spacer (0..ANIMATION_END maps to 0..1 of frames)
>     const animP = Math.min(1, t / ANIMATION_END);
>
>     const fc = totalFramesRef.current;
>     const frame = Math.min(fc - 1, Math.max(0, Math.round(animP * (fc - 1))));
>     if (frame !== lastFrameRef.current) drawFrame(frame);
>
>     // Tail portion (ANIMATION_END..1) fades the overlay out
>     const fo = Math.max(0, Math.min(1, (t - ANIMATION_END) / (1 - ANIMATION_END)));
>
>     // Title fade-up follows the first 45% of the scrub
>     const titleP = Math.min(1, animP / 0.45);
>     const titleOpacity = 1 - titleP;
>     const titleShift = titleP * -60;
>     const titleOpQ = Math.round(titleOpacity * 1000); // round to 3dp to skip duplicate writes
>     if (titleOpQ !== lastTitleOpRef.current) {
>       lastTitleOpRef.current = titleOpQ;
>       const title = titleWrapRef.current;
>       if (title) {
>         title.style.opacity = String(titleOpacity);
>         title.style.transform = `translateY(${titleShift}px)`;
>       }
>       const status = statusWrapRef.current;
>       if (status) status.style.opacity = String(titleOpacity);
>     }
>
>     const progressQ = Math.round(animP * 1000);
>     if (progressQ !== lastProgressRef.current) {
>       lastProgressRef.current = progressQ;
>       const bar = progressBarRef.current;
>       if (bar) bar.style.width = `${animP * 100}%`;
>     }
>
>     const fadeQ = Math.round(fo * 1000);
>     if (fadeQ !== lastFadeOpRef.current) {
>       lastFadeOpRef.current = fadeQ;
>       const overlay = overlayRef.current;
>       if (overlay) {
>         overlay.style.opacity = String(1 - fo);
>         overlay.style.pointerEvents = fo > 0.5 ? "none" : "auto";
>         const shouldHide = fo >= 0.999;
>         if (shouldHide !== lastHiddenRef.current) {
>           lastHiddenRef.current = shouldHide;
>           overlay.style.visibility = shouldHide ? "hidden" : "visible";
>         }
>       }
>     }
>   });
> };
> ```
>
> Resize handler:
>
> ```ts
> const onResize = () => {
>   drawFrame(lastFrameRef.current >= 0 ? lastFrameRef.current : 0);
>   onScroll();
> };
> ```
>
> Register both, call `onScroll()` once after wiring, clean up on unmount.
>
> ## DOM structure
>
> ```tsx
> return (
>   <>
>     {/* scroll spacer — owns the scroll distance */}
>     <div
>       ref={spacerRef}
>       style={{ height: `${effectiveHeight}vh` }}
>       className="relative bg-ink"
>       aria-hidden
>     />
>
>     {/* hero overlay — fixed to viewport for the duration of the spacer.
>         opacity / visibility / pointer-events are mutated via ref above. */}
>     <div
>       ref={overlayRef}
>       className="noise"
>       style={{
>         position: "fixed",
>         inset: 0,
>         zIndex: 20,
>         opacity: 1,
>         pointerEvents: "auto",
>         visibility: "visible",
>         transition: "opacity 0.05s linear, visibility 0s linear",
>       }}
>     >
>       <canvas
>         ref={canvasRef}
>         className="absolute inset-0 block"
>         style={{ width: "100%", height: "100%" }}
>         aria-hidden
>       />
>
>       {/* filmic scrims — two layers, soft */}
>       <div
>         className="pointer-events-none absolute inset-0"
>         style={{
>           background:
>             "linear-gradient(180deg, rgba(15,11,6,0.55) 0%, rgba(15,11,6,0.05) 28%, rgba(15,11,6,0.00) 55%, rgba(15,11,6,0.45) 82%, rgba(15,11,6,0.92) 100%)",
>         }}
>       />
>       <div
>         className="pointer-events-none absolute inset-0 mix-blend-overlay"
>         style={{
>           background:
>             "radial-gradient(80% 55% at 50% 115%, rgba({{ACCENT_RGB}}, 0.22), transparent 65%)",
>         }}
>       />
>
>       {/* loading splash — only while !ready */}
>       {!ready && (
>         <div className="absolute inset-0 flex items-center justify-center bg-ink z-40">
>           <div className="text-center">
>             <div className="font-mono text-[0.65rem] uppercase tracking-[0.4em] text-gold/80 mb-4">
>               Rendering the film
>             </div>
>             <div className="h-px w-48 bg-line relative overflow-hidden mx-auto">
>               <div
>                 className="absolute top-0 left-0 h-full bg-gold transition-[width]"
>                 style={{ width: `${(loaded / totalFrames) * 100}%` }}
>               />
>             </div>
>             <div className="mt-3 font-mono text-[0.55rem] tracking-[0.3em] text-bone/40">
>               {String(Math.round((loaded / totalFrames) * 100)).padStart(2, "0")} / 100
>             </div>
>           </div>
>         </div>
>       )}
>
>       {/* HERO TITLE — anchored bottom-right desktop, bottom-center mobile */}
>       <div
>         ref={titleWrapRef}
>         className="absolute inset-0 flex flex-col justify-end items-center md:items-end px-6 md:px-14 lg:px-20 pb-14 md:pb-28 pointer-events-none"
>         style={{ opacity: 1, transform: "translateY(0px)", willChange: "opacity, transform" }}
>       >
>         <div className="pointer-events-auto text-center md:text-right w-full md:w-auto">
>           {children ?? <DefaultHeroCopy />}
>         </div>
>       </div>
>
>       {/* bottom status bar — brand + thin progress bar */}
>       <div
>         ref={statusWrapRef}
>         className="pointer-events-none absolute bottom-0 inset-x-0 px-6 md:px-10 pb-5 md:pb-7"
>         style={{ opacity: 1 }}
>       >
>         <div className="flex items-end justify-between gap-6">
>           <div className="flex items-center gap-3 font-mono text-[0.56rem] uppercase tracking-[0.4em] text-white/45">
>             <span>{{BRAND_NAME}} · {{LOCATION_SHORT}}</span>
>           </div>
>           <div className="relative h-px w-28 md:w-40 bg-white/15 overflow-hidden">
>             <div
>               ref={progressBarRef}
>               className="absolute inset-y-0 left-0 bg-white/50"
>               style={{ width: "0%" }}
>             />
>           </div>
>         </div>
>       </div>
>     </div>
>   </>
> );
> ```
>
> ## Default hero copy (`<DefaultHeroCopy />`)
>
> Three stacked display lines using mixed weight + italic + a single accent line, plus a "Currently featuring" mono micro-label, plus two buttons (`btn-gold` + `btn-ghost`). Build from `{{HERO_HEADLINE}}` in the brief. Example for Master Homes:
>
> ```tsx
> <h1 className="fade-up font-display text-white tracking-[-0.04em] leading-[0.88]">
>   <span className="block font-extralight text-[clamp(3.4rem,13vw,8rem)] md:text-[9.5vw]">High</span>
>   <span className="block text-[clamp(2.4rem,9vw,5.5rem)] md:text-[7vw] mt-1 md:mt-2">
>     <span className="italic font-extralight">quality</span>{" "}
>     <span className="font-semibold">homes</span>
>   </span>
>   <span className="block text-[clamp(1.9rem,7vw,4.4rem)] md:text-[5.6vw] mt-1 md:mt-3">
>     <span className="font-semibold">build</span>{" "}
>     <span className="italic font-extralight text-bone/65">to last.</span>
>   </span>
> </h1>
>
> <div className="fade-up flex items-center justify-center md:justify-end gap-3 mt-4 md:mt-6" style={{ animationDelay: "0.18s" }}>
>   <span className="font-mono text-[0.58rem] uppercase tracking-[0.28em] text-white/60">
>     Currently featuring
>   </span>
>   <span className="h-px w-4 bg-gold/60" />
>   <span className="font-mono text-[0.58rem] uppercase tracking-[0.28em] text-gold">
>     {{FEATURED_ITEM_NAME}}
>   </span>
> </div>
>
> <div className="fade-up mt-5 md:mt-8 flex flex-col sm:flex-row items-center justify-center md:justify-end gap-3 md:gap-5" style={{ animationDelay: "0.3s" }}>
>   <Link href="{{FEATURED_ITEM_PATH}}" className="btn-gold w-full sm:w-auto justify-center">View {{FEATURED_ITEM_NAME}} →</Link>
>   <a href="#collection" className="hidden md:inline-flex btn-ghost">The Collection ↗</a>
> </div>
> ```
>
> Italicize the "soft" words and bold the "strong" words per the brief's `{{HERO_HEADLINE}}` instructions.
>
> ## Mount it
>
> Replace `app/(site)/page.tsx`'s placeholder with:
>
> ```tsx
> import ScrollVideo from "@/app/components/ScrollVideo";
>
> export default function Home() {
>   return (
>     <>
>       <ScrollVideo heightVh={220} />
>       {/* Phase 05 adds CollectionOverture here */}
>       {/* Phase 06 adds PortfolioStack here */}
>     </>
>   );
> }
> ```
>
> ## Verify
>
> - `pnpm dev` → home page loads → "Rendering the film" splash visible briefly → first frame paints → scrolling scrubs through frames → title fades up and translates as you scroll → progress bar fills → at ~82% of the spacer scroll the overlay fades out and the section below (initially blank) becomes visible.
> - Scrubbing is buttery-smooth on desktop. Performance tab: rAF should stay close to 16ms; no setState calls during scroll.
> - Resize the window: canvas redraws correctly at new size.
> - Open DevTools → toggle mobile emulation → reload. Half the frames load (31 instead of 61), spacer is 160vh instead of 220vh.
> - Reload with throttled "Slow 3G" — the splash stays visible with a real progress count, doesn't show a broken canvas.
>
> ## What NOT to do
>
> - Do NOT use `<video>` instead of canvas. The reason is documented above — scrubbing falls apart in Safari and Chrome.
> - Do NOT preload frames in a Web Worker. The decoded `HTMLImageElement` cache the main thread builds is exactly what we need; piping decoded ImageBitmaps through `postMessage` is slower and more memory.
> - Do NOT replace `requestAnimationFrame` with `useEffect` for the scroll handler. rAF is the only way to coalesce multi-event scroll burts to one paint.
> - Do NOT call `setState` inside `onScroll`. Already covered — every setState would re-render the overlay tree, killing performance.
> - Do NOT remove the `if (i === 0)` check inside `img.onload`. Gating "ready" on the *first* loaded image (not specifically frame 0) is a real bug we already hit — drawFrame(0) is called, frame 0 is still loading, bails out, never retries.
> - Do NOT add a `<video>` fallback for users without canvas support. Canvas is universally supported in any browser that runs React 19. Stop adding fallbacks for browsers that don't exist.
>
> ## Acceptance
>
> - Component file is ~280 lines including the default hero copy.
> - Scroll FPS on a 2019 MacBook Pro stays at 60.
> - Mobile (real device) scrub doesn't jank during overlay fade.
> - Loading splash count goes 00 → 100 as frames load.
>
> Report back the final component line count and the rendered output description.

---

## Notes for the human

- **Multiple heroes per site?** Each page that wants a scroll-video hero just renders `<ScrollVideo framesBase="frames-properties" />` (or whatever base). Each base is a separate `public/<base>/{mobile,desktop-1x,desktop-2x}/` tree.
- **What if frames look "smeary" during scrub?** Drop the WebP quality (re-encode at 72) — sometimes the encoder banding is what you're seeing, not the canvas. Don't switch image format.
- **Why exactly 61 frames?** It's the count we shipped. 61 = ~12 fps for a 5-second clip — enough that scrubbing slowly doesn't feel "jumpy" and few enough that all images fit in mobile RAM. You can change it; just update `FRAME_COUNT` and regenerate frames to match.
