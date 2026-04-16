import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/require-admin";
import {
  adminUpdateUserBodySchema,
  adminDeleteUserBodySchema,
  parseBody,
} from "@/lib/schemas";

const supabase = getAdminClient();

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

  const parsed = await parseBody(request, adminUpdateUserBodySchema);
  if ("error" in parsed) return parsed.error;
  const { userId, team, role } = parsed.data;

  const update: Record<string, string | null> = {};
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

  const parsed = await parseBody(request, adminDeleteUserBodySchema);
  if ("error" in parsed) return parsed.error;
  const { userId } = parsed.data;

  await supabase.from("scores").delete().eq("user_id", userId);
  await supabase.from("predictions").delete().eq("user_id", userId);
  await supabase.from("app_users").delete().eq("id", userId);

  // Also delete from Supabase Auth
  await supabase.auth.admin.deleteUser(userId);

  return NextResponse.json({ success: true });
}
