"use client";

import { useState, useMemo, useEffect } from "react";
import confetti from "canvas-confetti";
import { createClient } from "@/lib/supabase/client";
import LeaderboardTable from "@/components/LeaderboardTable";
import { Trophy } from "@phosphor-icons/react";
import type { LeaderboardEntry } from "@/lib/types";

interface UserWithTeam extends LeaderboardEntry {
  equipo: string;
}

export default function LeaderboardPage() {
  const [equipos, setEquipos] = useState<string[]>(["Waveteam"]);
  const [selectedEquipo, setSelectedEquipo] = useState("Waveteam");
  const [entries, setEntries] = useState<UserWithTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();

  useEffect(() => {
    const supabase = createClient();

    async function fetchData() {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);

      // Fetch internal teams
      const { data: teamsData } = await supabase.from("internal_teams").select("name").order("id");
      if (teamsData) {
        setEquipos(["Waveteam", ...teamsData.map(t => t.name)]);
      }

      // Fetch all users
      const { data: users } = await supabase
        .from("app_users")
        .select("id, display_name, avatar_url, team");

      // Fetch scores aggregated by user
      const { data: scores } = await supabase
        .from("scores")
        .select("user_id, points_earned");

      // Fetch predictions count by user
      const { data: predictions } = await supabase
        .from("predictions")
        .select("user_id");

      // Aggregate scores by user
      const scoreMap = new Map<string, number>();
      (scores || []).forEach((s) => {
        scoreMap.set(s.user_id, (scoreMap.get(s.user_id) || 0) + s.points_earned);
      });

      // Count predictions by user
      const predictionMap = new Map<string, number>();
      (predictions || []).forEach((p) => {
        predictionMap.set(p.user_id, (predictionMap.get(p.user_id) || 0) + 1);
      });

      // Build leaderboard entries
      const leaderboard: UserWithTeam[] = (users || []).map((u) => ({
        user_id: u.id,
        display_name: u.display_name,
        avatar_url: u.avatar_url,
        total_points: scoreMap.get(u.id) || 0,
        rank: 0,
        correct_exact: 0,
        correct_winner: 0,
        total_predictions: predictionMap.get(u.id) || 0,
        equipo: u.team || "",
      }));

      // Sort by total_points desc then assign ranks
      leaderboard.sort((a, b) => b.total_points - a.total_points);
      leaderboard.forEach((e, i) => {
        e.rank = i + 1;
      });

      setEntries(leaderboard);
      setLoading(false);
    }

    fetchData();
  }, []);

  const filtered = useMemo(() => {
    let list = entries;

    if (selectedEquipo !== "Waveteam") {
      list = list.filter((e) => e.equipo === selectedEquipo);
    }

    return list.map((e, i) => ({ ...e, rank: i + 1 }));
  }, [selectedEquipo, entries]);

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

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-text-muted text-sm">Cargando ranking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="font-sora font-bold text-2xl mb-1">Ranking</h1>
        <p className="text-text-secondary text-sm">Tabla de posiciones general.</p>
      </div>

      {/* Equipo selector */}
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

      {/* Result count */}
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
