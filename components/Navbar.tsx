"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Trophy, SoccerBall, Medal, SignOut, Crown } from "@phosphor-icons/react";
import UserAvatar from "@/components/UserAvatar";

const NAV_ITEMS = [
  { href: "/fixture", label: "Fixture", icon: SoccerBall },
  { href: "/leaderboard", label: "Ranking", icon: Trophy },
  { href: "/winners", label: "Ganadores", icon: Crown },
  { href: "/prizes", label: "Premios", icon: Medal },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string | null; avatar: string | null }>({ name: null, avatar: null });

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({
          name: data.user.user_metadata?.full_name || null,
          avatar: data.user.user_metadata?.avatar_url || null,
        });
      }
    });
  }, []);

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
              src="/logo-wave.png"
              alt="Wave Brands"
              width={60}
              height={17}
              className="h-3.5 w-auto object-contain"
            />
            <div className="h-5 w-px bg-border" />
            <span className="font-sora font-bold text-lg tracking-tight">
              <span className="text-text-primary">Prode</span>
              <span className="text-teal ml-1">2026</span>
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
            {user.avatar && <UserAvatar src={user.avatar} name={user.name} size={28} />}
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

      {/* Mobile: top header with logo */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-bg/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-center gap-3 h-12">
          <Image
            src="/logo-wave.png"
            alt="Wave Brands"
            width={45}
            height={13}
            className="h-2.5 w-auto object-contain"
          />
          <div className="h-4 w-px bg-border" />
          <span className="font-sora font-bold text-sm tracking-tight">
            <span className="text-text-primary">Prode</span>
            <span className="text-teal ml-1">2026</span>
          </span>
        </div>
      </header>

      {/* Mobile: bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-bg/95 backdrop-blur-md border-t border-border safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg transition-colors ${
                  active
                    ? "text-teal"
                    : "text-text-muted"
                }`}
              >
                <Icon size={22} weight={active ? "fill" : "regular"} />
                <span className="text-[10px] font-semibold">{label}</span>
              </Link>
            );
          })}
          <button
            onClick={handleSignOut}
            className="flex flex-col items-center gap-0.5 px-4 py-1.5 text-text-muted"
            title="Cerrar sesion"
          >
            {user.avatar ? (
              <UserAvatar src={user.avatar} name={user.name} size={22} />
            ) : (
              <SignOut size={22} />
            )}
            <span className="text-[10px] font-semibold">Salir</span>
          </button>
        </div>
      </nav>
    </>
  );
}
