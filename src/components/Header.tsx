'use client'

import Link from 'next/link'
import Image from 'next/image'
import SignOutButton from '@/components/SignOutButton'
import { usePathname } from 'next/navigation'

type AuthState = {
  email: string;
  role: string | null;
  fullName: string | null;
} | null;

export default function Header({ authState }: { authState: AuthState }) {
  const pathname = usePathname()

  if (pathname === '/' || pathname === '/login') {
    return null
  }

  const isLoggedIn = authState !== null;
  const isAdmin = authState?.role === 'admin';
  const isBusinessOwner = authState?.role === 'business';
  const isFundraiser = authState?.role === 'fundraiser';
  const isSupporter = authState?.role === 'supporter';

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="FunraiseWNY"
            width={375}
            height={100}
            className="h-25 w-auto"
          />
        </Link>
        <div className="flex items-center space-x-4 font-medium text-sm">
          {isLoggedIn ? (
            <>
              {isAdmin && (
                <Link href="/admin" className="text-gray-600 hover:text-blue-600">
                  Admin Panel
                </Link>
              )}
              {isBusinessOwner && (
                <Link href="/merchant" className="text-gray-600 hover:text-blue-600">
                  Business Portal
                </Link>
              )}
              {isFundraiser && (
                <Link href="/campaigns" className="text-gray-600 hover:text-blue-600">
                  Fundraiser Portal
                </Link>
              )}
              {isSupporter && (
                <Link href="/dashboard" className="text-gray-600 hover:text-blue-600">
                  My Account
                </Link>
              )}
              <Link href="/deals" className="text-gray-600 hover:text-blue-600">
                Deals
              </Link>
              {authState?.fullName && (
                <span className="text-gray-700 font-semibold">
                  {authState.fullName}
                </span>
              )}
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/for-fundraisers" className="text-gray-600 hover:text-green-600">
                Fundraisers
              </Link>
              <Link href="/for-businesses" className="text-gray-600 hover:text-blue-600">
                Businesses
              </Link>
              <Link href="/support" className="text-gray-600 hover:text-blue-600">
                Support a Group
              </Link>
              <Link
                href="/login"
                className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700"
              >
                Login
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
