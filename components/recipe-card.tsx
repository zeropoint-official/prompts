import Link from "next/link";
import type { CSSProperties } from "react";
import type { Recipe } from "@/lib/recipes";

type Props = { recipe: Recipe; style?: CSSProperties };

const KIND_LABEL: Record<Recipe["kind"], string> = {
  overview: "Overview",
  manual: "Manual step",
  prompt: "Prompt for Claude",
  template: "Fill-in template",
};

export function RecipeCard({ recipe, style }: Props) {
  const stepLabel =
    recipe.kind === "overview"
      ? "Start"
      : recipe.step !== null
        ? String(recipe.step).padStart(2, "0")
        : "—";

  return (
    <Link
      href={`/recipe/${recipe.slug}`}
      style={style}
      className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-[color:var(--line)] bg-[color:var(--card)] p-6 transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:border-[color:var(--ember)]/40 hover:shadow-[0_24px_70px_-36px_rgba(244,185,66,0.22)]"
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute -right-20 -top-24 h-52 w-52 rounded-full bg-[color:var(--ember)]/12 blur-3xl" />
      </div>

      <div className="relative flex items-center justify-between gap-4">
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-[color:var(--ember)]">
          {stepLabel}
        </span>
        <span className="rounded-full border border-[color:var(--line)] px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--muted)]">
          {KIND_LABEL[recipe.kind]}
        </span>
      </div>

      <h3 className="relative font-[family-name:var(--font-display)] text-xl leading-snug text-[color:var(--ink)]">
        {recipe.title}
      </h3>

      <p className="relative text-sm leading-relaxed text-[color:var(--muted)]">
        {recipe.blurb}
      </p>

      <span className="relative mt-auto inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-[color:var(--ink)] transition-colors group-hover:text-[color:var(--ember)]">
        Open
        <span aria-hidden className="transition-transform group-hover:translate-x-1">
          →
        </span>
      </span>
    </Link>
  );
}
