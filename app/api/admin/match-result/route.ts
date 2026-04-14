import { createClient } from "@supabase/supabase-js";
import { calculateMatchScores } from "@/lib/scoring";
import { requireAdmin } from "@/lib/require-admin";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { matchId, homeScore, awayScore } = await request.json();

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
