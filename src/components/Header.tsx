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
            className="h-10 w-auto" // Increased height from h-8 to h-10
          />
        </Link>
        <div className="flex items-center space-x-4">
          {/* Dashboard links have been removed for a cleaner look */}
          {/* We can add a conditional "Dashboard" link here later if a user is logged in */}
          <SignOutButton />
        </div>
      </nav>
    </header>
  );
}