import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // If Supabase isn't configured yet, let /admin render the clear setup guide
  if (!isSupabaseConfigured()) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>
        ) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const allowedAdminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.trim().toLowerCase();
  const isAuthorized =
    Boolean(user) &&
    (!allowedAdminEmail || user?.email?.toLowerCase() === allowedAdminEmail);

  const isLoginRoute = pathname.startsWith('/admin/login');

  if (!isAuthorized && !isLoginRoute) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/admin/login';
    if (user && !isAuthorized) {
      loginUrl.searchParams.set('error', 'unauthorized');
    }
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthorized && isLoginRoute) {
    const adminUrl = request.nextUrl.clone();
    adminUrl.pathname = '/admin';
    adminUrl.search = '';
    return NextResponse.redirect(adminUrl);
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};
