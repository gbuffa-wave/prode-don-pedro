import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PUT(request: Request) {
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
