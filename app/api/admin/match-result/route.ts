import { getAdminClient } from "@/lib/supabase/admin";
import { calculateMatchScores } from "@/lib/scoring";
import { requireAdmin } from "@/lib/require-admin";
import { matchResultBodySchema, parseBody } from "@/lib/schemas";

const supabase = getAdminClient();

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const parsed = await parseBody(request, matchResultBodySchema);
  if ("error" in parsed) return parsed.error;
  const { matchId, homeScore, awayScore } = parsed.data;

  const { error } = await supabase
    .from("matches")
    .update({
      home_score: homeScore,
      away_score: awayScore,
      status: "finished",
    })
    .eq("id", matchId);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Auto-calculate scores for all predictions on this match
  await calculateMatchScores(matchId);

  return Response.json({ success: true });
}
