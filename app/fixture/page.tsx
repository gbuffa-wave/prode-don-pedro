"use client";

import { useState, useEffect, useMemo } from "react";
import MatchCard from "@/components/MatchCard";
import Countdown from "@/components/Countdown";
import ChampionPicker from "@/components/ChampionPicker";
import ScoringInfo from "@/components/ScoringInfo";
import { Calendar, ListBullets, FunnelSimple, TreeStructure, Trophy } from "@phosphor-icons/react";
import BracketView from "@/components/BracketView";
import { createClient } from "@/lib/supabase/client";
import type { Match, Team } from "@/lib/types";

type MatchWithTeams = Match & {
  home_team: Team;
  away_team: Team;
};

type ViewMode = "today" | "all" | "group" | "bracket";

const GROUPS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(Date.now() + 86400000);
  const yesterday = new Date(Date.now() - 86400000);

  if (d.toDateString() === today.toDateString()) return "Hoy";
  if (d.toDateString() === tomorrow.toDateString()) return "Mañana";
  if (d.toDateString() === yesterday.toDateString()) return "Ayer";

  return d.toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short" });
}

function groupByDate(matches: MatchWithTeams[]) {
  const groups: Record<string, MatchWithTeams[]> = {};
  for (const match of matches) {
    const key = new Date(match.match_date).toDateString();
    if (!groups[key]) groups[key] = [];
    groups[key].push(match);
  }
  return Object.entries(groups).sort(
    ([a], [b]) => new Date(a).getTime() - new Date(b).getTime()
  );
}

export default function FixturePage() {
  const [matches, setMatches] = useState<MatchWithTeams[]>([]);
  const [loading, setLoading] = useState(true);
  const [predictions, setPredictions] = useState<Record<number, { home_score: number; away_score: number }>>({});
  const [view, setView] = useState<ViewMode>("today");
  const [selectedGroup, setSelectedGroup] = useState("A");

  useEffect(() => {
    async function fetchMatches() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("matches")
        .select("*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)")
        .order("match_date");

      if (!error && data) {
        setMatches(data as MatchWithTeams[]);
      }
      setLoading(false);
    }
    fetchMatches();
  }, []);

  function handlePredict(matchId: number, homeScore: number, awayScore: number) {
    setPredictions((prev) => ({ ...prev, [matchId]: { home_score: homeScore, away_score: awayScore } }));
  }

  const filtered = useMemo(() => {
    const today = new Date().toDateString();

    switch (view) {
      case "today":
        return matches.filter(
          (m) => new Date(m.match_date).toDateString() === today
        );
      case "group":
        return matches.filter((m) => m.group_label === selectedGroup);
      case "all":
      default:
        return [...matches].sort(
          (a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime()
        );
    }
  }, [view, selectedGroup, matches]);

  const dateGroups = groupByDate(filtered);
  const todayCount = matches.filter(
    (m) => new Date(m.match_date).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div>
      {/* Hero banner */}
      <div className="relative w-full overflow-hidden bg-surface border-b border-border">
        {/* Background: replaceable image */}
        <div className="absolute inset-0">
          {/* Placeholder gradient — replace with your illustration/design */}
          <div className="w-full h-full bg-gradient-to-br from-teal/10 via-transparent to-teal/5" />
        </div>

        <img src="/hero-banner.png" alt="" className="absolute inset-0 w-full h-full object-cover" />

        {/* Dark overlay for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent" />

        <div className="relative z-10 max-w-2xl mx-auto px-4 pt-8 pb-10 md:pt-12 md:pb-14">
          <p className="font-grotesk font-semibold text-[10px] text-teal tracking-widest uppercase mb-3">
            Mundial 2026
          </p>
          <h1 className="font-sora font-extrabold text-3xl md:text-5xl tracking-tightest leading-none mb-3">
            Prode <span className="text-teal">2026</span>
          </h1>
          <p className="font-grotesk text-sm text-text-secondary max-w-md">
            Pronostica los resultados de cada partido y competi con tus compañeros. ¿Quién sabe más de fútbol?
          </p>

          {/* Countdown */}
          <div className="mt-6">
            <p className="text-[10px] text-text-muted uppercase tracking-wider mb-2">Comienza en</p>
            <Countdown targetDate="2026-06-11T17:00:00Z" />
          </div>
        </div>
      </div>

      {/* Fixture content */}
      <div className="max-w-2xl mx-auto px-4 py-6">

      {/* Champion prediction */}
      <ChampionPicker teams={matches.map(m => m.home_team).filter((t, i, arr) => arr.findIndex(x => x.id === t.id) === i).sort((a, b) => a.name.localeCompare(b.name))} />

      {/* Scoring info */}
      <ScoringInfo />

      {/* View tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setView("today")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
            view === "today"
              ? "bg-teal border-teal text-bg"
              : "border-border text-text-secondary hover:border-text-muted hover:text-text-primary"
          }`}
        >
          <Calendar size={14} />
          Hoy{todayCount > 0 && ` (${todayCount})`}
        </button>
        <button
          onClick={() => setView("all")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
            view === "all"
              ? "bg-teal border-teal text-bg"
              : "border-border text-text-secondary hover:border-text-muted hover:text-text-primary"
          }`}
        >
          <ListBullets size={14} />
          Todos
        </button>
        <button
          onClick={() => setView("group")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
            view === "group"
              ? "bg-teal border-teal text-bg"
              : "border-border text-text-secondary hover:border-text-muted hover:text-text-primary"
          }`}
        >
          <FunnelSimple size={14} />
          Por grupo
        </button>
        <button
          onClick={() => setView("bracket")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
            view === "bracket"
              ? "bg-teal border-teal text-bg"
              : "border-border text-text-secondary hover:border-text-muted hover:text-text-primary"
          }`}
        >
          <TreeStructure size={14} />
          Llaves
        </button>
      </div>

      {/* Group selector */}
      {view === "group" && (
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
          {GROUPS.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGroup(g)}
              className={`w-8 h-8 rounded text-xs font-bold transition-colors flex-shrink-0 ${
                selectedGroup === g
                  ? "bg-teal text-bg"
                  : "bg-surface border border-border text-text-muted hover:text-text-primary"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      )}

      {/* Bracket view */}
      {view === "bracket" && <BracketView />}

      {/* Loading state */}
      {loading && view !== "bracket" && (
        <div className="text-center py-12">
          <p className="text-text-muted text-sm">Cargando partidos...</p>
        </div>
      )}

      {/* Matches grouped by date */}
      {!loading && view !== "bracket" && filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-muted text-sm">
            {view === "today"
              ? "No hay partidos hoy."
              : "No hay partidos en este grupo."}
          </p>
        </div>
      ) : !loading && view !== "bracket" ? (
        <div className="space-y-6">
          {dateGroups.map(([dateKey, dayMatches]) => (
            <div key={dateKey}>
              {/* Date header */}
              <div className="flex items-center gap-3 mb-3">
                <span className="font-grotesk font-semibold text-xs text-teal uppercase tracking-wider">
                  {formatDate(dayMatches[0].match_date)}
                </span>
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-text-muted">
                  {dayMatches.length} partido{dayMatches.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="space-y-3">
                {dayMatches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    prediction={
                      predictions[match.id]
                        ? { id: "", user_id: "", match_id: match.id, ...predictions[match.id], created_at: "", updated_at: "" }
                        : undefined
                    }
                    onPredict={handlePredict}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
      </div>
    </div>
  );
}
