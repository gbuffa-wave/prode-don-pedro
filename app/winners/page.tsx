"use client";

import { useState } from "react";
import { Trophy, Crown, CalendarBlank, Calendar } from "@phosphor-icons/react";
import UserAvatar from "@/components/UserAvatar";

type ViewMode = "diario" | "semanal";

interface DailyWinner {
  date: string;
  dateLabel: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  points: number;
  correct_exact: number;
  matches_count: number;
}

interface WeeklyWinner {
  week: number;
  weekLabel: string;
  dateRange: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  points: number;
  correct_exact: number;
  matches_count: number;
}

// Mock daily winners
const MOCK_DAILY: DailyWinner[] = [
  { date: "2026-06-11", dateLabel: "Mie 11 Jun", user_id: "user-003", display_name: "Jugador 3", avatar_url: null, points: 23, correct_exact: 2, matches_count: 3 },
  { date: "2026-06-12", dateLabel: "Jue 12 Jun", user_id: "user-012", display_name: "Jugador 12", avatar_url: null, points: 20, correct_exact: 1, matches_count: 4 },
  { date: "2026-06-13", dateLabel: "Vie 13 Jun", user_id: "user-007", display_name: "Jugador 7", avatar_url: null, points: 26, correct_exact: 2, matches_count: 3 },
  { date: "2026-06-14", dateLabel: "Sab 14 Jun", user_id: "user-001", display_name: "Jugador 1", avatar_url: null, points: 30, correct_exact: 3, matches_count: 4 },
  { date: "2026-06-15", dateLabel: "Dom 15 Jun", user_id: "user-019", display_name: "Jugador 19", avatar_url: null, points: 18, correct_exact: 1, matches_count: 3 },
  { date: "2026-06-16", dateLabel: "Lun 16 Jun", user_id: "user-003", display_name: "Jugador 3", avatar_url: null, points: 25, correct_exact: 2, matches_count: 4 },
  { date: "2026-06-17", dateLabel: "Mar 17 Jun", user_id: "user-008", display_name: "Jugador 8", avatar_url: null, points: 21, correct_exact: 1, matches_count: 3 },
];

// Mock weekly winners
const MOCK_WEEKLY: WeeklyWinner[] = [
  { week: 1, weekLabel: "Semana 1", dateRange: "11 - 17 Jun", user_id: "user-003", display_name: "Jugador 3", avatar_url: null, points: 85, correct_exact: 6, matches_count: 16 },
  { week: 2, weekLabel: "Semana 2", dateRange: "18 - 24 Jun", user_id: "user-012", display_name: "Jugador 12", avatar_url: null, points: 78, correct_exact: 5, matches_count: 16 },
  { week: 3, weekLabel: "Semana 3", dateRange: "25 Jun - 1 Jul", user_id: "user-001", display_name: "Jugador 1", avatar_url: null, points: 92, correct_exact: 8, matches_count: 16 },
];

function WinnerCard({ rank, name, avatarUrl, points, exactCount, matchesCount, period, isHighlighted }: {
  rank: number;
  name: string;
  avatarUrl?: string | null;
  points: number;
  exactCount: number;
  matchesCount: number;
  period: string;
  isHighlighted?: boolean;
}) {
  const colors = {
    1: { border: "border-gold", text: "text-gold", bg: "bg-gold/5" },
    2: { border: "border-mercedes-silver", text: "text-mercedes-silver", bg: "bg-mercedes-silver/5" },
    3: { border: "border-orange-400", text: "text-orange-400", bg: "bg-orange-400/5" },
  }[rank] || { border: "border-border", text: "text-text-muted", bg: "" };

  return (
    <div className={`bg-surface border ${colors.border} rounded-lg p-4 ${colors.bg} ${isHighlighted ? "ring-1 ring-teal/30" : ""}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">{period}</p>
          <div className="flex items-center gap-2">
            <UserAvatar src={avatarUrl || null} name={name} size={24} />
            {rank === 1 && <Crown size={18} weight="fill" className={colors.text} />}
            {rank > 1 && <Trophy size={16} weight="fill" className={colors.text} />}
            <span className="font-sora font-bold text-sm text-text-primary">{name}</span>
          </div>
        </div>
        <div className="text-right">
          <p className={`font-sora font-extrabold text-xl ${colors.text}`}>{points}</p>
          <p className="text-[10px] text-text-muted">pts</p>
        </div>
      </div>
      <div className="flex gap-4 text-[10px] text-text-muted">
        <span>{exactCount} exacto{exactCount !== 1 ? "s" : ""}</span>
        <span>{matchesCount} partido{matchesCount !== 1 ? "s" : ""}</span>
      </div>
    </div>
  );
}

export default function WinnersPage() {
  const [view, setView] = useState<ViewMode>("diario");

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="font-sora font-bold text-2xl mb-1">Ganadores</h1>
        <p className="text-text-secondary text-sm">Los mejores de cada jornada y cada semana.</p>
      </div>

      {/* View tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setView("diario")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
            view === "diario"
              ? "bg-teal border-teal text-bg"
              : "border-border text-text-secondary hover:border-text-muted hover:text-text-primary"
          }`}
        >
          <CalendarBlank size={14} />
          Por fecha
        </button>
        <button
          onClick={() => setView("semanal")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
            view === "semanal"
              ? "bg-teal border-teal text-bg"
              : "border-border text-text-secondary hover:border-text-muted hover:text-text-primary"
          }`}
        >
          <Calendar size={14} />
          Por semana
        </button>
      </div>

      {/* Daily winners */}
      {view === "diario" && (
        <div className="space-y-3">
          {MOCK_DAILY.map((w) => (
            <WinnerCard
              key={w.date}
              rank={1}
              name={w.display_name}
              avatarUrl={w.avatar_url}
              points={w.points}
              exactCount={w.correct_exact}
              matchesCount={w.matches_count}
              period={w.dateLabel}
            />
          ))}
        </div>
      )}

      {/* Weekly winners */}
      {view === "semanal" && (
        <div className="space-y-4">
          {MOCK_WEEKLY.map((w) => (
            <div key={w.week}>
              <WinnerCard
                rank={1}
                name={w.display_name}
                avatarUrl={w.avatar_url}
                points={w.points}
                exactCount={w.correct_exact}
                matchesCount={w.matches_count}
                period={`${w.weekLabel} — ${w.dateRange}`}
                isHighlighted
              />
            </div>
          ))}
        </div>
      )}

      {MOCK_DAILY.length === 0 && MOCK_WEEKLY.length === 0 && (
        <div className="text-center py-12">
          <Trophy size={48} className="text-text-muted mx-auto mb-3" />
          <p className="text-text-muted text-sm">Todavia no hay ganadores. Comienzan con el primer partido.</p>
        </div>
      )}
    </div>
  );
}
