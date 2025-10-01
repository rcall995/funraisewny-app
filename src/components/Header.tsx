export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server'; // We'll use the server client here
import SignOutButton from '@/components/SignOutButton';

/* eslint-disable @next/next/no-img-element */

// This is now an async Server Component
export default async function Header() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link href="/">
          <img 
            src="/image_acafef.png" // Assumes image is in 'public' folder
            alt="FunraiseWNY Logo"
            className="h-10 w-auto"
          />
        </Link>
        <div className="flex items-center space-x-4">
          {user ? (
            // If user is logged in, show these links
            <>
              <Link href="/dashboard" className="text-gray-600 hover:text-blue-600 font-medium">
                Dashboard
              </Link>
              <SignOutButton />
            </>
          ) : (
            // If user is logged out, show these links
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