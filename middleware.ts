import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
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

  // Allow public pages, auth callback, and API routes
  if (isPublicPage || isAuthCallback || isApi || isDemo) {
    // If logged in and on login page, redirect to fixture
    if (user && pathname === "/login") {
      return NextResponse.redirect(new URL("/fixture", request.url));
    }
    return response;
  }

  // Protected pages: redirect to login if not authenticated
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)"],
};
