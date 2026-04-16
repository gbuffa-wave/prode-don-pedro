import { unstable_cache } from "next/cache";
import { getAdminClient } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";
import LeaderboardClient from "@/components/LeaderboardClient";
import type { LeaderboardEntry } from "@/lib/types";

interface UserWithTeam extends LeaderboardEntry {
  equipo: string;
}

type LeaderboardRow = {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  team: string | null;
  total_points: number;
  correct_exact: number;
  correct_winner: number;
  matches_played: number;
  champion_bonus: number;
};

const getCachedLeaderboard = unstable_cache(
  async (): Promise<{ entries: UserWithTeam[]; teams: string[] }> => {
    const admin = getAdminClient();
    const [teamsRes, lbRes] = await Promise.all([
      admin.from("internal_teams").select("name").order("id"),
      admin.rpc("get_leaderboard"),
    ]);

    const rows = (lbRes.data ?? []) as LeaderboardRow[];
    const entries: UserWithTeam[] = rows.map((r, i) => ({
      user_id: r.user_id,
      display_name: r.display_name,
      avatar_url: r.avatar_url,
      team: r.team,
      total_points: r.total_points,
      rank: i + 1,
      correct_exact: r.correct_exact,
      correct_winner: r.correct_winner,
      matches_played: r.matches_played,
      champion_bonus: r.champion_bonus,
      equipo: r.team || "",
    }));

    const teams = (teamsRes.data ?? []).map((t) => t.name);
    return { entries, teams };
  },
  ["leaderboard-v1"],
  { tags: ["leaderboard"], revalidate: 60 }
);

export default async function LeaderboardPage() {
  const { entries, teams } = await getCachedLeaderboard();

  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <LeaderboardClient
      entries={entries}
      internalTeams={teams}
      currentUserId={user?.id}
    />
  );
}
