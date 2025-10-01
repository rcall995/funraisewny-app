'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import useUser from '@/hooks/useUser';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type Campaign = {
  id: number;
  campaign_name: string;
  goal_amount: number;
  start_date: string | null;
  end_date: string | null;
};

export default function CampaignsPage() {
  const { user, loading: userLoading } = useUser();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  const fetchCampaigns = useCallback(async (userId: string) => {
    setLoading(true);
    const { data } = await supabase.from('campaigns').select('*').eq('organizer_id', userId);
    if (data) setCampaigns(data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    if (user) {
      fetchCampaigns(user.id);
    }
    if (!user && !userLoading) setLoading(false);
  }, [user, userLoading, fetchCampaigns]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
  };

  if (loading || userLoading) {
    return <div className="p-8 text-center">Loading your campaigns...</div>;
  }

  if (!user) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Please log in to manage your campaigns.</h1>
        <Link href="/login" className="text-blue-600 hover:underline">Go to Login</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      {campaigns.length > 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Your Fundraising Campaigns</h2>
              <Link href="/campaigns/new" className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 shadow">
                + New Campaign
              </Link>
          </div>
          <ul className="space-y-4">
            {campaigns.map((campaign) => (
              <li key={campaign.id} className="border-t pt-4 first:border-t-0 first:pt-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{campaign.campaign_name}</h3>
                    <p className="text-gray-600">Goal: ${campaign.goal_amount.toLocaleString()}</p>
                    <div className="text-sm text-gray-500 mt-1">
                      <span>{formatDate(campaign.start_date)}</span> - <span>{formatDate(campaign.end_date)}</span>
                    </div>
                  </div>
                  <Link href={`/campaigns/${campaign.id}/edit`} className="text-sm font-medium text-blue-600 hover:text-blue-800">
                    Edit
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center bg-white p-12 rounded-lg shadow-md">
          {/* --- CORRECTED LINE --- */}
          <h2 className="text-xl font-semibold text-gray-700">You haven&apos;t created any campaigns yet.</h2>
          <p className="text-gray-500 mt-2 mb-6">Get started by creating your first fundraiser!</p>
          <Link href="/campaigns/new" className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700">
            Create Your First Campaign
          </Link>
        </div>
      )}
    </div>
  );
}