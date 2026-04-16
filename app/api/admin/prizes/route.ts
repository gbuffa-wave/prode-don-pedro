import { getAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/require-admin";
import { adminPrizesBodySchema, parseBody } from "@/lib/schemas";

const supabase = getAdminClient();

export async function PUT(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const parsed = await parseBody(request, adminPrizesBodySchema);
  if ("error" in parsed) return parsed.error;
  const { prizes } = parsed.data;

  const { error: deleteError } = await supabase
    .from("prizes")
    .delete()
    .neq("id", 0);

  if (deleteError) {
    return Response.json({ error: deleteError.message }, { status: 500 });
  }

  if (prizes.length > 0) {
    const toInsert = prizes.map((p, i) => ({
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
