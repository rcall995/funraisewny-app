'use client';

import Link from 'next/link';
import useUser from '@/hooks/useUser';
import SignOutButton from '@/components/SignOutButton';
import { usePathname } from 'next/navigation'; // <-- 1. Import the hook

/* eslint-disable @next/next/no-img-element */

export default function Header() {
  const { user, loading, isMerchant, isFundraiser, isMember } = useUser();
  const pathname = usePathname(); // <-- 2. Get the current page's path

  // 3. If we are on the login page, render nothing at all.
  if (pathname === '/login') {
    return null;
  }

  // Otherwise, render the appropriate header.
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
        <div className="flex items-center space-x-4 font-medium text-sm">
          {loading ? (
            <div className="h-8 w-36 bg-gray-200 rounded animate-pulse"></div>
          ) : user ? (
            // --- LOGGED-IN VIEW ---
            <>
              {isMember && (
                <Link href="/" className="text-gray-600 hover:text-blue-600">View Deals</Link>
              )}
              
              {isMerchant && (
                <Link href="/merchant" className="text-gray-600 hover:text-blue-600">Merchant Portal</Link>
              )}
              {isFundraiser && (
                 <Link href="/campaigns" className="text-gray-600 hover:text-blue-600">Fundraiser Portal</Link>
              )}
              
              {!isMerchant && !isFundraiser && (
                  <Link href="/dashboard" className="text-gray-600 hover:text-blue-600">My Dashboard</Link>
              )}

              <SignOutButton />
            </>
          ) : (
            // --- LOGGED-OUT VIEW ---
            <>
              <Link href="/login" className="text-gray-600 hover:text-blue-600">Login</Link>
              <Link href="/login" className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700">Sign Up</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}