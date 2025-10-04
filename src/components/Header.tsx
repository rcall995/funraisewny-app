'use client';

import Link from 'next/link';
import useUser from '@/hooks/useUser';
import SignOutButton from '@/components/SignOutButton';
import { usePathname } from 'next/navigation';

/* eslint-disable @next/next/no-img-element */

export default function Header() {
  // RENAMED isMerchant to isBusinessOwner
  const { user, loading, isBusinessOwner, isFundraiser, isMember } = useUser();
  const pathname = usePathname();

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
            <>
              {isMember && pathname !== '/deals' && (
                <Link href="/deals" className="text-gray-600 hover:text-blue-600">View Deals</Link>
              )}
              {/* UPDATED to use isBusinessOwner and new text */}
              {isBusinessOwner && pathname !== '/merchant' && (
                <Link href="/merchant" className="text-gray-600 hover:text-blue-600">Business Portal</Link>
              )}
              {isFundraiser && pathname !== '/campaigns' && (
                  <Link href="/campaigns" className="text-gray-600 hover:text-blue-600">Fundraiser Portal</Link>
              )}
              {/* UPDATED to use isBusinessOwner */}
              {!isBusinessOwner && !isFundraiser && pathname !== '/dashboard' && (
                  <Link href="/dashboard" className="text-gray-600 hover:text-blue-600">My Account</Link>
              )}
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700">Login</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}