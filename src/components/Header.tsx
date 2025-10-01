import Link from 'next/link';
import SignOutButton from '@/components/SignOutButton';

export default function Header() {
  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          Funraise<span className="text-slate-900">WNY</span>
        </Link>
        <div className="flex items-center space-x-4">
          <Link href="/dashboard" className="text-gray-600 hover:text-blue-600">
            Merchant Dashboard
          </Link>
          <Link href="/campaigns" className="text-gray-600 hover:text-blue-600">
            Fundraiser Dashboard
          </Link>
          <SignOutButton />
        </div>
      </nav>
    </header>
  );
}