import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getAdminClient } from "@/lib/supabase/admin";
import { onboardingBodySchema, parseBody } from "@/lib/schemas";

export async function POST(request: Request) {
  const parsed = await parseBody(request, onboardingBodySchema);
  if ("error" in parsed) return parsed.error;
  const { team } = parsed.data;

  // Get current user
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await getAdminClient()
    .from("app_users")
    .update({ team })
    .eq("id", user.id);

  return NextResponse.json({ success: true });
}
