"use client";

import { useState, type CSSProperties } from "react";
import type { PromptItem } from "@/lib/prompts";

type Props = { prompt: PromptItem; style?: CSSProperties };

export function PromptCard({ prompt, style }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(prompt.body);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <article
      style={style}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-[color:var(--line)] bg-[color:var(--card)] p-6 shadow-[0_18px_60px_-40px_rgba(0,0,0,0.65)] transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_70px_-36px_rgba(244,185,66,0.18)]"
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-[color:var(--ember)]/10 blur-3xl" />
      </div>
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[color:var(--ember)]">
            {prompt.category}
          </p>
          <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl text-[color:var(--ink)]">
            {prompt.title}
          </h3>
        </div>
        <button
          type="button"
          onClick={copy}
          className="shrink-0 rounded-full border border-[color:var(--line)] bg-[color:var(--panel)] px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[color:var(--ink)] transition-colors hover:border-[color:var(--ember)] hover:text-[color:var(--ember)]"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="relative mt-3 text-sm leading-relaxed text-[color:var(--muted)]">
        {prompt.excerpt}
      </p>
      <pre className="relative mt-4 max-h-40 overflow-y-auto rounded-xl border border-[color:var(--line)]/70 bg-black/35 p-4 font-mono text-[11px] leading-relaxed text-[color:var(--parchment)]/90">
        {prompt.body}
      </pre>
      <div className="relative mt-4 flex flex-wrap gap-2">
        {prompt.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-[color:var(--line)] px-2.5 py-0.5 text-[11px] text-[color:var(--muted)]"
          >
            #{tag}
          </span>
        ))}
      </div>
    </article>
  );
}
