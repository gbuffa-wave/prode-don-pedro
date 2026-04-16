import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/require-admin";
import {
  adminCreateTeamBodySchema,
  adminUpdateTeamBodySchema,
  adminDeleteTeamBodySchema,
  parseBody,
} from "@/lib/schemas";

const supabase = getAdminClient();

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

  const parsed = await parseBody(request, adminCreateTeamBodySchema);
  if ("error" in parsed) return parsed.error;
  const { name, icon } = parsed.data;

  const { error } = await supabase
    .from("internal_teams")
    .insert({ name, icon: icon || "SoccerBall" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function PUT(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const parsed = await parseBody(request, adminUpdateTeamBodySchema);
  if ("error" in parsed) return parsed.error;
  const { id, name, icon } = parsed.data;

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

  const parsed = await parseBody(request, adminDeleteTeamBodySchema);
  if ("error" in parsed) return parsed.error;
  const { id } = parsed.data;

  const { data: team } = await supabase.from("internal_teams").select("name").eq("id", id).single();
  if (team) {
    await supabase.from("app_users").update({ team: null }).eq("team", team.name);
  }

  const { error } = await supabase.from("internal_teams").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
