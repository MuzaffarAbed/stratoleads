import type { Metadata } from "next";
import { Manrope } from "next/font/google";

import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "STRATO IT - LEADS",
    template: "%s — STRATO IT - LEADS",
  },
  description: "Request information about STRATO solutions and save a STRATO digital business card.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} h-full antialiased`}>
      <body className="min-h-dvh bg-page font-sans text-text">
        <div className="relative flex min-h-dvh flex-col">{children}</div>
      </body>
    </html>
  );
}
