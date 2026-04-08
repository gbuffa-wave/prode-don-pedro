"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Check, MagnifyingGlass } from "@phosphor-icons/react";

interface Team {
  id: number;
  name: string;
  code: string;
  flag_url: string;
  group_letter: string;
}

interface AdminMatch {
  id: number;
  status: "scheduled" | "in_progress" | "finished";
  home_team: Team;
  away_team: Team;
  match_date: string;
  group_label: string | null;
  home_score: number | null;
  away_score: number | null;
  stage: string;
  venue: string | null;
}

export default function AdminMatchesPage() {
  const [matches, setMatches] = useState<AdminMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Record<number, { home: string; away: string }>>({});
  const [saved, setSaved] = useState<Record<number, boolean>>({});
  const [saving, setSaving] = useState<Record<number, boolean>>({});
  const [filter, setFilter] = useState<"all" | "pending" | "finished">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchMatches() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("matches")
        .select("*,home_team:teams!home_team_id(*),away_team:teams!away_team_id(*)")
        .order("match_date");

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setMatches(data as AdminMatch[]);
      setLoading(false);
    }

    fetchMatches();
  }, []);

  const filtered = matches.filter((m) => {
    if (filter === "pending" && m.status !== "scheduled") return false;
    if (filter === "finished" && m.status !== "finished") return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        m.home_team.name.toLowerCase().includes(q) ||
        m.away_team.name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  async function handleSave(matchId: number) {
    const r = results[matchId];
    if (!r || r.home === "" || r.away === "") return;

    setSaving((prev) => ({ ...prev, [matchId]: true }));

    try {
      const res = await fetch("/api/admin/match-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId,
          homeScore: parseInt(r.home, 10),
          awayScore: parseInt(r.away, 10),
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Error al guardar");
      }

      // Update local state
      setMatches((prev) =>
        prev.map((m) =>
          m.id === matchId
            ? {
                ...m,
                home_score: parseInt(r.home, 10),
                away_score: parseInt(r.away, 10),
                status: "finished" as const,
              }
            : m
        )
      );

      setSaved((prev) => ({ ...prev, [matchId]: true }));
      setTimeout(() => setSaved((prev) => ({ ...prev, [matchId]: false })), 2000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al guardar el resultado");
    } finally {
      setSaving((prev) => ({ ...prev, [matchId]: false }));
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin h-8 w-8 border-2 border-teal border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-red-400">Error al cargar partidos: {error}</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-sora font-bold text-lg mb-4">Cargar Resultados</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex gap-2">
          {(["all", "pending", "finished"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                filter === f
                  ? "bg-teal border-teal text-bg"
                  : "border-border text-text-secondary hover:border-text-muted"
              }`}
            >
              {f === "all" ? "Todos" : f === "pending" ? "Pendientes" : "Jugados"}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <MagnifyingGlass
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar equipo..."
            className="w-full bg-surface border border-border rounded pl-8 pr-3 py-1.5 text-sm focus:border-teal focus:outline-none"
          />
        </div>
      </div>

      {/* Match list */}
      <div className="space-y-3">
        {filtered.map((match) => (
          <div key={match.id} className="bg-surface border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] text-text-muted uppercase tracking-wider">
                {match.group_label ? `Grupo ${match.group_label}` : match.stage} —{" "}
                {new Date(match.match_date).toLocaleDateString("es-AR", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              {match.status === "finished" && (
                <span className="text-[10px] font-semibold text-success">Finalizado</span>
              )}
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 flex-1 min-w-[120px]">
                <img
                  src={match.home_team.flag_url}
                  alt=""
                  className="w-6 h-4 object-cover rounded-sm"
                />
                <span className="text-sm font-medium">{match.home_team.name}</span>
              </div>

              <div className="flex items-center gap-2">
                {match.status === "finished" ? (
                  <div className="flex items-center gap-2">
                    <span className="font-sora font-bold text-xl text-text-primary">
                      {match.home_score}
                    </span>
                    <span className="text-text-muted">-</span>
                    <span className="font-sora font-bold text-xl text-text-primary">
                      {match.away_score}
                    </span>
                  </div>
                ) : (
                  <>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={results[match.id]?.home ?? ""}
                      onChange={(e) =>
                        setResults((p) => ({
                          ...p,
                          [match.id]: {
                            ...p[match.id],
                            home: e.target.value,
                            away: p[match.id]?.away ?? "",
                          },
                        }))
                      }
                      className="w-12 h-10 text-center font-sora font-bold bg-bg border border-border rounded focus:border-teal focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="-"
                    />
                    <span className="text-text-muted">-</span>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={results[match.id]?.away ?? ""}
                      onChange={(e) =>
                        setResults((p) => ({
                          ...p,
                          [match.id]: {
                            home: p[match.id]?.home ?? "",
                            away: e.target.value,
                          },
                        }))
                      }
                      className="w-12 h-10 text-center font-sora font-bold bg-bg border border-border rounded focus:border-teal focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="-"
                    />
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 flex-1 min-w-[120px] justify-end">
                <span className="text-sm font-medium text-right">
                  {match.away_team.name}
                </span>
                <img
                  src={match.away_team.flag_url}
                  alt=""
                  className="w-6 h-4 object-cover rounded-sm"
                />
              </div>

              {match.status !== "finished" && (
                <button
                  onClick={() => handleSave(match.id)}
                  disabled={
                    !results[match.id]?.home ||
                    !results[match.id]?.away ||
                    saving[match.id]
                  }
                  className={`px-4 py-2 text-xs font-semibold rounded transition-all ${
                    saved[match.id]
                      ? "bg-success text-bg"
                      : "bg-teal text-bg hover:bg-teal-dim disabled:opacity-30 disabled:cursor-not-allowed"
                  }`}
                >
                  {saved[match.id] ? (
                    <span className="flex items-center gap-1">
                      <Check size={14} weight="bold" /> Guardado
                    </span>
                  ) : saving[match.id] ? (
                    "Guardando..."
                  ) : (
                    "Guardar"
                  )}
                </button>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-text-muted">No se encontraron partidos.</p>
          </div>
        )}
      </div>
    </div>
  );
}
