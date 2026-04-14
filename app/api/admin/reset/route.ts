import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/require-admin";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  // Delete in order (foreign keys)
  await supabase.from("scores").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("predictions").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  // Reset all matches to scheduled
  await supabase.from("matches").update({ status: "scheduled", home_score: null, away_score: null }).neq("id", 0);

  // Clear champion
  await supabase.from("app_config").delete().eq("key", "champion");

  // Clear reminder log
  await supabase.from("app_config").delete().eq("key", "last_reminder_sent");

  return NextResponse.json({ success: true });
}
