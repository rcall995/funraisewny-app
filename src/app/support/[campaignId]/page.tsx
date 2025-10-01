'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { useParams } from 'next/navigation'; // <-- Import the new hook

type Campaign = {
  id: number;
  campaign_name: string;
};

// Note: We no longer need the 'SupportPageProps' type
export default function SupportPage() {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();
  
  // Use the hook to get the params from the URL
  const params = useParams();
  const campaignId = params.campaignId;

  const fetchCampaign = useCallback(async () => {
    if (!campaignId) return; // Don't run if the ID isn't available yet

    const { data } = await supabase
      .from('campaigns')
      .select('id, campaign_name')
      .eq('id', campaignId)
      .single();
    
    if(data) {
      setCampaign(data);
    }
    setLoading(false);
  }, [supabase, campaignId]);

  useEffect(() => {
    fetchCampaign();
  }, [fetchCampaign]);
  
  if (loading) {
    return <div className="p-8 text-center">Loading campaign...</div>;
  }

  if (!campaign) {
    return <div className="p-8 text-center">Campaign not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-8">
      <div className="w-full max-w-2xl text-center">
        <p className="text-lg text-gray-600">You are supporting:</p>
        <h1 className="text-4xl font-bold text-slate-900 my-4">
          {campaign.campaign_name}
        </h1>
        <div className="bg-white p-8 rounded-lg shadow-md mt-6">
          <h2 className="text-2xl font-semibold">Get Your FunraiseWNY Membership</h2>
          <p className="text-gray-600 my-4">
            Purchase a 1-year membership to unlock hundreds of local deals. A large portion of your purchase goes directly to supporting this fundraiser!
          </p>
          <div className="my-6">
            <span className="text-5xl font-bold">$25</span>
            <span className="text-gray-500">/ year</span>
          </div>
          <button className="w-full bg-green-600 text-white font-bold py-4 px-6 rounded-lg shadow-lg hover:bg-green-700 text-xl">
            Purchase Membership
          </button>
        </div>
        <Link href="/" className="text-blue-600 hover:underline mt-8 inline-block">
          See all available deals
        </Link>
      </div>
    </div>
  );
}