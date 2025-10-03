'use client';

import Link from 'next/link';
import useUser from '@/hooks/useUser';
import SignOutButton from '@/components/SignOutButton';
import { usePathname } from 'next/navigation';

/* eslint-disable @next/next/no-img-element */

export default function Header() {
  const { user, loading, isMerchant, isFundraiser, isMember } = useUser();
  const pathname = usePathname();

  // No change here, we still don't want a header on the login page.
  if (pathname === '/login') {
    return null;
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link href="/">
          <img 
            src="/image_acafef.png"
            alt="FunraiseWNY Logo"
            className="h-16 w-auto"
          />
        </Link>
        <div className="flex items-center space-x-4 font-medium text-sm">
          {loading ? (
            <div className="h-8 w-36 bg-gray-200 rounded animate-pulse"></div>
          ) : user ? (
            // --- UPDATED LOGGED-IN VIEW ---
            <>
              {/* FIX: Points to /deals and hides if already on /deals */}
              {isMember && pathname !== '/deals' && (
                <Link href="/deals" className="text-gray-600 hover:text-blue-600">View Deals</Link>
              )}
              {/* FIX: Hides if already on /merchant */}
              {isMerchant && pathname !== '/merchant' && (
                <Link href="/merchant" className="text-gray-600 hover:text-blue-600">Merchant Portal</Link>
              )}
              {/* FIX: Hides if already on /campaigns */}
              {isFundraiser && pathname !== '/campaigns' && (
                  <Link href="/campaigns" className="text-gray-600 hover:text-blue-600">Fundraiser Portal</Link>
              )}
              {/* FIX: Hides if already on /dashboard */}
              {!isMerchant && !isFundraiser && pathname !== '/dashboard' && (
                  <Link href="/dashboard" className="text-gray-600 hover:text-blue-600">My Dashboard</Link>
              )}
              <SignOutButton />
            </>
          ) : (
            // --- LOGGED-OUT VIEW (No changes) ---
            <>
              <Link href="/login" className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700">Login</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}