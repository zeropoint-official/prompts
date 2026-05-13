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
    default: "Prmpts — Curated AI prompts",
    template: "%s · Prmpts",
  },
  description:
    "A small library of practical prompt patterns for writing, code, research, and creative work—ready to copy and adapt.",
  openGraph: {
    title: "Prmpts — Curated AI prompts",
    description:
      "Practical prompt templates you can steer, revise, and make your own—for calmer outputs and clearer intent.",
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
