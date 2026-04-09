import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { data, error } = await supabase
    .from("app_users")
    .select("id, display_name, avatar_url, role, team, created_at")
    .order("display_name");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ users: data });
}

export async function PUT(request: Request) {
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
