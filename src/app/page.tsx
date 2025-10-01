'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';

/* eslint-disable @next/next/no-img-element */

type Deal = {
  id: number;
  title: string;
  description: string;
  businesses: {
    business_name: string;
  } | null;
};

export default function HomePage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchDeals = async () => {
      setLoading(true);
      // We only use 'data' here, so we remove 'error' to fix the warning.
      const { data } = await supabase.from('deals').select(`
        *,
        businesses ( business_name )
      `);
      if (data) {
        setDeals(data as Deal[]);
      }
      setLoading(false);
    };
    fetchDeals();
  }, [supabase]);

  return (
    <main className="bg-white">
      {/* Hero Section */}
      <section className="text-center py-16 md:py-24 px-4 bg-gray-50">
        <div className="container mx-auto max-w-4xl">
          <img src="/image_acafef.png" alt="FunraiseWNY Logo" className="h-16 md:h-20 w-auto mx-auto mb-8" />
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">Support Local WNY. Save Big.</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">Purchase a membership through a local fundraiser and get access to exclusive deals from businesses right here in our community.</p>
          <div className="flex justify-center">
             <Link href="/login" className="px-8 py-4 bg-blue-600 text-white font-bold rounded-lg shadow-xl hover:bg-blue-700 transition duration-300 text-lg">
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Live Deals Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-gray-900">Live Deals on the Platform</h2>
            {/* --- THIS IS THE CORRECTED LINE --- */}
            <p className="text-lg text-gray-600 mt-2">Here&apos;s a taste of the savings you&apos;ll unlock.</p>
          </div>
          {loading ? (
            <p className="text-center text-gray-500">Loading deals...</p>
          ) : deals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {deals.map((deal) => (
                <div key={deal.id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 transform hover:-translate-y-1 transition-transform duration-300">
                  <h3 className="text-xl font-bold text-blue-700">{deal.title}</h3>
                  <p className="text-md font-semibold text-gray-800 mt-1">at {deal.businesses?.business_name || 'Local Business'}</p>
                  <p className="text-gray-600 mt-3">{deal.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No deals have been added yet. Businesses are signing up now!</p>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 px-4">
        <div className="container mx-auto text-center text-sm">
          <p className="mb-2">© 2025 Funraise WNY. All Rights Reserved.</p>
          <p className="text-gray-400">Made with ❤️ in Buffalo, NY.</p>
        </div>
      </footer>
    </main>
  );
}