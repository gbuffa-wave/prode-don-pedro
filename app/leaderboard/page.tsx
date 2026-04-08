"use client";

import { useState, useMemo, useEffect } from "react";
import confetti from "canvas-confetti";
import LeaderboardTable from "@/components/LeaderboardTable";
import type { LeaderboardEntry } from "@/lib/types";

const EQUIPOS = ["Todos", "Contenidos", "Comunicación", "Eventos", "Bosque", "Luna", "Sol", "Faro", "Dirección", "Estrella"];

const MOCK_LEADERBOARD: (LeaderboardEntry & { equipo: string })[] = Array.from({ length: 30 }, (_, i) => {
  const equipo = EQUIPOS[1 + (i % (EQUIPOS.length - 1))];
  return {
    user_id: `user-${String(i + 1).padStart(3, "0")}`,
    display_name: i === 4 ? null : `Jugador ${i + 1}`,
    total_points: Math.max(0, 200 - i * 6),
    rank: i + 1,
    correct_exact: Math.max(0, 5 - Math.floor(i / 6)),
    correct_winner: Math.max(0, 10 - Math.floor(i / 3)),
    total_predictions: 16,
    avatar_url: null,
    equipo,
  };
});

const CURRENT_USER_ID = "user-007";

type FilterType = "general" | "equipo";

export default function LeaderboardPage() {
  const [filterType, setFilterType] = useState<FilterType>("general");
  const [selectedEquipo, setSelectedEquipo] = useState("Todos");

  const filtered = useMemo(() => {
    let entries = MOCK_LEADERBOARD;

    if (filterType === "equipo" && selectedEquipo !== "Todos") {
      entries = entries.filter((e) => e.equipo === selectedEquipo);
    }

    return entries.map((e, i) => ({ ...e, rank: i + 1 }));
  }, [filterType, selectedEquipo]);

  useEffect(() => {
    const colors = ["#0c5cac", "#D4A853", "#22C55E", "#F59E0B", "#EF4444", "#ffffff"];
    const defaults = { colors, ticks: 200, gravity: 0.8, scalar: 1.2, drift: 0 };

    // Disparo desde la izquierda
    confetti({ ...defaults, particleCount: 40, angle: 60, spread: 55, origin: { x: 0, y: 0.6 } });
    // Disparo desde la derecha
    confetti({ ...defaults, particleCount: 40, angle: 120, spread: 55, origin: { x: 1, y: 0.6 } });

    // Segundo disparo con delay — estrellas
    const t1 = setTimeout(() => {
      confetti({ ...defaults, particleCount: 25, angle: 60, spread: 70, origin: { x: 0, y: 0.5 }, shapes: ["star"], scalar: 1.5 });
      confetti({ ...defaults, particleCount: 25, angle: 120, spread: 70, origin: { x: 1, y: 0.5 }, shapes: ["star"], scalar: 1.5 });
    }, 300);

    // Tercer disparo — lluvia central
    const t2 = setTimeout(() => {
      confetti({ ...defaults, particleCount: 50, spread: 100, origin: { x: 0.5, y: 0 }, gravity: 1 });
    }, 600);

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="font-sora font-bold text-2xl mb-1">Ranking</h1>
        <p className="text-text-secondary text-sm">Tabla de posiciones general.</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilterType("general")}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
            filterType === "general"
              ? "bg-teal border-teal text-bg"
              : "border-border text-text-secondary hover:border-text-muted hover:text-text-primary"
          }`}
        >
          General
        </button>
        <button
          onClick={() => setFilterType("equipo")}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
            filterType === "equipo"
              ? "bg-teal border-teal text-bg"
              : "border-border text-text-secondary hover:border-text-muted hover:text-text-primary"
          }`}
        >
          Por equipo
        </button>
      </div>

      {/* Equipo selector */}
      {filterType === "equipo" && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {EQUIPOS.map((equipo) => (
            <button
              key={equipo}
              onClick={() => setSelectedEquipo(equipo)}
              className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                selectedEquipo === equipo
                  ? "bg-teal/15 text-teal"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {equipo}
            </button>
          ))}
        </div>
      )}

      {/* Result count */}
      <p className="text-xs text-text-muted mb-3">
        {filtered.length} jugador{filtered.length !== 1 ? "es" : ""}
        {filterType === "equipo" && selectedEquipo !== "Todos" && ` en ${selectedEquipo}`}
      </p>

      <LeaderboardTable entries={filtered} currentUserId={CURRENT_USER_ID} />
    </div>
  );
}
