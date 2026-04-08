"use client";

import { Trophy, Crown } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import type { LeaderboardEntry } from "@/lib/types";

interface Props {
  entries: LeaderboardEntry[];
  currentUserId?: string;
}

const PODIUM_STYLES = {
  1: {
    border: "border-gold",
    bg: "bg-gold/5",
    text: "text-gold",
    size: "h-28",
    order: "order-2",
  },
  2: {
    border: "border-mercedes-silver",
    bg: "bg-mercedes-silver/5",
    text: "text-mercedes-silver",
    size: "h-22",
    order: "order-1",
  },
  3: {
    border: "border-orange-400",
    bg: "bg-orange-400/5",
    text: "text-orange-400",
    size: "h-18",
    order: "order-3",
  },
} as const;

// Stagger delays: 2nd (order-1) rises first, 1st (order-2) second, 3rd (order-3) last
const PODIUM_DELAYS = { 2: 0, 1: 0.3, 3: 0.6 } as const;

function Podium({ top3, currentUserId }: { top3: LeaderboardEntry[]; currentUserId?: string }) {
  // Reorder: 2nd, 1st, 3rd for visual podium
  const ordered = [top3[1], top3[0], top3[2]].filter(Boolean);

  return (
    <div className="flex items-end justify-center gap-3 mb-8 px-4">
      {ordered.map((entry) => {
        const style = PODIUM_STYLES[entry.rank as 1 | 2 | 3];
        const isMe = entry.user_id === currentUserId;
        const isFirst = entry.rank === 1;
        const delay = PODIUM_DELAYS[entry.rank as 1 | 2 | 3];
        const fadeInDelay = delay + 0.4;

        return (
          <div
            key={entry.user_id}
            className={`flex flex-col items-center flex-1 max-w-[140px] ${style.order}`}
          >
            {/* Crown for 1st */}
            {isFirst && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: fadeInDelay + 0.1, duration: 0.3 }}
              >
                <Crown size={24} weight="fill" className="text-gold mb-1" />
              </motion.div>
            )}

            {/* Avatar circle */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: fadeInDelay, duration: 0.35, ease: "backOut" }}
              className={`w-12 h-12 rounded-full border-2 ${style.border} ${style.bg} flex items-center justify-center mb-2`}
            >
              <span className={`font-sora font-bold text-sm ${style.text}`}>
                {(entry.display_name || "?")[0].toUpperCase()}
              </span>
            </motion.div>

            {/* Name */}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: fadeInDelay + 0.1, duration: 0.3 }}
              className={`font-grotesk text-xs font-medium text-center truncate w-full ${isMe ? "text-teal" : "text-text-primary"}`}
            >
              {entry.display_name || `Jugador ${entry.user_id.slice(0, 6)}`}
              {isMe && <span className="text-teal"> (vos)</span>}
            </motion.span>

            {/* Points */}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: fadeInDelay + 0.15, duration: 0.3 }}
              className={`font-sora font-extrabold text-lg ${style.text} mt-1`}
            >
              {entry.total_points}
            </motion.span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: fadeInDelay + 0.15, duration: 0.3 }}
              className="text-[10px] text-text-muted"
            >
              pts
            </motion.span>

            {/* Podium block */}
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{ originY: 1 }}
              className={`w-full ${style.size} ${style.bg} border ${style.border} rounded-t-lg mt-2 flex items-center justify-center`}
            >
              <Trophy size={20} weight="fill" className={style.text} />
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}

export default function LeaderboardTable({ entries, currentUserId }: Props) {
  const top3 = entries.filter((e) => e.rank <= 3);
  const rest = entries.filter((e) => e.rank > 3);

  return (
    <div>
      {/* Podium for top 3 */}
      {top3.length >= 3 && (
        <Podium top3={top3} currentUserId={currentUserId} />
      )}

      {/* Table for the rest */}
      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <div className="grid grid-cols-[3rem_1fr_4rem_4rem_4rem] gap-2 px-4 py-3 bg-surface-raised text-xs text-text-muted font-semibold uppercase tracking-wider">
          <span>#</span>
          <span>Jugador</span>
          <span className="text-center">Pts</span>
          <span className="text-center hidden sm:block">Exacto</span>
          <span className="text-center hidden sm:block">Ganador</span>
        </div>

        {/* Show top 3 in table too if less than 3 total (edge case) */}
        {top3.length < 3 && top3.map((entry) => (
          <TableRow key={entry.user_id} entry={entry} currentUserId={currentUserId} />
        ))}

        {rest.map((entry) => (
          <TableRow key={entry.user_id} entry={entry} currentUserId={currentUserId} />
        ))}
      </div>
    </div>
  );
}

function TableRow({ entry, currentUserId }: { entry: LeaderboardEntry; currentUserId?: string }) {
  const isMe = entry.user_id === currentUserId;

  return (
    <div
      className={`grid grid-cols-[3rem_1fr_4rem_4rem_4rem] gap-2 px-4 py-3 border-t border-border items-center transition-colors ${
        isMe ? "bg-teal/5 border-l-2 border-l-teal" : "hover:bg-surface-raised"
      }`}
    >
      <span className="font-sora font-bold text-sm text-text-secondary">
        {entry.rank}
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
}
