import { revalidateTag } from "next/cache";
import { getAdminClient } from "@/lib/supabase/admin";

const supabase = getAdminClient();

export async function calculateMatchScores(matchId: number) {
  // Get match result
  const { data: match } = await supabase
    .from("matches")
    .select("id, home_score, away_score, status")
    .eq("id", matchId)
    .single();

  if (
    !match ||
    match.status !== "finished" ||
    match.home_score === null ||
    match.away_score === null
  )
    return;

  // Get active scoring rules
  const { data: rules } = await supabase
    .from("scoring_rules")
    .select("*")
    .eq("is_active", true);

  if (!rules) return;

  const exactPts = rules.find((r) => r.rule_type === "exact")?.points ?? 0;
  const diffPts =
    rules.find((r) => r.rule_type === "winner_and_diff")?.points ?? 0;
  const winnerPts =
    rules.find((r) => r.rule_type === "winner_only")?.points ?? 0;

  // Get all predictions for this match
  const { data: predictions } = await supabase
    .from("predictions")
    .select("*")
    .eq("match_id", matchId);

  if (!predictions || predictions.length === 0) return;

  // Delete old scores for this match
  await supabase.from("scores").delete().eq("match_id", matchId);

  const actualWinner =
    match.home_score > match.away_score
      ? "home"
      : match.home_score < match.away_score
        ? "away"
        : "draw";
  const actualDiff = match.home_score - match.away_score;

  // Calculate score for each prediction
  const newScores = predictions.map((pred) => {
    let points = 0;

    if (
      pred.home_score === match.home_score &&
      pred.away_score === match.away_score
    ) {
      points = exactPts;
    } else {
      const predWinner =
        pred.home_score > pred.away_score
          ? "home"
          : pred.home_score < pred.away_score
            ? "away"
            : "draw";
      if (predWinner === actualWinner) {
        const predDiff = pred.home_score - pred.away_score;
        points = predDiff === actualDiff ? diffPts : winnerPts;
      }
    }

    return {
      user_id: pred.user_id,
      match_id: matchId,
      prediction_id: pred.id,
      points_earned: points,
    };
  });

  if (newScores.length > 0) {
    await supabase.from("scores").insert(newScores);
  }

  revalidateTag("leaderboard", "max");
}
