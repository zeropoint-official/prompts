import { PromptCard } from "@/components/prompt-card";
import { SiteFooter } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { prompts } from "@/lib/prompts";

export default function Home() {
  return (
    <div className="relative isolate flex min-h-full flex-col">
      <SiteHeader />
      <main className="relative z-[1] flex-1">
        <section className="relative overflow-hidden border-b border-[color:var(--line)]">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-[-12%] top-[-20%] h-[420px] w-[420px] rounded-full bg-[color:var(--ember)]/[0.11] blur-3xl" />
            <div className="absolute bottom-[-30%] right-[-14%] h-[540px] w-[540px] rounded-full bg-amber-200/[0.07] blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-16 sm:px-8 lg:pb-28 lg:pt-24">
            <p
              className="text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--ember)]"
              style={{ animation: "rise 0.9s ease-out both" }}
            >
              AI prompts
            </p>
            <div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <div>
                <h1
                  className="font-[family-name:var(--font-display)] text-4xl leading-[1.05] text-[color:var(--ink)] sm:text-5xl lg:text-[3.65rem]"
                  style={{ animation: "rise 0.95s ease-out 80ms both" }}
                >
                  Turn vague asks into deliberate instructions—for models that behave.
                </h1>
                <p
                  className="mt-6 max-w-xl text-lg leading-relaxed text-[color:var(--muted)]"
                  style={{ animation: "rise 1s ease-out 140ms both" }}
                >
                  Prmpts is a compact pattern library for people who paste, tweak, and ship. Copy a
                  template, drop in your specifics, and keep the structure that earns consistency.
                </p>
              </div>
              <div
                className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--card)] p-7 shadow-[0_26px_80px_-50px_rgba(0,0,0,0.75)] backdrop-blur"
                style={{ animation: "rise 1s ease-out 220ms both" }}
              >
                <p className="font-[family-name:var(--font-display)] text-sm uppercase tracking-[0.26em] text-[color:var(--ember)]">
                  Editorial note
                </p>
                <p className="mt-4 text-[color:var(--parchment)]">
                  Prompts age with models—verify outputs, revise tone, add guardrails. Treat these as
                  <span className="italic text-[color:var(--ink)]">
                    {" "}
                    scaffolding
                  </span>
                  , not scripture.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="use"
          className="relative border-b border-[color:var(--line)] bg-[color:var(--panel)]/55"
        >
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:grid-cols-3 sm:px-8 lg:gap-12 lg:py-20">
            {[
              {
                step: "01",
                title: "Choose a shape",
                copy: "Start from a proven skeleton: roles, constraints, and output formats that stay legible.",
              },
              {
                step: "02",
                title: "Insert your specifics",
                copy: "Swap bracketed placeholders, add examples where it matters, shorten where it wanders.",
              },
              {
                step: "03",
                title: "Stress-test the reply",
                copy: "Skim for assumptions, ask for revision passes, and keep a human in the loop where risk lives.",
              },
            ].map((item) => (
              <div key={item.step} className="relative pl-10">
                <span className="absolute left-0 top-1 font-mono text-xs text-[color:var(--ember)]">
                  {item.step}
                </span>
                <h2 className="font-[family-name:var(--font-display)] text-xl text-[color:var(--ink)]">
                  {item.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted)]">{item.copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="gallery" className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--ember)]">
                Library
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-[color:var(--ink)] sm:text-4xl">
                Prompts you can borrow today
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-[color:var(--muted)]">
              Each card includes the full text—copy it into your favorite tool, then iterate in your
              own words.
            </p>
          </div>
          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            {prompts.map((prompt, index) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                style={{ animation: `rise 0.95s ease-out ${260 + index * 90}ms both` }}
              />
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
