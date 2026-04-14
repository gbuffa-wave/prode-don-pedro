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
    .from("internal_teams")
    .select("*")
    .order("id");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ teams: data });
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { name, icon } = await request.json();
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const { error } = await supabase
    .from("internal_teams")
    .insert({ name, icon: icon || "SoccerBall" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function PUT(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id, name, icon } = await request.json();

  const { error } = await supabase
    .from("internal_teams")
    .update({ name, icon })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await request.json();

  // Clear team from users who had this team
  const { data: team } = await supabase.from("internal_teams").select("name").eq("id", id).single();
  if (team) {
    await supabase.from("app_users").update({ team: null }).eq("team", team.name);
  }

  const { error } = await supabase.from("internal_teams").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
