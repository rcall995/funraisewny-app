'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import useUser from '@/hooks/useUser';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

/* eslint-disable @next/next/no-img-element */

type Campaign = {
  id: number;
  campaign_name: string;
  description: string;
  logo_url: string | null;
};

// This is our simplified type for what we display
type SupporterDisplayInfo = {
  name: string;
};

export default function SupportPage() {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [supporters, setSupporters] = useState<SupporterDisplayInfo[]>([]); // Use the new simplified type
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  const supabase = createClientComponentClient();
  const router = useRouter();
  const params = useParams();
  const { user } = useUser();
  const slug = params.slug as string;

  useEffect(() => {
    const fetchCampaignData = async () => {
      if (!slug) return;
      
      const { data: campaignData } = await supabase.from('campaigns').select('*').eq('slug', slug).single();
      if(campaignData) {
        setCampaign(campaignData);

        const { data: supportersData } = await supabase
          .from('memberships')
          .select(`profiles ( full_name )`)
          .eq('campaign_id', campaignData.id)
          .order('created_at', { ascending: false })
          .limit(5);
        
        // This logic safely processes the data and sets it in the correct shape
        if (supportersData) {
          const displaySupporters = supportersData.map(s => ({
            name: s.profiles?.full_name || 'An anonymous supporter'
          }));
          setSupporters(displaySupporters);
        }
      }
      setLoading(false);
    };
    fetchCampaignData();
  }, [supabase, slug]);
  
  const handlePurchase = async () => { /* ... (This function is unchanged) ... */ };
  if (loading) { /* ... (This is unchanged) ... */ }
  if (!campaign) { /* ... (This is unchanged) ... */ }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 md:p-8">
      <div className="w-full max-w-2xl text-center">
        {campaign.logo_url && (<img src={campaign.logo_url} alt={`${campaign.campaign_name} logo`} className="w-32 h-32 object-contain rounded-full mx-auto mb-4 bg-white shadow-lg border" />)}
        <p className="text-lg text-gray-600">You are supporting:</p>
        <h1 className="text-4xl font-bold text-slate-900 my-2">{campaign.campaign_name}</h1>
        <p className="text-gray-700 my-6 max-w-xl mx-auto">{campaign.description}</p>
        
        <div className="bg-white p-8 rounded-lg shadow-md mt-6">
          <h2 className="text-2xl font-semibold">Get Your FunraiseWNY Membership</h2>
          <div className="my-6"><span className="text-5xl font-bold">$25</span><span className="text-gray-500">/ year</span></div>
          <button onClick={handlePurchase} disabled={processing} className="w-full bg-green-600 text-white font-bold py-4 px-6 rounded-lg shadow-lg hover:bg-green-700 text-xl disabled:bg-gray-400">{processing ? 'Processing...' : 'Purchase & Support'}</button>
        </div>
        
        {supporters.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800">Recent Supporters</h3>
            <div className="mt-4 space-y-2">
              {supporters.map((supporter, index) => (
                <div key={index} className="bg-white text-sm text-gray-700 p-3 rounded-md shadow-sm border">
                  🎉 {supporter.name} just joined!
                </div>
              ))}
            </div>
          </div>
        )}
        
        <Link href="/" className="text-blue-600 hover:underline mt-8 inline-block">See all available deals</Link>
      </div>
    </div>
  );
}

async function handlePurchase() {}