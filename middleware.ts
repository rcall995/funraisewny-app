// middleware.ts

import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const roleRedirects: { [key: string]: string } = {
  supporter: '/dashboard',
  fundraiser: '/campaigns',
  business: '/merchant',
};

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  // --- Logic for logged-in users ---
  if (user) {
    // If the user is logged-in and tries to go to the login page, redirect them.
    if (pathname === '/login') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const role = profile?.role as string | undefined;
      const redirectUrl = role ? roleRedirects[role] : '/dashboard';
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    // No other logic needed here for logged-in users, as the Server Action places them correctly.
    return response;
  }

  // --- Logic for logged-out users ---
  // If the user is not signed in and is trying to access a protected route,
  // redirect them to the login page.
  const protectedRoutes = Object.values(roleRedirects);
  if (!user && protectedRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

// This config ensures the middleware runs on the login page and all protected routes.
export const config = {
  matcher: [
    '/login',
    '/dashboard',
    '/campaigns',
    '/merchant',
  ],
};