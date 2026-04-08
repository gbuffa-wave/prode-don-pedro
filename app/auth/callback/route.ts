import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

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
      // Ensure user exists in app_users table
      const adminSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

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
      } else {
        // Update existing user's avatar and name (might have changed)
        await adminSupabase.from("app_users")
          .update({
            display_name: data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || null,
            avatar_url: data.user.user_metadata?.avatar_url || null,
          })
          .eq("id", data.user.id);
      }

      return NextResponse.redirect(`${origin}/fixture`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
