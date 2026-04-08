"use client";

import { useState } from "react";
import { getFlagUrl } from "@/lib/fixture-data";
import { Check, MagnifyingGlass } from "@phosphor-icons/react";

interface AdminMatch {
  id: number;
  status: "scheduled" | "finished";
  home_team: { name: string; code: string; flag_url: string };
  away_team: { name: string; code: string; flag_url: string };
  match_date: string;
  group_label: string;
  home_score: number | null;
  away_score: number | null;
}

const MOCK_MATCHES: AdminMatch[] = [
  { id: 1, status: "finished", home_team: { name: "Brasil", code: "BRA", flag_url: getFlagUrl("BRA") }, away_team: { name: "Colombia", code: "COL", flag_url: getFlagUrl("COL") }, match_date: "2026-06-11T18:00:00Z", group_label: "D", home_score: 2, away_score: 0 },
  { id: 2, status: "finished", home_team: { name: "Espana", code: "ESP", flag_url: getFlagUrl("ESP") }, away_team: { name: "Arabia Saudita", code: "KSA", flag_url: getFlagUrl("KSA") }, match_date: "2026-06-11T21:00:00Z", group_label: "H", home_score: 3, away_score: 1 },
  { id: 3, status: "scheduled", home_team: { name: "Estados Unidos", code: "USA", flag_url: getFlagUrl("USA") }, away_team: { name: "Marruecos", code: "MAR", flag_url: getFlagUrl("MAR") }, match_date: "2026-06-12T18:00:00Z", group_label: "A", home_score: null, away_score: null },
  { id: 4, status: "scheduled", home_team: { name: "Argentina", code: "ARG", flag_url: getFlagUrl("ARG") }, away_team: { name: "Peru", code: "PER", flag_url: getFlagUrl("PER") }, match_date: "2026-06-12T21:00:00Z", group_label: "B", home_score: null, away_score: null },
  { id: 5, status: "scheduled", home_team: { name: "Alemania", code: "GER", flag_url: getFlagUrl("GER") }, away_team: { name: "Uruguay", code: "URU", flag_url: getFlagUrl("URU") }, match_date: "2026-06-13T18:00:00Z", group_label: "F", home_score: null, away_score: null },
  { id: 6, status: "scheduled", home_team: { name: "Francia", code: "FRA", flag_url: getFlagUrl("FRA") }, away_team: { name: "Iran", code: "IRN", flag_url: getFlagUrl("IRN") }, match_date: "2026-06-14T21:00:00Z", group_label: "G", home_score: null, away_score: null },
];

export default function AdminMatchesPage() {
  const [results, setResults] = useState<Record<number, { home: string; away: string }>>({});
  const [saved, setSaved] = useState<Record<number, boolean>>({});
  const [filter, setFilter] = useState<"all" | "pending" | "finished">("all");
  const [search, setSearch] = useState("");

  const filtered = MOCK_MATCHES.filter((m) => {
    if (filter === "pending" && m.status !== "scheduled") return false;
    if (filter === "finished" && m.status !== "finished") return false;
    if (search) {
      const q = search.toLowerCase();
      return m.home_team.name.toLowerCase().includes(q) || m.away_team.name.toLowerCase().includes(q);
    }
    return true;
  });

  function handleSave(matchId: number) {
    const r = results[matchId];
    if (!r || !r.home || !r.away) return;
    setSaved((prev) => ({ ...prev, [matchId]: true }));
    setTimeout(() => setSaved((prev) => ({ ...prev, [matchId]: false })), 2000);
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
                filter === f ? "bg-teal border-teal text-bg" : "border-border text-text-secondary hover:border-text-muted"
              }`}
            >
              {f === "all" ? "Todos" : f === "pending" ? "Pendientes" : "Jugados"}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <MagnifyingGlass size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
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
                Grupo {match.group_label} — {new Date(match.match_date).toLocaleDateString("es-AR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </span>
              {match.status === "finished" && (
                <span className="text-[10px] font-semibold text-success">Finalizado</span>
              )}
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 flex-1 min-w-[120px]">
                <img src={match.home_team.flag_url} alt="" className="w-6 h-4 object-cover rounded-sm" />
                <span className="text-sm font-medium">{match.home_team.name}</span>
              </div>

              <div className="flex items-center gap-2">
                {match.status === "finished" ? (
                  <div className="flex items-center gap-2">
                    <span className="font-sora font-bold text-xl text-text-primary">{match.home_score}</span>
                    <span className="text-text-muted">-</span>
                    <span className="font-sora font-bold text-xl text-text-primary">{match.away_score}</span>
                  </div>
                ) : (
                  <>
                    <input
                      type="number" min={0} max={20}
                      value={results[match.id]?.home ?? ""}
                      onChange={(e) => setResults((p) => ({ ...p, [match.id]: { ...p[match.id], home: e.target.value, away: p[match.id]?.away ?? "" } }))}
                      className="w-12 h-10 text-center font-sora font-bold bg-bg border border-border rounded focus:border-teal focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="-"
                    />
                    <span className="text-text-muted">-</span>
                    <input
                      type="number" min={0} max={20}
                      value={results[match.id]?.away ?? ""}
                      onChange={(e) => setResults((p) => ({ ...p, [match.id]: { home: p[match.id]?.home ?? "", away: e.target.value } }))}
                      className="w-12 h-10 text-center font-sora font-bold bg-bg border border-border rounded focus:border-teal focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="-"
                    />
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 flex-1 min-w-[120px] justify-end">
                <span className="text-sm font-medium text-right">{match.away_team.name}</span>
                <img src={match.away_team.flag_url} alt="" className="w-6 h-4 object-cover rounded-sm" />
              </div>

              {match.status !== "finished" && (
                <button
                  onClick={() => handleSave(match.id)}
                  disabled={!results[match.id]?.home || !results[match.id]?.away}
                  className={`px-4 py-2 text-xs font-semibold rounded transition-all ${
                    saved[match.id]
                      ? "bg-success text-bg"
                      : "bg-teal text-bg hover:bg-teal-dim disabled:opacity-30 disabled:cursor-not-allowed"
                  }`}
                >
                  {saved[match.id] ? (
                    <span className="flex items-center gap-1"><Check size={14} weight="bold" /> Guardado</span>
                  ) : "Guardar"}
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
