import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { data } = await supabase
    .from("app_config")
    .select("value")
    .eq("key", "champion")
    .single();

  return NextResponse.json({ champion: data?.value ? JSON.parse(data.value) : null });
}

export async function PUT(request: Request) {
  const { champion } = await request.json();

  if (champion) {
    await supabase
      .from("app_config")
      .upsert({ key: "champion", value: JSON.stringify(champion) });
  } else {
    await supabase
      .from("app_config")
      .delete()
      .eq("key", "champion");
  }

  return NextResponse.json({ success: true });
}
