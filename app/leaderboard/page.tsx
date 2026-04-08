"use client";

import LeaderboardTable from "@/components/LeaderboardTable";
import type { LeaderboardEntry } from "@/lib/types";

const MOCK_LEADERBOARD: LeaderboardEntry[] = Array.from({ length: 20 }, (_, i) => ({
  user_id: `user-${String(i + 1).padStart(3, "0")}`,
  display_name: i === 4 ? null : `Jugador ${i + 1}`,
  total_points: Math.max(0, 150 - i * 7 - Math.floor(Math.random() * 5)),
  rank: i + 1,
  correct_exact: Math.floor(Math.random() * 5),
  correct_winner: Math.floor(Math.random() * 10),
  total_predictions: 12 + Math.floor(Math.random() * 4),
}));

const CURRENT_USER_ID = "user-007";

export default function LeaderboardPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="font-sora font-bold text-2xl mb-1">Ranking</h1>
        <p className="text-text-secondary text-sm">Tabla de posiciones general.</p>
      </div>
      <LeaderboardTable entries={MOCK_LEADERBOARD} currentUserId={CURRENT_USER_ID} />
    </div>
  );
}
