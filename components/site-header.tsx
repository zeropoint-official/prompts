import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-[color:var(--line)] bg-[color:var(--panel)]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-4 sm:px-8">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-xl tracking-tight text-[color:var(--ink)] transition-opacity hover:opacity-80"
        >
          Pr<span className="text-[color:var(--ember)]">m</span>pts
        </Link>
        <nav
          aria-label="Primary"
          className="flex items-center gap-5 text-sm text-[color:var(--muted)]"
        >
          <a href="#gallery" className="transition-colors hover:text-[color:var(--ink)]">
            Library
          </a>
          <a href="#use" className="transition-colors hover:text-[color:var(--ink)]">
            How to use
          </a>
          <a
            href="#gallery"
            className="rounded-full border border-[color:var(--line)] px-3 py-1.5 font-medium text-[color:var(--ink)] transition-colors hover:border-[color:var(--ember)] hover:text-[color:var(--ember)]"
          >
            Browse prompts
          </a>
        </nav>
      </div>
    </header>
  );
}
