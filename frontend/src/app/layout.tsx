import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";

import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Acme · Catalog",
  description:
    "Acme is a small product catalog with a typed contract from Laravel through Next.js.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-(--paper) text-(--ink)">
        <Script id="theme-init" strategy="beforeInteractive">{`try{document.documentElement.classList.toggle("dark",localStorage.getItem("acme-theme")==="dark")}catch{}`}</Script>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
