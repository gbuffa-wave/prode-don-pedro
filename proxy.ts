import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request: NextRequest) {
  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isPublicPage = pathname === "/" || pathname === "/login";
  const isAuthCallback = pathname.startsWith("/auth/");
  const isApi = pathname.startsWith("/api/");
  const isDemo = pathname.startsWith("/demo");
  const isAdminApi = pathname.startsWith("/api/admin/");
  const isCronApi =
    pathname.startsWith("/api/sync-results") ||
    pathname.startsWith("/api/send-reminders");

  // Defense-in-depth: endpoints admin requieren sesión en middleware también.
  // El check de rol sigue en requireAdmin() dentro del handler.
  // /api/sync-results y /api/send-reminders aceptan Bearer CRON_SECRET,
  // así que no los forzamos aquí (requireCronOrAdmin los cubre).
  if (isAdminApi && !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isPublicPage || isAuthCallback || isApi || isDemo || isCronApi) {
    if (user && pathname === "/login") {
      return NextResponse.redirect(new URL("/fixture", request.url));
    }
    return response;
  }

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)"],
};
