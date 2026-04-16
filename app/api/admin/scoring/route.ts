import { revalidateTag } from "next/cache";
import { getAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/require-admin";
import { adminScoringBodySchema, parseBody } from "@/lib/schemas";

const supabase = getAdminClient();

export async function PUT(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const parsed = await parseBody(request, adminScoringBodySchema);
  if ("error" in parsed) return parsed.error;
  const { rules } = parsed.data;

  for (const rule of rules) {
    const { error } = await supabase
      .from("scoring_rules")
      .update({ points: rule.points, is_active: rule.is_active })
      .eq("id", rule.id);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
  }

  revalidateTag("leaderboard", "max");
  return Response.json({ success: true });
}
