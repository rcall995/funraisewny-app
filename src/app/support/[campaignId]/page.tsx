'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import useUser from '@/hooks/useUser';

type Campaign = {
  id: number;
  campaign_name: string;
};

export default function SupportPage() {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false); // For the button
  
  const supabase = createClientComponentClient();
  const router = useRouter();
  const params = useParams();
  const { user } = useUser();
  const campaignId = params.campaignId;

  // Fetch the campaign data
  useEffect(() => {
    const fetchCampaign = async () => {
      if (!campaignId) return;
      const { data } = await supabase
        .from('campaigns')
        .select('id, campaign_name')
        .eq('id', campaignId)
        .single();
      
      if(data) setCampaign(data);
      setLoading(false);
    };
    fetchCampaign();
  }, [supabase, campaignId]);
  
  const handlePurchase = async () => {
    // 1. Check if user is logged in
    if (!user) {
      // If not logged in, redirect to the login page.
      // We'll also pass a 'redirect_to' query param so we can come back here after login.
      router.push(`/login?redirect_to=/support/${campaignId}`);
      return;
    }

    // 2. Simulate the purchase
    setProcessing(true);
    const expires_at = new Date();
    expires_at.setFullYear(expires_at.getFullYear() + 1); // Membership expires in 1 year

    const { error } = await supabase.from('memberships').insert({
      user_id: user.id,
      campaign_id: campaignId,
      expires_at: expires_at.toISOString(),
    });

    if (error) {
      alert('Error: Could not complete your membership. Please try again.');
      setProcessing(false);
    } else {
      // 3. On success, redirect to a thank you page
      router.push('/support/thank-you');
    }
  };

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
          <button 
            onClick={handlePurchase}
            disabled={processing}
            className="w-full bg-green-600 text-white font-bold py-4 px-6 rounded-lg shadow-lg hover:bg-green-700 text-xl disabled:bg-gray-400"
          >
            {processing ? 'Processing...' : 'Purchase Membership'}
          </button>
        </div>
        <Link href="/" className="text-blue-600 hover:underline mt-8 inline-block">
          See all available deals
        </Link>
      </div>
    </div>
  );
}