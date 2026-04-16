import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getAdminClient } from "@/lib/supabase/admin";

export async function GET() {
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
    return NextResponse.json({ user: null });
  }

  const { data: appUser } = await getAdminClient()
    .from("app_users")
    .select("role, team, display_name, avatar_url")
    .eq("id", user.id)
    .single();

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.user_metadata?.full_name || appUser?.display_name || null,
      avatar: user.user_metadata?.avatar_url || appUser?.avatar_url || null,
      email: user.email,
      role: appUser?.role || "player",
      team: appUser?.team || null,
    },
  });
}
