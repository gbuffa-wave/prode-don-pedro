import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import ToastProvider from "@/components/Toast";

export const metadata: Metadata = {
  title: "Prode Mundial 2026 | Mercedes-Benz",
  description: "Pronosticos del Mundial 2026",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0A0A0A" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#0A0A0A" media="(prefers-color-scheme: light)" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="background-color" content="#0A0A0A" />
      </head>
      <body className="font-grotesk antialiased min-h-dvh bg-bg text-text-primary">
        <ToastProvider>
          <Navbar />
          <main className="pt-[84px] md:pt-14 md:pb-0">
            <PageTransition>{children}</PageTransition>
          </main>
        </ToastProvider>
      </body>
    </html>
  );
}
