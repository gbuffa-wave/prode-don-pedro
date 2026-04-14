import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/require-admin";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PUT(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { prizes } = await request.json();

  // Delete all existing prizes and re-insert
  const { error: deleteError } = await supabase
    .from("prizes")
    .delete()
    .neq("id", 0);

  if (deleteError) {
    return Response.json({ error: deleteError.message }, { status: 500 });
  }

  if (prizes.length > 0) {
    const toInsert = prizes.map((p: any, i: number) => ({
      position: i + 1,
      title: p.title,
      description: p.description || null,
      image_url: p.image_url || null,
    }));

    const { error: insertError } = await supabase
      .from("prizes")
      .insert(toInsert);

    if (insertError) {
      return Response.json({ error: insertError.message }, { status: 500 });
    }
  }

  return Response.json({ success: true });
}
