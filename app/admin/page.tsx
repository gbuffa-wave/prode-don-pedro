"use client";

import { useState, useEffect } from "react";
import { SoccerBall, Users, Target, Trophy } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";

interface Stats {
  users: number;
  predictions: number;
  matchesPlayed: number;
  matchesPending: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ users: 0, predictions: 0, matchesPlayed: 0, matchesPending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function fetchStats() {
      const [usersRes, predictionsRes, matchesRes] = await Promise.all([
        supabase.from("app_users").select("id", { count: "exact", head: true }),
        supabase.from("predictions").select("id", { count: "exact", head: true }),
        supabase.from("matches").select("id, status"),
      ]);

      const matches = matchesRes.data || [];
      setStats({
        users: usersRes.count || 0,
        predictions: predictionsRes.count || 0,
        matchesPlayed: matches.filter(m => m.status === "finished").length,
        matchesPending: matches.filter(m => m.status === "scheduled").length,
      });
      setLoading(false);
    }

    fetchStats();
  }, []);

  const cards = [
    { label: "Usuarios registrados", value: stats.users, icon: Users, color: "text-teal" },
    { label: "Pronósticos cargados", value: stats.predictions, icon: Target, color: "text-gold" },
    { label: "Partidos jugados", value: stats.matchesPlayed, icon: SoccerBall, color: "text-success" },
    { label: "Partidos pendientes", value: stats.matchesPending, icon: Trophy, color: "text-warning" },
  ];

  return (
    <div>
      <h2 className="font-sora font-bold text-lg mb-4">Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map((s) => (
          <div key={s.label} className="bg-surface border border-border rounded-lg p-4">
            <s.icon size={20} className={`${s.color} mb-2`} />
            <p className={`font-sora font-bold text-2xl ${s.color}`}>
              {loading ? "—" : s.value}
            </p>
            <p className="text-xs text-text-muted mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
