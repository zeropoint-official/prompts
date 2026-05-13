"use client";

import { useState } from "react";

type Props = {
  text: string;
  label?: string;
  variant?: "primary" | "ghost";
  className?: string;
};

export function CopyButton({ text, label = "Copy prompt", variant = "primary", className }: Props) {
  const [copied, setCopied] = useState(false);

  async function onClick() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }

  const base =
    "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-transform hover:-translate-y-0.5";

  const tone =
    variant === "primary"
      ? "bg-[color:var(--ember)] text-[color:var(--void)]"
      : "border border-[color:var(--line)] text-[color:var(--ink)] hover:border-[color:var(--ember)] hover:text-[color:var(--ember)]";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={copied ? "Copied to clipboard" : label}
      className={[base, tone, className ?? ""].join(" ")}
    >
      <span aria-hidden>{copied ? "✓" : "⎘"}</span>
      {copied ? "Copied — now paste into Claude Code" : label}
    </button>
  );
}
