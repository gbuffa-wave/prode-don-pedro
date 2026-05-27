import type { Metadata } from "next";
import { Raleway, Montserrat } from "next/font/google";
import "./globals.css";
import NavbarWrapper from "@/components/NavbarWrapper";
import PageTransition from "@/components/PageTransition";
import ToastProvider from "@/components/Toast";
import { brand } from "@/lib/brand";

// Raleway → titulares (reemplaza Sora)
const raleway = Raleway({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-sora-next",
  display: "swap",
});

// Montserrat → cuerpo y UI (reemplaza Space Grotesk)
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-grotesk-next",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${brand.tournamentName} | ${brand.clientName}`,
  description: brand.description,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${raleway.variable} ${montserrat.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0D1510" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#0D1510" media="(prefers-color-scheme: light)" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="background-color" content="#0D1510" />
      </head>
      {/* pt-[84px]: mobile navbar = h-11(44px) + h-10(40px) = 84px. md:pt-14: desktop navbar = h-14(56px) */}
      <body className="font-grotesk antialiased min-h-dvh bg-bg text-text-primary">
        <ToastProvider>
          <NavbarWrapper />
          {/* pt-[84px]: mobile navbar = h-11(44px) + h-10(40px). md:pt-14: desktop h-14(56px) */}
          <div className="pt-[84px] md:pt-14">
            <PageTransition>{children}</PageTransition>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
