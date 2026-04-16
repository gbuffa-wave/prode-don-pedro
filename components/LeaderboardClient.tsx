"use client";

import { useState, useMemo, useEffect } from "react";
import confetti from "canvas-confetti";
import LeaderboardTable from "@/components/LeaderboardTable";
import { Trophy } from "@phosphor-icons/react";
import type { LeaderboardEntry } from "@/lib/types";

interface UserWithTeam extends LeaderboardEntry {
  equipo: string;
}

interface Props {
  entries: UserWithTeam[];
  internalTeams: string[];
  currentUserId?: string;
}

export default function LeaderboardClient({ entries, internalTeams, currentUserId }: Props) {
  const equipos = useMemo(() => ["Waveteam", ...internalTeams], [internalTeams]);
  const [selectedEquipo, setSelectedEquipo] = useState("Waveteam");

  const filtered = useMemo(() => {
    const list = selectedEquipo === "Waveteam"
      ? entries
      : entries.filter((e) => e.equipo === selectedEquipo);
    return list.map((e, i) => ({ ...e, rank: i + 1 }));
  }, [selectedEquipo, entries]);

  useEffect(() => {
    const colors = ["#0c5cac", "#D4A853", "#22C55E", "#F59E0B", "#EF4444", "#ffffff"];
    const defaults = { colors, ticks: 200, gravity: 0.8, scalar: 1.2, drift: 0 };

    confetti({ ...defaults, particleCount: 40, angle: 60, spread: 55, origin: { x: 0, y: 0.6 } });
    confetti({ ...defaults, particleCount: 40, angle: 120, spread: 55, origin: { x: 1, y: 0.6 } });

    const t1 = setTimeout(() => {
      confetti({ ...defaults, particleCount: 25, angle: 60, spread: 70, origin: { x: 0, y: 0.5 }, shapes: ["star"], scalar: 1.5 });
      confetti({ ...defaults, particleCount: 25, angle: 120, spread: 70, origin: { x: 1, y: 0.5 }, shapes: ["star"], scalar: 1.5 });
    }, 300);
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

      <div className="grid grid-cols-5 gap-2 mb-4">
        {equipos.map((equipo) => (
          <button
            key={equipo}
            onClick={() => setSelectedEquipo(equipo)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap transition-colors ${
              selectedEquipo === equipo
                ? "bg-teal border-teal text-bg"
                : "border-border text-text-secondary hover:border-text-muted hover:text-text-primary"
            }`}
          >
            {equipo}
          </button>
        ))}
      </div>

      <p className="text-xs text-text-muted mb-3">
        {filtered.length} jugador{filtered.length !== 1 ? "es" : ""}
        {selectedEquipo !== "Waveteam" && ` en ${selectedEquipo}`}
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <Trophy size={48} className="text-text-muted mx-auto mb-3" />
          <p className="text-text-muted text-sm">
            {selectedEquipo !== "Waveteam"
              ? `No hay jugadores en ${selectedEquipo} todavía.`
              : "Todavía no hay jugadores. El ranking se actualiza con el primer partido."}
          </p>
        </div>
      ) : (
        <LeaderboardTable entries={filtered} currentUserId={currentUserId} />
      )}
    </div>
  );
}
