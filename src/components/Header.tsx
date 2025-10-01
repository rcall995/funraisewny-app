import Link from 'next/link';
import SignOutButton from '@/components/SignOutButton';

/* eslint-disable @next/next/no-img-element */

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link href="/">
          <img 
            src="/image_acafef.png" // Assumes the image is in your 'public' folder
            alt="FunraiseWNY Logo"
            className="h-8 w-auto"
          />
        </Link>
        <div className="flex items-center space-x-4">
          <Link href="/merchant" className="text-gray-600 hover:text-blue-600">
            Merchant Dashboard
          </Link>
          <Link href="/campaigns" className="text-gray-600 hover:text-blue-600">
            Fundraiser Dashboard
          </Link> {/* <-- This was incorrectly </A> and has now been fixed */}
          <SignOutButton />
        </div>
      </nav>
    </header>
  );
}