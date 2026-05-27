"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { brand } from "@/lib/brand";
import { SoccerBall, Gear, Trophy, ChartBar, ArrowLeft, Crown, Users, EnvelopeSimple, ArrowCounterClockwise, ShieldStar } from "@phosphor-icons/react";

const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", icon: ChartBar },
  { href: "/admin/users", label: "Usuarios", icon: Users },
  { href: "/admin/teams", label: "Equipos", icon: ShieldStar },
  { href: "/admin/matches", label: "Partidos", icon: SoccerBall },
  { href: "/admin/scoring", label: "Puntaje", icon: Gear },
  { href: "/admin/prizes", label: "Premios", icon: Trophy },
  { href: "/admin/winners", label: "Ganadores", icon: Crown },
  { href: "/admin/reports", label: "Reportes", icon: ChartBar },
  { href: "/admin/notifications", label: "Emails", icon: EnvelopeSimple },
  { href: "/admin/reset", label: "Reiniciar", icon: ArrowCounterClockwise },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Image
            src={brand.logoSrc}
            alt={brand.logoAlt}
            width={50}
            height={14}
            className="h-3 w-auto object-contain"
          />
          <div className="h-5 w-px bg-border" />
          <h1 className="font-sora font-bold text-xl">
            Panel <span className="text-teal">Admin</span>
          </h1>
        </div>
        <Link href="/fixture" className="flex items-center gap-1 text-xs text-text-muted hover:text-text-primary transition-colors">
          <ArrowLeft size={12} />
          Volver al Prode
        </Link>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {ADMIN_NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 px-3 py-2 rounded text-sm font-medium whitespace-nowrap transition-colors ${
                active ? "bg-teal/10 text-teal" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <Icon size={16} weight={active ? "fill" : "regular"} />
              {label}
            </Link>
          );
        })}
      </div>

      {children}
    </div>
  );
}
