import type { Metadata } from "next";
import "./globals.css";

// Loaded via <link> (not next/font) so the build never depends on reaching
// fonts.googleapis.com at build time — only the end user's browser needs it,
// same as any normal website. See README "Fonts" note.

export const metadata: Metadata = {
  title: "Shamba Voice — Ongea na Shamba Lako",
  description:
    "Rekodi matumizi, mauzo na uzalishaji wa shamba lako kwa kuongea tu kwa Kiswahili.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sw" className="antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
