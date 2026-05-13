import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-[color:var(--line)] bg-[color:var(--void)]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-4 sm:px-8">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-base tracking-tight text-[color:var(--ink)] transition-opacity hover:opacity-80 sm:text-lg"
        >
          Build<span className="text-[color:var(--ember)]"> · </span>Recipe
        </Link>
        <nav
          aria-label="Primary"
          className="flex items-center gap-4 text-sm text-[color:var(--muted)] sm:gap-6"
        >
          <Link href="/#steps" className="transition-colors hover:text-[color:var(--ink)]">
            Steps
          </Link>
          <Link href="/#how" className="hidden transition-colors hover:text-[color:var(--ink)] sm:inline">
            How to use
          </Link>
          <Link
            href="/recipe/readme"
            className="rounded-full border border-[color:var(--line)] px-3 py-1.5 font-medium text-[color:var(--ink)] transition-colors hover:border-[color:var(--ember)] hover:text-[color:var(--ember)]"
          >
            Read overview
          </Link>
        </nav>
      </div>
    </header>
  );
}
