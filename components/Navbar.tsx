"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Trophy, SoccerBall, Medal, SignOut, Crown, GearSix } from "@phosphor-icons/react";
import UserAvatar from "@/components/UserAvatar";
import { brand } from "@/lib/brand";

const NAV_ITEMS = [
  { href: "/fixture", label: "Fixture", icon: SoccerBall },
  { href: "/leaderboard", label: "Ranking", icon: Trophy },
  { href: "/winners", label: "Ganadores", icon: Crown },
  { href: "/prizes", label: "Premios", icon: Medal },
];

type NavUser = { name: string | null; avatar: string | null; isAdmin: boolean };

interface Props {
  user: NavUser | null;
}

export default function Navbar({ user }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname.startsWith("/demo") || pathname === "/login" || pathname === "/onboarding" || pathname === "/") {
    return null;
  }

  const u: NavUser = user ?? { name: null, avatar: null, isAdmin: false };

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <>
      {/* Desktop: top bar */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-bg/95 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/fixture" className="flex items-center gap-3">
            <Image
              src={brand.logoSrc}
              alt={brand.logoAlt}
              width={60}
              height={17}
              className="h-3.5 w-auto object-contain"
            />
            <div className="h-5 w-px bg-border" />
            <span className="font-sora font-bold text-lg tracking-tight">
              <span className="text-text-primary">{brand.title}</span>
              <span className="text-teal ml-1">{brand.year}</span>
            </span>
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
                  <span>{label}</span>
                </Link>
              );
            })}
            {u.isAdmin && (
              <Link
                href="/admin"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  pathname.startsWith("/admin") ? "bg-gold/10 text-gold" : "text-text-muted hover:text-gold"
                }`}
              >
                <GearSix size={16} weight={pathname.startsWith("/admin") ? "fill" : "regular"} />
                <span>Admin</span>
              </Link>
            )}
            {u.avatar && <UserAvatar src={u.avatar} name={u.name} size={28} />}
            <button
              onClick={handleSignOut}
              className="ml-2 p-2 text-text-muted hover:text-danger transition-colors"
              title="Cerrar sesion"
            >
              <SignOut size={16} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile: top header with logo + nav */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-50 bg-bg/95 backdrop-blur-md border-b border-border">
        {/* Logo row */}
        <div className="flex items-center justify-between px-4 h-11">
          <Link href="/fixture" className="flex items-center gap-2">
            <Image
              src={brand.logoSrc}
              alt={brand.logoAlt}
              width={45}
              height={13}
              className="h-2.5 w-auto object-contain"
            />
            <div className="h-3 w-px bg-border" />
            <span className="font-sora font-bold text-xs tracking-tight">
              <span className="text-text-primary">{brand.title}</span>
              <span className="text-teal ml-1">{brand.year}</span>
            </span>
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-text-muted"
          >
            {u.avatar ? (
              <UserAvatar src={u.avatar} name={u.name} size={22} />
            ) : (
              <SignOut size={16} />
            )}
          </button>
        </div>
        {/* Nav tabs */}
        <div className="flex items-center justify-around h-10 border-t border-border/50">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                  active ? "text-teal" : "text-text-muted"
                }`}
              >
                <Icon size={16} weight={active ? "fill" : "regular"} />
                <span className="text-[10px] font-semibold">{label}</span>
              </Link>
            );
          })}
          {u.isAdmin && (
            <Link
              href="/admin"
              className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                pathname.startsWith("/admin") ? "text-gold" : "text-text-muted"
              }`}
            >
              <GearSix size={16} weight={pathname.startsWith("/admin") ? "fill" : "regular"} />
              <span className="text-[10px] font-semibold">Admin</span>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}
