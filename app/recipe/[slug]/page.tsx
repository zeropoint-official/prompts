import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { CopyButton } from "@/components/copy-button";
import { MarkdownBody } from "@/components/markdown-body";
import {
  extractHeadings,
  getAdjacent,
  getRecipe,
  getRecipes,
  renderMarkdown,
} from "@/lib/recipes";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getRecipes().map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const recipe = getRecipe(slug);
  if (!recipe) return {};
  return {
    title: recipe.title,
    description: recipe.blurb,
  };
}

const KIND_LABEL = {
  overview: "Overview",
  manual: "Manual step (you, not Claude)",
  prompt: "Prompt for Claude Code",
  template: "Fill-in template",
} as const;

export default async function RecipePage({ params }: Props) {
  const { slug } = await params;
  const recipe = getRecipe(slug);
  if (!recipe) notFound();

  const html = renderMarkdown(recipe.body);
  const headings = extractHeadings(recipe.body);
  const { prev, next } = getAdjacent(slug);
  const isCopyable = recipe.kind === "prompt" || recipe.kind === "template";

  const stepLabel =
    recipe.kind === "overview"
      ? "Overview"
      : recipe.step !== null
        ? `Step ${String(recipe.step).padStart(2, "0")}`
        : "—";

  return (
    <div className="relative isolate flex min-h-full flex-col">
      <SiteHeader />

      <main className="relative z-[1] flex-1">
        {/* RECIPE HEADER */}
        <section className="relative overflow-hidden border-b border-[color:var(--line)]">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-[-10%] top-[-30%] h-[360px] w-[360px] rounded-full bg-[color:var(--ember)]/[0.10] blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-5xl px-5 pt-12 pb-12 sm:px-8 lg:pt-16 lg:pb-14">
            <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.3em]">
              <Link
                href="/#steps"
                className="text-[color:var(--muted)] transition-colors hover:text-[color:var(--ember)]"
              >
                ← All steps
              </Link>
              <span aria-hidden className="text-[color:var(--line)]">
                /
              </span>
              <span className="text-[color:var(--ember)]">{stepLabel}</span>
              <span aria-hidden className="text-[color:var(--line)]">
                /
              </span>
              <span className="text-[color:var(--muted)]">{KIND_LABEL[recipe.kind]}</span>
            </div>

            <h1 className="mt-6 font-[family-name:var(--font-display)] text-3xl leading-[1.1] text-[color:var(--ink)] sm:text-4xl lg:text-[2.85rem]">
              {recipe.title}
            </h1>

            {recipe.blurb && (
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-[color:var(--muted)] sm:text-lg">
                {recipe.blurb}
              </p>
            )}

            {isCopyable && (
              <div className="mt-8 rounded-2xl border border-[color:var(--ember)]/30 bg-[color:var(--card)] p-6 shadow-[0_24px_70px_-50px_rgba(244,185,66,0.35)]">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="max-w-md">
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[color:var(--ember)]">
                      For Claude Code
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-[color:var(--parchment)]">
                      The entire file below is the prompt. Tap copy, open a new Claude Code
                      session, paste, hit enter. Don't edit the prompt unless you know the codebase.
                    </p>
                  </div>
                  <CopyButton text={recipe.body} label="Copy entire prompt" />
                </div>
              </div>
            )}

            {recipe.kind === "manual" && (
              <div className="mt-8 rounded-2xl border border-[color:var(--line)] bg-[color:var(--card)] p-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[color:var(--ember)]">
                  You do this part
                </p>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[color:var(--parchment)]">
                  This step is browser + creative work — Claude can't generate the hero video for
                  you. Follow it through, then hand the resulting MP4 to Claude in step 04.
                </p>
              </div>
            )}

            {recipe.kind === "overview" && (
              <div className="mt-8 rounded-2xl border border-[color:var(--line)] bg-[color:var(--card)] p-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[color:var(--ember)]">
                  Read me first
                </p>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[color:var(--parchment)]">
                  This page is context, not a prompt. It explains what the recipe builds and how
                  the layers depend on each other. Skim it before opening step 00.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* BODY + TOC */}
        <section className="relative mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-[1fr_220px]">
            <article className="min-w-0">
              <MarkdownBody html={html} />
            </article>

            {headings.length > 1 && (
              <aside className="hidden lg:block">
                <div className="sticky top-24">
                  <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[color:var(--ember)]">
                    On this page
                  </p>
                  <ol className="mt-4 space-y-2 border-l border-[color:var(--line)] pl-4 text-sm">
                    {headings.map((h) => (
                      <li key={h.id}>
                        <a
                          href={`#${h.id}`}
                          className="block text-[color:var(--muted)] transition-colors hover:text-[color:var(--ember)]"
                        >
                          {h.text}
                        </a>
                      </li>
                    ))}
                  </ol>
                </div>
              </aside>
            )}
          </div>
        </section>

        {/* PREV / NEXT */}
        <section className="border-t border-[color:var(--line)] bg-[color:var(--panel)]/55">
          <div className="mx-auto grid max-w-5xl gap-4 px-5 py-10 sm:grid-cols-2 sm:px-8">
            {prev ? (
              <Link
                href={`/recipe/${prev.slug}`}
                className="group flex flex-col gap-1 rounded-2xl border border-[color:var(--line)] bg-[color:var(--card)] p-5 transition-colors hover:border-[color:var(--ember)]/40"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[color:var(--muted)]">
                  ← Previous
                </span>
                <span className="font-[family-name:var(--font-display)] text-lg text-[color:var(--ink)] group-hover:text-[color:var(--ember)]">
                  {prev.title}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                href={`/recipe/${next.slug}`}
                className="group flex flex-col gap-1 rounded-2xl border border-[color:var(--line)] bg-[color:var(--card)] p-5 text-right transition-colors hover:border-[color:var(--ember)]/40 sm:ml-auto"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[color:var(--muted)]">
                  Next →
                </span>
                <span className="font-[family-name:var(--font-display)] text-lg text-[color:var(--ink)] group-hover:text-[color:var(--ember)]">
                  {next.title}
                </span>
              </Link>
            ) : (
              <span />
            )}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
