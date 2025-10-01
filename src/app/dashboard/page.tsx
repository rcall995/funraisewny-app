'use client';

import useUser from '@/hooks/useUser';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, loading } = useUser();
  const router = useRouter();

  // This effect protects the page
  useEffect(() => {
    if (!user && !loading) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // While checking for the user, show a loading state
  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;
  }

  // Once the user is confirmed, show the main hub
  return (
    <div className="container mx-auto p-8 text-center">
      <h1 className="text-3xl font-bold">Welcome!</h1>
      <p className="mt-4 text-gray-600">You are logged in as <strong>{user.email}</strong>.</p>
      {/* *** FIX APPLIED HERE: Replaced ' with &apos; ***
      */}
      <p className="mt-2 text-gray-500">Choose where you&apos;d like to go:</p>
      <div className="mt-8 space-y-4 md:space-y-0 md:space-x-4">
        <Link 
          href="/merchant" 
          className="inline-block bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-blue-700"
        >
          Go to Merchant Dashboard
        </Link>
        <Link 
          href="/campaigns" 
          className="inline-block bg-green-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-green-700"
        >
          Go to Fundraiser Dashboard
        </Link>
      </div>
    </div>
  );
}