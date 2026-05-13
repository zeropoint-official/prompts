import type { Metadata } from "next";
import { Bricolage_Grotesque, Newsreader } from "next/font/google";
import "./globals.css";

const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
});

const editorial = Newsreader({
  variable: "--font-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "Build Recipe — Cinematic editorial sites, prompt by prompt",
    template: "%s · Build Recipe",
  },
  description:
    "Eleven self-contained prompts you paste into Claude Code, in order. The result: a Next.js site with a scroll-scrubbed hero film, pinned reveals, stacking portfolio, and an admin dashboard.",
  openGraph: {
    title: "Build Recipe — Cinematic editorial sites, prompt by prompt",
    description:
      "A vibecoder-friendly documentation for building a cinematic editorial Next.js site with Claude Code.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${editorial.variable} h-full scroll-smooth`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
