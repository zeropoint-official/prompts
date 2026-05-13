import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { marked } from "marked";

export type Recipe = {
  slug: string;
  step: number | null;
  filename: string;
  title: string;
  blurb: string;
  body: string;
  kind: "overview" | "manual" | "prompt" | "template";
};

const RECIPE_DIR = path.join(process.cwd(), "build-recipe");

// Short, plain-English summaries shown on cards. Written for the audience
// that has never opened a terminal — describe the outcome, not the implementation.
const BLURBS: Record<string, { blurb: string; kind: Recipe["kind"] }> = {
  README: {
    blurb:
      "Start here. The map of the whole build — what you're shipping, which layer depends on which, and when not to use the recipe.",
    kind: "overview",
  },
  "00-business-brief-template": {
    blurb:
      "Fill in your brand, voice, accent color, and content once. Every later prompt reads from this one brief.",
    kind: "template",
  },
  "01-scroll-video-workflow": {
    blurb:
      "The only step you do by hand: generate the hero film in Kling / Sora, then hand the MP4 to Claude to bake into scroll frames.",
    kind: "manual",
  },
  "02-stack-and-foundation": {
    blurb:
      "Claude scaffolds the Next.js 16 project, installs Tailwind v4, fonts, Lenis smooth-scroll, and the layout shell.",
    kind: "prompt",
  },
  "03-design-language": {
    blurb:
      "The editorial CSS system: warm-ink background, gold accent, corner-bracket frames, eyebrow labels, reveal animations.",
    kind: "prompt",
  },
  "04-scroll-video-hero": {
    blurb:
      "The canvas-based <ScrollVideo> — pre-decoded WebP frames, scrubbed by scroll, with responsive tiers and overlay UI.",
    kind: "prompt",
  },
  "05-pinned-overture": {
    blurb:
      "Pinned aperture reveal: one signature image opens from a slit to full-bleed while big display words drift behind it.",
    kind: "prompt",
  },
  "06-portfolio-stack": {
    blurb:
      "Items (homes / services / cases / dishes) stack one over the other on scroll. Pinned timeline on desktop, plain list on mobile.",
    kind: "prompt",
  },
  "07-reveal-and-secondary": {
    blurb:
      "Supporting parts: <Reveal>, navbar, footer, marquee, the correspondence contact section, carousel.",
    kind: "prompt",
  },
  "08-detail-pages": {
    blurb:
      "Per-item dossier page, the index page, about, contact — everything that hangs off the home.",
    kind: "prompt",
  },
  "09-dashboard-and-crm": {
    blurb:
      "The admin side: Clerk auth, Turso database, lead CRM with statuses and notes, first-party analytics.",
    kind: "prompt",
  },
  "10-email-resend": {
    blurb:
      "Resend wiring: an admin notification email when a form is submitted, plus a customer auto-reply.",
    kind: "prompt",
  },
};

function parseTitle(body: string, fallback: string): string {
  const match = body.match(/^#\s+(.+?)\s*$/m);
  return match ? match[1].trim() : fallback;
}

function deriveStep(filename: string): number | null {
  const m = filename.match(/^(\d{2})-/);
  return m ? Number.parseInt(m[1], 10) : null;
}

function deriveSlug(filename: string): string {
  return filename.replace(/\.md$/, "").toLowerCase();
}

function loadAll(): Recipe[] {
  const files = readdirSync(RECIPE_DIR).filter((f) => f.endsWith(".md"));

  const recipes: Recipe[] = files.map((filename) => {
    const body = readFileSync(path.join(RECIPE_DIR, filename), "utf8");
    const base = filename.replace(/\.md$/, "");
    const meta = BLURBS[base] ?? { blurb: "", kind: "prompt" as const };
    return {
      slug: deriveSlug(filename),
      step: deriveStep(filename),
      filename,
      title: parseTitle(body, base),
      blurb: meta.blurb,
      body,
      kind: meta.kind,
    };
  });

  // README first, then numeric step order.
  recipes.sort((a, b) => {
    if (a.filename === "README.md") return -1;
    if (b.filename === "README.md") return 1;
    const as = a.step ?? Number.MAX_SAFE_INTEGER;
    const bs = b.step ?? Number.MAX_SAFE_INTEGER;
    return as - bs;
  });

  return recipes;
}

// Cache for the duration of the server process. Markdown files are read at
// build/dev startup; no need to hit the FS every request.
let cache: Recipe[] | null = null;

export function getRecipes(): Recipe[] {
  if (!cache) cache = loadAll();
  return cache;
}

export function getRecipe(slug: string): Recipe | undefined {
  return getRecipes().find((r) => r.slug === slug);
}

export function getAdjacent(slug: string): { prev?: Recipe; next?: Recipe } {
  const all = getRecipes();
  const i = all.findIndex((r) => r.slug === slug);
  if (i === -1) return {};
  return { prev: all[i - 1], next: all[i + 1] };
}

marked.setOptions({ gfm: true, breaks: false });

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

export function renderMarkdown(body: string): string {
  // The page header renders the H1, so strip it from the body.
  const stripped = body.replace(/^#\s+.+\n+/, "");
  const html = marked.parse(stripped) as string;
  // Inject ids into h2/h3 so the in-page TOC + anchor links resolve.
  return html.replace(/<(h[23])>([\s\S]*?)<\/\1>/g, (_, tag, inner) => {
    return `<${tag} id="${slugify(inner)}">${inner}</${tag}>`;
  });
}

// Pulls every section heading (## level) so we can build a table of contents.
export function extractHeadings(body: string): { id: string; text: string }[] {
  const out: { id: string; text: string }[] = [];
  const lines = body.split("\n");
  let inCode = false;
  for (const line of lines) {
    if (line.startsWith("```")) {
      inCode = !inCode;
      continue;
    }
    if (inCode) continue;
    const m = line.match(/^##\s+(.+?)\s*$/);
    if (m) {
      const text = m[1].trim();
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
      out.push({ id, text });
    }
  }
  return out;
}
