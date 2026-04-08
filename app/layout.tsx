import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Prode Mundial 2026 | Mercedes-Benz",
  description: "Pronosticos del Mundial 2026",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="font-grotesk antialiased min-h-dvh bg-bg text-text-primary">
        <Navbar />
        <main className="pt-14">{children}</main>
      </body>
    </html>
  );
}
