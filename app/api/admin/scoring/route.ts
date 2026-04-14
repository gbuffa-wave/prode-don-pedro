import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/require-admin";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PUT(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { rules } = await request.json();

  for (const rule of rules) {
    const { error } = await supabase
      .from("scoring_rules")
      .update({ points: rule.points, is_active: rule.is_active })
      .eq("id", rule.id);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
  }

  return Response.json({ success: true });
}
