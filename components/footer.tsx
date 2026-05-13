export function SiteFooter() {
  return (
    <footer className="border-t border-[color:var(--line)] bg-[color:var(--panel)]/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-10 text-sm text-[color:var(--muted)] sm:flex-row sm:items-start sm:justify-between sm:px-8">
        <p className="font-[family-name:var(--font-display)] text-[color:var(--ink)]">
          Build Recipe · cinematic editorial sites, prompt by prompt.
        </p>
        <p className="max-w-md leading-relaxed">
          The recipe is opinionated and the prompts assume Claude Code. Read each step before
          pasting — Claude does the work, you supply the taste.
        </p>
      </div>
    </footer>
  );
}
