import { type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const res = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          res.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Public routes that don't require auth
    const publicRoutes = [
      '/api/trending',
      '/api/auth'
    ];
    
    if (publicRoutes.includes(request.nextUrl.pathname)) {
      return res;
    }

    // All other API routes require auth
    if (!session) {
      return NextResponse.json({
        error: 'Unauthorized access',
        message: 'Authentication required'
      })
    }
  }
  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    '/api/:path*'
  ],
};
