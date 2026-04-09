"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function NavbarWrapper() {
  const pathname = usePathname();

  // Hide navbar on demo, login, onboarding, and landing pages
  if (pathname.startsWith("/demo") || pathname === "/login" || pathname === "/onboarding" || pathname === "/") {
    return null;
  }

  return (
    <>
      <Navbar />
      {/* Spacer for fixed navbar */}
      <div className="h-[84px] md:h-14" />
    </>
  );
}
