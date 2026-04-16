import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { requireUser } from "@/lib/require-admin";
import { getAdminClient } from "@/lib/supabase/admin";
import { championBodySchema, parseBody } from "@/lib/schemas";

const supabase = getAdminClient();

const TOURNAMENT_START = new Date("2026-06-11T17:00:00Z");

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const { data } = await supabase
    .from("app_users")
    .select("champion_code, champion_locked_at")
    .eq("id", auth.userId)
    .maybeSingle();

  return NextResponse.json({
    champion_code: data?.champion_code ?? null,
    locked: data?.champion_locked_at !== null && data?.champion_locked_at !== undefined,
  });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  if (new Date() >= TOURNAMENT_START) {
    return NextResponse.json(
      { error: "El torneo ya comenzó, no se puede cambiar el campeón" },
      { status: 403 }
    );
  }

  const parsed = await parseBody(request, championBodySchema);
  if ("error" in parsed) return parsed.error;
  const code = parsed.data.code.trim().toUpperCase();

  const { data: team } = await supabase
    .from("teams")
    .select("code")
    .eq("code", code)
    .maybeSingle();
  if (!team) {
    return NextResponse.json({ error: "Equipo no existe" }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("app_users")
    .select("champion_locked_at")
    .eq("id", auth.userId)
    .maybeSingle();

  if (existing?.champion_locked_at) {
    return NextResponse.json(
      { error: "Campeón ya confirmado, no se puede cambiar" },
      { status: 403 }
    );
  }

  const { error } = await supabase
    .from("app_users")
    .update({
      champion_code: code,
      champion_locked_at: new Date().toISOString(),
    })
    .eq("id", auth.userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidateTag("leaderboard", "max");
  return NextResponse.json({ success: true, champion_code: code });
}
