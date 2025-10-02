'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';

/* eslint-disable @next/next/no-img-element */

// --- Type Definitions for Deals/Businesses ---
type Deal = {
  id: number;
  // We'll use 'title' from the DB column and map it to 'deal_name' for display
  title: string; 
  description: string;
  fine_print: string | null; 
  status: string;
  business_id: string; 
  profiles: { 
    full_name: string; // Business Name
    logo_url: string | null; 
  } | null;
};

// Placeholder Code for members (assuming a static membership model for now)
const PLACEHOLDER_REDEEM_CODE = 'FUNRAISE-25';

// NOTE: Retained FeatureCard component but it's currently unused 
// as the page content switches to displaying deals.
const FeatureCard = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="mx-auto w-14 h-14 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-5">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <div className="text-gray-600 space-y-2">{children}</div>
    </div>
);

// This component is renamed from HomePage to DealsPage for clarity, 
// but keeps its default export for the root route.
export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  const fetchDeals = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    // Fetch all active deals and join with the profiles table
    const { data: dealsData, error: dbError } = await supabase
      .from('deals')
      .select(`
        id, 
        business_id, 
        title, 
        description, 
        fine_print, 
        status,
        profiles ( full_name, logo_url )
      `)
      .eq('status', 'active'); 

    if (dbError) {
      console.error('Error fetching deals:', dbError);
      setError('Failed to load deals. Please try again later.');
      setDeals([]);
    } else {
      // Map incoming 'title' field to 'deal_name' as expected by the Deal type structure
      const formattedDeals = (dealsData || []).map(deal => ({
        ...deal,
        deal_name: deal.title, // Use title as the display name
      }));
      setDeals(formattedDeals as unknown as Deal[]);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);


  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <p className="text-xl text-gray-600">Loading current deals...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <p className="text-red-500 text-xl">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto p-4 max-w-4xl">
        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-2">Exclusive Member Deals</h1>
        <p className="text-center text-lg text-gray-600 mb-10">Use your membership code to redeem these local offers!</p>

        {deals.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-700">No active deals right now!</h2>
            <p className="mt-4 text-gray-500">Check back soon for new discounts from our partners.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {deals.map((deal) => (
              <div key={deal.id} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6 hover:shadow-xl transition-shadow duration-300">
                
                {/* Logo or Placeholder */}
                {deal.profiles?.logo_url ? (
                  <img
                    src={deal.profiles.logo_url}
                    alt={`${deal.profiles.full_name} logo`}
                    className="w-20 h-20 object-contain rounded-lg border flex-shrink-0"
                  />
                ) : (
                    <div className="w-20 h-20 object-contain rounded-lg border flex-shrink-0 bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                        {deal.profiles?.full_name?.charAt(0) || 'B'}
                    </div>
                )}
                
                <div className="flex-grow">
                  <h2 className="text-2xl font-bold text-blue-800">{deal.deal_name}</h2>
                  <p className="text-lg text-gray-600 mt-1">
                    <strong className="font-semibold">{deal.profiles?.full_name || 'Partnering Business'}</strong>
                  </p>
                  <p className="mt-3 text-gray-700">{deal.description}</p>
                  
                  {/* Fine Print / Redemption Terms */}
                  {deal.fine_print && (
                    <p className="mt-2 text-sm italic text-gray-500">
                        * {deal.fine_print}
                    </p>
                  )}

                  {/* Redemption Code */}
                  <div className="mt-4 pt-3 border-t border-dashed border-gray-200">
                    <p className="text-sm font-medium text-gray-500 mb-2">Your Member Code:</p>
                    <p className="bg-green-100 text-green-800 font-mono text-lg px-4 py-2 rounded-lg inline-block select-all">
                      {PLACEHOLDER_REDEEM_CODE}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
            <Link href="/for-businesses" className="text-blue-600 hover:underline">
                Are you a business interested in offering a deal? Learn more here.
            </Link>
        </div>
      </div>
    </div>
  );
}
