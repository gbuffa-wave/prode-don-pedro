"use client";

import { useEffect } from "react";
import { Crown, Trophy, CalendarBlank, Calendar } from "@phosphor-icons/react";
import confetti from "canvas-confetti";
import PrizeCard from "@/components/PrizeCard";
import type { Prize } from "@/lib/types";

const MOCK_PRIZES: Prize[] = [
  { id: 1, position: 1, title: "Viaje a ver la final", description: "Viaje all-inclusive para dos personas a ver la final del Mundial 2026.", image_url: null, created_at: "" },
  { id: 2, position: 2, title: "Camiseta oficial firmada", description: "Camiseta de la seleccion argentina con firmas del plantel.", image_url: null, created_at: "" },
  { id: 3, position: 3, title: "Kit Mercedes-Benz", description: "Kit exclusivo de merchandising oficial Mercedes-Benz.", image_url: null, created_at: "" },
];

// Mock: partial winners so far
const WEEKLY_WINNERS = [
  { week: "Semana 1", dateRange: "11 - 17 Jun", name: "Jugador 3", points: 85 },
  { week: "Semana 2", dateRange: "18 - 24 Jun", name: "Jugador 12", points: 78 },
  { week: "Semana 3", dateRange: "25 Jun - 1 Jul", name: "Jugador 1", points: 92 },
];

const DAILY_TOP = [
  { date: "Sab 14 Jun", name: "Jugador 1", points: 30 },
  { date: "Vie 13 Jun", name: "Jugador 7", points: 26 },
  { date: "Lun 16 Jun", name: "Jugador 3", points: 25 },
];

export default function PrizesPage() {
  useEffect(() => {
    const colors = ["#D4A853", "#B8922E", "#FFD700"];
    confetti({ particleCount: 40, spread: 80, origin: { x: 0.3, y: 0.3 }, colors, shapes: ["star"], scalar: 1.5, ticks: 150 });
    confetti({ particleCount: 40, spread: 80, origin: { x: 0.7, y: 0.3 }, colors, shapes: ["star"], scalar: 1.5, ticks: 150 });
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Main prizes */}
      <div className="mb-10">
        <div className="mb-6">
          <h1 className="font-sora font-bold text-2xl mb-1">Premios</h1>
          <p className="text-text-secondary text-sm">Conoce que podes ganar.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {MOCK_PRIZES.map((prize) => (
            <PrizeCard key={prize.id} prize={prize} />
          ))}
        </div>
      </div>

      {/* Weekly winners hall of fame */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <Crown size={18} className="text-gold" weight="fill" />
          <h2 className="font-sora font-bold text-lg">Ganadores semanales</h2>
        </div>
        {WEEKLY_WINNERS.length > 0 ? (
          <div className="space-y-2">
            {WEEKLY_WINNERS.map((w) => (
              <div key={w.week} className="bg-surface border border-border rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center">
                    <Crown size={14} weight="fill" className="text-gold" />
                  </div>
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
          <p className="text-sm text-text-muted">Todavia no hay ganadores semanales.</p>
        )}
      </div>

      {/* Top daily performances */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Trophy size={18} className="text-teal" weight="fill" />
          <h2 className="font-sora font-bold text-lg">Mejores jornadas</h2>
        </div>
        {DAILY_TOP.length > 0 ? (
          <div className="space-y-2">
            {DAILY_TOP.map((d, i) => (
              <div key={d.date} className="bg-surface border border-border rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`font-sora font-bold text-sm w-6 text-center ${
                    i === 0 ? "text-gold" : i === 1 ? "text-mercedes-silver" : "text-orange-400"
                  }`}>
                    {i + 1}
                  </span>
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
          <p className="text-sm text-text-muted">Todavia no hay jornadas completadas.</p>
        )}
      </div>
    </div>
  );
}
