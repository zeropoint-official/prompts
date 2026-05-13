import Link from "next/link";
import { SiteFooter } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { RecipeCard } from "@/components/recipe-card";
import { getRecipes } from "@/lib/recipes";

const LAYERS = [
  { id: "L5", title: "CRM, email, auth, analytics", note: "The admin dashboard at /dashboard" },
  { id: "L4", title: "Detail pages", note: "Dossier / item / about / contact" },
  { id: "L3", title: "Reveals, nav, footer, contact", note: "The supporting cast" },
  { id: "L2", title: "Pinned sections", note: "Overture + portfolio stack" },
  { id: "L1", title: "Hero scroll-video", note: "Smooth-scroll + design tokens" },
  { id: "L0", title: "Foundation", note: "Next.js 16 · Tailwind v4 · fonts · Lenis · GSAP" },
];

const HOW = [
  {
    step: "01",
    title: "Fill out the brief once",
    copy: "Open the brand brief, paste your business name, accent color, voice. This single file is read by every other prompt.",
  },
  {
    step: "02",
    title: "Open Claude Code in an empty folder",
    copy: "Install it from claude.com/claude-code. Make a new folder, run claude, and keep this site open in another tab.",
  },
  {
    step: "03",
    title: "Copy each prompt in order, paste, wait",
    copy: "Open step 02 → tap the Copy button → paste into Claude → press enter. When it finishes, move to step 03. Don't skip ahead.",
  },
];

export default function Home() {
  const recipes = getRecipes();
  const overview = recipes.find((r) => r.kind === "overview");
  const steps = recipes.filter((r) => r.kind !== "overview");

  return (
    <div className="relative isolate flex min-h-full flex-col">
      <SiteHeader />
      <main className="relative z-[1] flex-1">
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-[color:var(--line)]">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-[-12%] top-[-20%] h-[420px] w-[420px] rounded-full bg-[color:var(--ember)]/[0.12] blur-3xl" />
            <div className="absolute bottom-[-30%] right-[-14%] h-[540px] w-[540px] rounded-full bg-amber-200/[0.07] blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-16 sm:px-8 lg:pb-28 lg:pt-24">
            <p
              className="text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--ember)]"
              style={{ animation: "rise 0.9s ease-out both" }}
            >
              Build recipe · for vibecoders
            </p>

            <div className="mt-6 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
              <div>
                <h1
                  className="font-[family-name:var(--font-display)] text-4xl leading-[1.05] text-[color:var(--ink)] sm:text-5xl lg:text-[3.55rem]"
                  style={{ animation: "rise 0.95s ease-out 80ms both" }}
                >
                  Ship a cinematic editorial site —{" "}
                  <span className="italic text-[color:var(--ember)]">without writing code yourself.</span>
                </h1>
                <p
                  className="mt-6 max-w-xl text-lg leading-relaxed text-[color:var(--muted)]"
                  style={{ animation: "rise 1s ease-out 140ms both" }}
                >
                  Eleven prompts, in order. You paste each one into Claude Code and it builds the
                  matching slice of the site — scroll-scrubbed hero film, pinned image reveal,
                  stacking portfolio, admin dashboard with CRM and email. No prior dev experience
                  needed. You handle taste; Claude handles syntax.
                </p>
                <div
                  className="mt-8 flex flex-wrap items-center gap-3"
                  style={{ animation: "rise 1s ease-out 200ms both" }}
                >
                  <Link
                    href="#steps"
                    className="inline-flex items-center gap-2 rounded-full bg-[color:var(--ember)] px-5 py-2.5 text-sm font-semibold text-[color:var(--void)] transition-transform hover:-translate-y-0.5"
                  >
                    See the eleven steps
                    <span aria-hidden>→</span>
                  </Link>
                  {overview && (
                    <Link
                      href={`/recipe/${overview.slug}`}
                      className="inline-flex items-center gap-2 rounded-full border border-[color:var(--line)] px-5 py-2.5 text-sm font-medium text-[color:var(--ink)] transition-colors hover:border-[color:var(--ember)] hover:text-[color:var(--ember)]"
                    >
                      Read the overview
                    </Link>
                  )}
                </div>
              </div>

              <aside
                className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--card)] p-7 shadow-[0_26px_80px_-50px_rgba(0,0,0,0.75)] backdrop-blur"
                style={{ animation: "rise 1s ease-out 260ms both" }}
              >
                <p className="font-[family-name:var(--font-display)] text-sm uppercase tracking-[0.26em] text-[color:var(--ember)]">
                  Editorial note
                </p>
                <p className="mt-4 text-[color:var(--parchment)]">
                  These prompts assume{" "}
                  <span className="italic text-[color:var(--ink)]">Claude Code</span> as the
                  builder. Open a fresh session per step. Hit{" "}
                  <span className="font-mono text-[color:var(--ember)]">Copy prompt</span>, paste,
                  let it finish. Review the diff with your eyes, not your engineer brain — does it
                  look right? Then move on.
                </p>
              </aside>
            </div>
          </div>
        </section>

        {/* WHAT YOU GET */}
        <section className="relative border-b border-[color:var(--line)] bg-[color:var(--panel)]/55">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
            <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--ember)]">
                  What you'll ship
                </p>
                <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl leading-tight text-[color:var(--ink)] sm:text-4xl">
                  One Next.js codebase. <br />
                  Two surfaces. <br />
                  <span className="italic text-[color:var(--muted)]">Real studio feel.</span>
                </h2>
              </div>

              <ul className="space-y-6">
                {[
                  {
                    label: "Public site",
                    body: "Scroll-scrubbed hero film, smooth-scroll, pinned aperture reveal, stacking portfolio, contact form, per-item dossier pages. Editorial typography — warm ink + gold accent — not the Tailwind template look.",
                  },
                  {
                    label: "Admin dashboard",
                    body: "Lead CRM with statuses, tags, search, CSV export. First-party analytics (page views, devices, countries). Clerk auth so only you see it. Resend wired so every submission lands in your inbox.",
                  },
                  {
                    label: "Frame pipeline",
                    body: "You generate a 5-second hero clip in Kling / Sora. Claude turns it into responsive WebP frames (mobile / desktop-1x / desktop-2x) and drops them where the hero looks for them.",
                  },
                ].map((it) => (
                  <li key={it.label} className="flex gap-5">
                    <span aria-hidden className="mt-2 h-px w-8 shrink-0 bg-[color:var(--ember)]" />
                    <div>
                      <p className="font-[family-name:var(--font-display)] text-lg text-[color:var(--ink)]">
                        {it.label}
                      </p>
                      <p className="mt-1.5 text-sm leading-relaxed text-[color:var(--muted)]">
                        {it.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* MENTAL MODEL */}
        <section className="relative border-b border-[color:var(--line)]">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--ember)]">
                  Mental model
                </p>
                <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-[color:var(--ink)] sm:text-4xl">
                  Six layers. Bottom-up. Don't skip.
                </h2>
              </div>
              <p className="max-w-md text-sm leading-relaxed text-[color:var(--muted)]">
                Every step above depends on tokens, smooth-scroll, and reveal primitives from
                steps below. Skipping causes weird breakage that's hard to diagnose later.
              </p>
            </div>

            <ol className="mt-10 overflow-hidden rounded-2xl border border-[color:var(--line)] bg-[color:var(--card)]">
              {LAYERS.map((layer, i) => (
                <li
                  key={layer.id}
                  className={`grid grid-cols-[auto_1fr_auto] items-center gap-6 px-6 py-5 sm:px-8 ${
                    i !== LAYERS.length - 1 ? "border-b border-[color:var(--line)]" : ""
                  }`}
                >
                  <span className="font-mono text-xs uppercase tracking-[0.3em] text-[color:var(--ember)]">
                    {layer.id}
                  </span>
                  <span className="font-[family-name:var(--font-display)] text-base text-[color:var(--ink)] sm:text-lg">
                    {layer.title}
                  </span>
                  <span className="hidden text-right text-xs text-[color:var(--muted)] sm:block">
                    {layer.note}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* HOW TO USE */}
        <section id="how" className="relative border-b border-[color:var(--line)] bg-[color:var(--panel)]/55">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:grid-cols-3 sm:px-8 lg:gap-12 lg:py-20">
            {HOW.map((item) => (
              <div key={item.step} className="relative pl-10">
                <span className="absolute left-0 top-1 font-mono text-xs text-[color:var(--ember)]">
                  {item.step}
                </span>
                <h3 className="font-[family-name:var(--font-display)] text-xl text-[color:var(--ink)]">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted)]">
                  {item.copy}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* STEPS */}
        <section id="steps" className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--ember)]">
                The recipe
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-[color:var(--ink)] sm:text-4xl">
                Eleven prompts, in order
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-[color:var(--muted)]">
              Each card opens a self-contained prompt. Tap it, then tap{" "}
              <span className="font-mono text-[color:var(--ember)]">Copy prompt</span> and paste
              into a new Claude Code session.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:gap-7 md:grid-cols-2 lg:grid-cols-3">
            {steps.map((recipe, index) => (
              <RecipeCard
                key={recipe.slug}
                recipe={recipe}
                style={{ animation: `rise 0.9s ease-out ${180 + index * 60}ms both` }}
              />
            ))}
          </div>
        </section>

        {/* CHARACTER */}
        <section className="relative border-t border-[color:var(--line)] bg-[color:var(--panel)]/55">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--ember)]">
              What makes it not look AI-built
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-[color:var(--ink)] sm:text-4xl">
              Seven moves the prompts keep intact.
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {[
                ["Scroll is the timeline.", "Every motion locked to scroll position. Nothing autoplays against the user."],
                ["Canvas frames, not <video>.", "The hero paints WebP stills on a canvas. That's what lets it scrub smoothly at any speed."],
                ["Mobile is a different page.", "Pinned timelines render only on desktop. On phones, the same sections lay out statically."],
                ["Direct DOM on the hot path.", "Hero overlays write to style props directly — no re-renders at scroll-frame rate."],
                ["Editorial typography ladder.", "Display 200–300 at huge sizes; mono 300 with 0.3em uppercase tracking. Not the Tailwind defaults."],
                ["Warm ink, never black.", "#0f0b06 with two radial warm spots. Pure black is what screams 'template.'"],
                ["Gold used like a knife.", "Hairlines, eyebrow labels, one CTA, gradient text. Never as a card fill."],
              ].map(([title, body]) => (
                <div key={title} className="rounded-xl border border-[color:var(--line)] bg-[color:var(--card)] p-5">
                  <p className="font-[family-name:var(--font-display)] text-[color:var(--ink)]">
                    {title}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-[color:var(--muted)]">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
