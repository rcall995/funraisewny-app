'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';

type SupportPageProps = {
  params: {
    campaignId: string;
  };
};

type Campaign = {
  id: number;
  campaign_name: string;
};

export default function SupportPage({ params }: SupportPageProps) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  const fetchCampaign = useCallback(async () => {
    // We only need 'data', so we remove 'error' to fix the lint warning
    const { data } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', params.campaignId)
      .single();
    
    if(data) {
      setCampaign(data);
    }
    setLoading(false);
  }, [supabase, params.campaignId]);

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