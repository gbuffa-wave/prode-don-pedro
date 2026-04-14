import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

type AdminResult = { error: NextResponse } | { userId: string };

/**
 * Verifies the caller is an authenticated admin user.
 * Returns { userId } on success, { error: NextResponse } on failure.
 *
 * Usage in route handlers:
 *   const auth = await requireAdmin();
 *   if ("error" in auth) return auth.error;
 */
export async function requireAdmin(): Promise<AdminResult> {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {},
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: profile } = await adminClient
    .from("app_users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { userId: user.id };
}

/**
 * Verifies the caller is either a valid Vercel cron job (Bearer CRON_SECRET)
 * or an authenticated admin user.
 * Returns null on success, NextResponse 401/403 on failure.
 */
export async function requireCronOrAdmin(request: Request): Promise<NextResponse | null> {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    return null;
  }

  const result = await requireAdmin();
  if ("error" in result) return result.error;
  return null;
}
