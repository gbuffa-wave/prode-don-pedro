import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/require-admin";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { data, error } = await supabase
    .from("app_users")
    .select("id, display_name, avatar_url, role, team, created_at")
    .order("display_name");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ users: data });
}

export async function PUT(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { userId, team, role } = await request.json();

  const update: Record<string, string> = {};
  if (team !== undefined) update.team = team;
  if (role !== undefined) update.role = role;

  const { error } = await supabase
    .from("app_users")
    .update(update)
    .eq("id", userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { userId } = await request.json();

  // Delete user's scores, predictions, then the user
  await supabase.from("scores").delete().eq("user_id", userId);
  await supabase.from("predictions").delete().eq("user_id", userId);
  await supabase.from("app_users").delete().eq("id", userId);

  // Also delete from Supabase Auth
  await supabase.auth.admin.deleteUser(userId);

  return NextResponse.json({ success: true });
}
