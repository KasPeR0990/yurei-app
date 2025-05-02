import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let res = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          res = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Always call getUser to refresh session cookies
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Only protect /api routes (return 401 if not authed)
  if (request.nextUrl.pathname.startsWith('/api/')) {
    if (!user) {
      return NextResponse.json({
        error: 'Unauthorized access',
        message: 'Authentication required'
      }, { status: 401 });
    }
  }

  // Do NOT redirect for non-API routes; let your app render AuthCard as needed
  return res;
}