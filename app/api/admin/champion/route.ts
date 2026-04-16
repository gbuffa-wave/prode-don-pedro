import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/require-admin";
import { adminChampionBodySchema, parseBody } from "@/lib/schemas";

const supabase = getAdminClient();

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { data } = await supabase
    .from("app_config")
    .select("value")
    .eq("key", "champion")
    .single();

  return NextResponse.json({ champion: data?.value ? JSON.parse(data.value) : null });
}

export async function PUT(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const parsed = await parseBody(request, adminChampionBodySchema);
  if ("error" in parsed) return parsed.error;
  const { champion } = parsed.data;

  if (champion) {
    await supabase
      .from("app_config")
      .upsert({ key: "champion", value: JSON.stringify(champion) });
    await supabase
      .from("app_config")
      .upsert({ key: "champion_code", value: champion.code });
  } else {
    await supabase.from("app_config").delete().eq("key", "champion");
    await supabase.from("app_config").delete().eq("key", "champion_code");
  }

  return NextResponse.json({ success: true });
}
