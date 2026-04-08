"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, SoccerBall, Medal, SignOut } from "@phosphor-icons/react";

const NAV_ITEMS = [
  { href: "/fixture", label: "Fixture", icon: SoccerBall },
  { href: "/leaderboard", label: "Ranking", icon: Trophy },
  { href: "/prizes", label: "Premios", icon: Medal },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-bg/95 backdrop-blur-md border-b border-border">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/fixture" className="font-sora font-bold text-lg tracking-tight">
          <span className="text-text-primary">Prode</span>
          <span className="text-teal ml-1">2026</span>
        </Link>

        <div className="flex items-center gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  active
                    ? "bg-teal/10 text-teal"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <Icon size={16} weight={active ? "fill" : "regular"} />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
          <button
            className="ml-2 p-2 text-text-muted hover:text-danger transition-colors"
            title="Cerrar sesion"
          >
            <SignOut size={16} />
          </button>
        </div>
      </div>
    </nav>
  );
}
