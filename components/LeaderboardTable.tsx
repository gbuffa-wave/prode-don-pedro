"use client";

import { Trophy } from "@phosphor-icons/react";
import type { LeaderboardEntry } from "@/lib/types";

interface Props {
  entries: LeaderboardEntry[];
  currentUserId?: string;
}

export default function LeaderboardTable({ entries, currentUserId }: Props) {
  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      <div className="grid grid-cols-[3rem_1fr_4rem_4rem_4rem] gap-2 px-4 py-3 bg-surface-raised text-xs text-text-muted font-semibold uppercase tracking-wider">
        <span>#</span>
        <span>Jugador</span>
        <span className="text-center">Pts</span>
        <span className="text-center hidden sm:block">Exacto</span>
        <span className="text-center hidden sm:block">Ganador</span>
      </div>

      {entries.map((entry) => {
        const isMe = entry.user_id === currentUserId;
        const isTop3 = entry.rank <= 3;
        const medalColor = entry.rank === 1 ? "text-gold" : entry.rank === 2 ? "text-mercedes-silver" : entry.rank === 3 ? "text-orange-400" : "";

        return (
          <div
            key={entry.user_id}
            className={`grid grid-cols-[3rem_1fr_4rem_4rem_4rem] gap-2 px-4 py-3 border-t border-border items-center transition-colors ${
              isMe ? "bg-teal/5 border-l-2 border-l-teal" : "hover:bg-surface-raised"
            }`}
          >
            <span className={`font-sora font-bold text-sm ${medalColor || "text-text-secondary"}`}>
              {isTop3 ? <Trophy size={16} weight="fill" className="inline" /> : null}
              {" "}{entry.rank}
            </span>
            <span className={`font-grotesk text-sm truncate ${isMe ? "text-teal font-semibold" : "text-text-primary"}`}>
              {entry.display_name || `Jugador ${entry.user_id.slice(0, 6)}`}
              {isMe && <span className="text-xs text-teal ml-1">(vos)</span>}
            </span>
            <span className="font-sora font-bold text-sm text-center text-text-primary">
              {entry.total_points}
            </span>
            <span className="text-xs text-center text-text-muted hidden sm:block">{entry.correct_exact}</span>
            <span className="text-xs text-center text-text-muted hidden sm:block">{entry.correct_winner}</span>
          </div>
        );
      })}
    </div>
  );
}
