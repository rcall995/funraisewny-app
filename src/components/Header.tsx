'use client';

import Link from 'next/link';
import useUser from '@/hooks/useUser';
import SignOutButton from '@/components/SignOutButton';
import { usePathname } from 'next/navigation'; // <-- 1. Import the new hook

/* eslint-disable @next/next/no-img-element */

export default function Header() {
  const { user, loading } = useUser();
  const pathname = usePathname(); // <-- 2. Get the current page's path

  // 3. If we're on the login page, render nothing (null).
  if (pathname === '/login') {
    return null;
  }

  // Otherwise, render the header as before.
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link href="/">
          <img 
            src="/image_acafef.png"
            alt="FunraiseWNY Logo"
            className="h-10 w-auto"
          />
        </Link>
        <div className="flex items-center space-x-4">
          {loading ? (
            <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
          ) : user ? (
            // If user is logged in
            <>
              <Link href="/dashboard" className="text-gray-600 hover:text-blue-600 font-medium">
                Dashboard
              </Link>
              <SignOutButton />
            </>
          ) : (
            // If user is logged out (and not on the login page)
            <>
              <Link href="/login" className="text-gray-600 hover:text-blue-600 font-medium">
                Login
              </Link>
              <Link href="/login" className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}