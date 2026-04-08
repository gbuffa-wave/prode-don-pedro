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
      <body className="font-grotesk antialiased min-h-dvh bg-bg text-text-primary">
        <ToastProvider>
          <Navbar />
          <main className="pt-12 pb-20 md:pt-14 md:pb-0">
            <PageTransition>{children}</PageTransition>
          </main>
        </ToastProvider>
      </body>
    </html>
  );
}
