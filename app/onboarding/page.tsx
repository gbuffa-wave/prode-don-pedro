"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Check, FilmSlate, Megaphone, MicrophoneStage, Tree, Moon, Sun, Lighthouse, Compass, Star, SoccerBall } from "@phosphor-icons/react";
import confetti from "canvas-confetti";
import UserAvatar from "@/components/UserAvatar";
import type { IconProps } from "@phosphor-icons/react";

const EQUIPOS: { name: string; icon: React.ComponentType<IconProps> }[] = [
  { name: "Contenidos", icon: FilmSlate },
  { name: "Comunicación", icon: Megaphone },
  { name: "Eventos", icon: MicrophoneStage },
  { name: "Bosque", icon: Tree },
  { name: "Luna", icon: Moon },
  { name: "Sol", icon: Sun },
  { name: "Faro", icon: Lighthouse },
  { name: "Dirección", icon: Compass },
  { name: "Estrella", icon: Star },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string | null; avatar: string | null; email: string | null }>({ name: null, avatar: null, email: null });
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/login");
        return;
      }
      setUser({
        name: data.user.user_metadata?.full_name || null,
        avatar: data.user.user_metadata?.avatar_url || null,
        email: data.user.email || null,
      });
      setLoading(false);
    });
  }, [router]);

  async function handleSave() {
    if (!selectedTeam) return;
    setSaving(true);

    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ team: selectedTeam }),
    });

    if (res.ok) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#0c5cac", "#D4A853", "#22C55E", "#F59E0B", "#ffffff"],
      });
      setTimeout(() => router.push("/fixture"), 800);
    } else {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <p className="text-text-muted text-sm">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Welcome */}
        <div className="text-center">
          <Image
            src="/logo-wave.png"
            alt="Wave Brands"
            width={80}
            height={22}
            className="h-5 w-auto object-contain mx-auto mb-6"
          />
          <div className="flex justify-center mb-4">
            <UserAvatar src={user.avatar} name={user.name} size={64} />
          </div>
          <h1 className="font-sora font-extrabold text-2xl tracking-tightest mb-1">
            ¡Bienvenido, {user.name?.split(" ")[0] || ""}!
          </h1>
          <p className="font-grotesk text-sm text-text-secondary">
            {user.email}
          </p>
        </div>

        {/* Team selection */}
        <div>
          <p className="font-grotesk font-semibold text-xs text-text-muted uppercase tracking-wider mb-3 text-center">
            Elegí tu equipo
          </p>
          <div className="grid grid-cols-3 gap-2">
            {EQUIPOS.map(({ name, icon: Icon }) => (
              <button
                key={name}
                onClick={() => setSelectedTeam(name)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-lg transition-all ${
                  selectedTeam === name
                    ? "bg-teal/15 border-2 border-teal"
                    : "bg-surface border-2 border-transparent hover:border-border"
                }`}
              >
                <Icon
                  size={24}
                  weight={selectedTeam === name ? "fill" : "regular"}
                  className={selectedTeam === name ? "text-teal" : "text-text-muted"}
                />
                <span className={`text-xs font-medium ${selectedTeam === name ? "text-teal" : "text-text-secondary"}`}>
                  {name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Confirm */}
        <button
          onClick={handleSave}
          disabled={!selectedTeam || saving}
          className="w-full font-grotesk font-semibold text-sm px-6 py-3 bg-teal text-bg rounded hover:bg-teal-dim transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {saving ? "Guardando..." : (
            <>
              <Check size={16} weight="bold" />
              Entrar al Prode
            </>
          )}
        </button>
      </div>
    </div>
  );
}
