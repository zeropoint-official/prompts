export function SiteFooter() {
  return (
    <footer className="border-t border-[color:var(--line)] bg-[color:var(--panel)]/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-10 text-sm text-[color:var(--muted)] sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="font-[family-name:var(--font-display)] text-[color:var(--ink)]">
          Prmpts · AI prompts worth keeping around.
        </p>
        <p className="max-w-md leading-relaxed">
          Templates are starting points. Edit for your tools, models, and safety policies before
          sharing widely.
        </p>
      </div>
    </footer>
  );
}
