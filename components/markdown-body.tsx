"use client";

import { useEffect, useRef } from "react";

type Props = { html: string };

// Renders pre-built markdown HTML and progressively enhances every <pre> with a
// copy button. Done client-side so the server output stays static and indexable.
export function MarkdownBody({ html }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const pres = root.querySelectorAll<HTMLPreElement>("pre");
    const cleanups: Array<() => void> = [];

    pres.forEach((pre) => {
      if (pre.dataset.copyMounted === "1") return;
      pre.dataset.copyMounted = "1";
      pre.classList.add("group/code");

      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = "Copy";
      btn.className =
        "absolute right-3 top-3 rounded-full border border-[color:var(--line)] bg-black/40 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--muted)] opacity-0 transition-opacity hover:border-[color:var(--ember)] hover:text-[color:var(--ember)] group-hover/code:opacity-100 focus:opacity-100";

      const code = pre.querySelector("code");
      const payload = (code?.textContent ?? pre.textContent ?? "").replace(/\n$/, "");

      const onClick = async () => {
        try {
          await navigator.clipboard.writeText(payload);
          btn.textContent = "Copied";
          setTimeout(() => {
            btn.textContent = "Copy";
          }, 1800);
        } catch {
          btn.textContent = "Failed";
          setTimeout(() => {
            btn.textContent = "Copy";
          }, 1800);
        }
      };

      btn.addEventListener("click", onClick);
      pre.appendChild(btn);

      cleanups.push(() => {
        btn.removeEventListener("click", onClick);
        btn.remove();
        delete pre.dataset.copyMounted;
      });
    });

    return () => cleanups.forEach((fn) => fn());
  }, [html]);

  return (
    <div
      ref={ref}
      className="prose-recipe"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
