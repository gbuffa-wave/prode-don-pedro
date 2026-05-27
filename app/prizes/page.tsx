"use client";

import { useEffect, useState } from "react";
import { Crown, Trophy } from "@phosphor-icons/react";
import confetti from "canvas-confetti";
import { createClient } from "@/lib/supabase/client";
import PrizeCard from "@/components/PrizeCard";
import UserAvatar from "@/components/UserAvatar";
import type { Prize } from "@/lib/types";

export default function PrizesPage() {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function fetchPrizes() {
      const { data } = await supabase
        .from("prizes")
        .select("*")
        .order("position");

      setPrizes(data || []);
      setLoading(false);
    }

    fetchPrizes();
  }, []);

  useEffect(() => {
    const colors = ["#FF4122", "#DAFF3E", "#ffffff"];
    confetti({ particleCount: 40, spread: 80, origin: { x: 0.3, y: 0.3 }, colors, shapes: ["star"], scalar: 1.5, ticks: 150 });
    confetti({ particleCount: 40, spread: 80, origin: { x: 0.7, y: 0.3 }, colors, shapes: ["star"], scalar: 1.5, ticks: 150 });
  }, []);

  // Real winners will be populated once the tournament progresses
  const weeklyWinners: { week: string; dateRange: string; name: string; avatar_url: string | null; points: number }[] = [];
  const dailyTop: { date: string; name: string; avatar_url: string | null; points: number }[] = [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Main prizes */}
      <div className="mb-10">
        <div className="mb-6">
          <h1 className="font-sora font-bold text-2xl mb-1">Premios</h1>
          <p className="text-text-secondary text-sm">Conoce que podes ganar.</p>
        </div>
        {loading ? (
          <p className="text-text-muted text-sm text-center py-8">Cargando premios...</p>
        ) : prizes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {prizes.map((prize) => (
              <PrizeCard key={prize.id} prize={prize} />
            ))}
          </div>
        ) : (
          <p className="text-text-muted text-sm text-center py-8">Los premios se anuncian pronto.</p>
        )}
      </div>

      {/* Weekly winners hall of fame */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <Crown size={18} className="text-gold" weight="fill" />
          <h2 className="font-sora font-bold text-lg">Ganadores semanales</h2>
        </div>
        {weeklyWinners.length > 0 ? (
          <div className="space-y-2">
            {weeklyWinners.map((w) => (
              <div key={w.week} className="bg-surface border border-border rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <UserAvatar src={w.avatar_url} name={w.name} size={32} />
                  <div>
                    <p className="font-grotesk font-semibold text-sm text-text-primary">{w.name}</p>
                    <p className="text-[10px] text-text-muted">{w.week} — {w.dateRange}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-sora font-bold text-gold">{w.points}</p>
                  <p className="text-[10px] text-text-muted">pts</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-muted">Todavía no hay ganadores semanales.</p>
        )}
      </div>

      {/* Top daily performances */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Trophy size={18} className="text-teal" weight="fill" />
          <h2 className="font-sora font-bold text-lg">Mejores jornadas</h2>
        </div>
        {dailyTop.length > 0 ? (
          <div className="space-y-2">
            {dailyTop.map((d, i) => (
              <div key={d.date} className="bg-surface border border-border rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`font-sora font-bold text-sm w-6 text-center ${
                    i === 0 ? "text-gold" : i === 1 ? "text-mercedes-silver" : "text-orange-400"
                  }`}>
                    {i + 1}
                  </span>
                  <UserAvatar src={d.avatar_url} name={d.name} size={24} />
                  <div>
                    <p className="font-grotesk font-semibold text-sm text-text-primary">{d.name}</p>
                    <p className="text-[10px] text-text-muted">{d.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-sora font-bold text-teal">{d.points}</p>
                  <p className="text-[10px] text-text-muted">pts</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-muted">Todavía no hay jornadas completadas.</p>
        )}
      </div>
    </div>
  );
}
