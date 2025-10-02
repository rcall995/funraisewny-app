'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';

/* eslint-disable @next/next/no-img-element */

// Define a type for our deals to help with TypeScript
type Deal = {
  id: number;
  title: string;
  description: string;
  businesses: {
    business_name: string;
  } | null;
};

const HowItWorksStep = ({ num, title, description }: { num: string, title: string, description: string }) => (
  <div className="flex">
    <div className="flex flex-col items-center mr-4">
      <div>
        <div className="flex items-center justify-center w-10 h-10 border rounded-full">
          <p className="text-xl font-bold text-gray-800">{num}</p>
        </div>
      </div>
      <div className="w-px h-full bg-gray-300"></div>
    </div>
    <div className="pb-8">
      <p className="mb-2 text-xl font-bold text-gray-900">{title}</p>
      <p className="text-gray-700">{description}</p>
    </div>
  </div>
);

export default function HomePage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchDeals = async () => {
      setLoading(true);
      const { data } = await supabase.from('deals').select(`
        *,
        businesses ( business_name )
      `).limit(6);

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
      <section className="text-center py-20 md:py-28 px-4 bg-gray-50">
        <div className="container mx-auto max-w-4xl">
          <img
            src="/image_acafef.png"
            alt="FunraiseWNY Logo"
            className="h-16 md:h-20 w-auto mx-auto mb-8"
          />
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            The Easiest Way to Fundraise in Western New York.
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
            We connect local groups with community-minded businesses to create fundraisers that people actually love.
          </p>
          <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4">
             <Link href="/login" className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg shadow-xl hover:bg-green-700 transition duration-300 inline-block text-center text-lg">
              Start a Fundraiser
            </Link>
            <Link href="/login" className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-xl hover:bg-blue-700 transition duration-300 inline-block text-center text-lg">
              Feature Your Business
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-16">
              <h2 className="text-4xl font-extrabold text-gray-900">A Simple Plan for Big Results</h2>
              <p className="text-lg text-gray-600 mt-2">Everyone in the community wins.</p>
          </div>
          <HowItWorksStep 
            num="1" 
            title="Groups & Businesses Partner Up" 
            description="Local businesses offer exclusive deals on our platform for free. Fundraisers sign up and create a campaign in minutes."
          />
          <HowItWorksStep 
            num="2" 
            title="Share & Support" 
            description="Fundraisers share their unique campaign link. Supporters buy a 1-year membership, with a large portion of the proceeds going directly to the group."
          />
          <HowItWorksStep 
            num="3" 
            title="Save at Local Favorites" 
            description="Members unlock a full year of amazing deals at all participating WNY businesses, saving money while supporting their community."
          />
        </div>
      </section>
      
      {/* Deal Preview Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-gray-900">A Preview of Your Savings</h2>
            <p className="text-lg text-gray-600 mt-2">Here&apos;s a taste of the savings you&apos;ll unlock when you become a member.</p>
          </div>
          {loading ? (
             <p className="text-center text-gray-500">Loading deals...</p>
          ) : deals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {deals.map((deal) => (
                <div key={deal.id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                  <h3 className="text-xl font-bold text-blue-700">{deal.title}</h3>
                  <p className="text-md font-semibold text-gray-800 mt-1">at {deal.businesses?.business_name || 'Local Business'}</p>
                  <p className="text-gray-600 mt-3">{deal.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">Deals are being added now. Check back soon!</p>
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