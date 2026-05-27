import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getAdminClient } from "@/lib/supabase/admin";
import { brand } from "@/lib/brand";

const ALLOWED_ORIGINS = [
  brand.domain,
  "http://localhost:3000",
];

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  // Validate origin against allowlist to prevent open redirect
  const safeOrigin = ALLOWED_ORIGINS.includes(origin)
    ? origin
    : brand.domain;

  if (code) {
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

    const { error, data } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const adminSupabase = getAdminClient();
      const { data: existingUser } = await adminSupabase
        .from("app_users")
        .select("id")
        .eq("id", data.user.id)
        .single();

      if (!existingUser) {
        // Create new user with display name and avatar from Google
        await adminSupabase.from("app_users").insert({
          id: data.user.id,
          role: "player",
          display_name: data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || null,
          avatar_url: data.user.user_metadata?.avatar_url || null,
        });
        // New user → onboarding to pick team
        return NextResponse.redirect(`${safeOrigin}/onboarding`);
      } else {
        // Update existing user's avatar and name (might have changed)
        await adminSupabase.from("app_users")
          .update({
            display_name: data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || null,
            avatar_url: data.user.user_metadata?.avatar_url || null,
          })
          .eq("id", data.user.id);

        // Check if user has a team, if not → onboarding
        const { data: userData } = await adminSupabase
          .from("app_users")
          .select("team")
          .eq("id", data.user.id)
          .single();

        if (!userData?.team) {
          return NextResponse.redirect(`${safeOrigin}/onboarding`);
        }
      }

      return NextResponse.redirect(`${safeOrigin}/fixture`);
    }
  }

  return NextResponse.redirect(`${safeOrigin}/login?error=auth`);
}
