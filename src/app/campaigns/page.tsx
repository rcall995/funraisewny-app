'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import useUser from '@/hooks/useUser';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type Campaign = {
  id: number;
  slug: string;
  campaign_name: string;
  goal_amount: number;
  start_date: string | null;
  end_date: string | null;
};

export default function CampaignsPage() {
  const { user, loading: userLoading } = useUser();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const supabase = createClientComponentClient();

  const fetchCampaigns = useCallback(async (userId: string) => {
    setLoading(true);
    // --- UPDATED QUERY ---
    // Only select campaigns where the status is 'active'
    const { data } = await supabase
      .from('campaigns')
      .select('*')
      .eq('organizer_id', userId)
      .eq('status', 'active'); // <-- This is the important change
    
    if (data) setCampaigns(data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    if (user) fetchCampaigns(user.id);
    if (!user && !userLoading) setLoading(false);
  }, [user, userLoading, fetchCampaigns]);

  // --- NEW ARCHIVE FUNCTION ---
  const handleArchive = async (campaignId: number) => {
    // Ask for confirmation before archiving
    if (window.confirm('Are you sure you want to archive this campaign? It will be hidden from your view.')) {
      const { error } = await supabase
        .from('campaigns')
        .update({ status: 'archived' }) // Set the status to 'archived'
        .eq('id', campaignId);

      if (error) {
        alert('Error archiving campaign: ' + error.message);
      } else {
        // Refresh the list of campaigns to make it disappear from the UI
        if (user) fetchCampaigns(user.id);
      }
    }
  };

  const handleCopyLink = (campaignSlug: string) => {
    // ... (This function is unchanged)
    const link = `${window.location.origin}/support/${campaignSlug}`;
    navigator.clipboard.writeText(link).then(() => {
      const campaign = campaigns.find(c => c.slug === campaignSlug);
      if (campaign) setCopiedId(campaign.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const formatDate = (dateString: string | null) => {
    // ... (This function is unchanged)
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
  };

  if (loading || userLoading) {
    return <div className="p-8 text-center">Loading your campaigns...</div>;
  }

  if (!user) {
    // ... (This code is unchanged)
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Please log in to manage your campaigns.</h1>
        <Link href="/login" className="text-blue-600 hover:underline">Go to Login</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Fundraising Campaigns</h1>
        <Link href="/campaigns/new" className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700">
          + New Campaign
        </Link>
      </div>
      
      {campaigns.length > 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <ul className="space-y-6">
            {campaigns.map((campaign) => (
              <li key={campaign.id} className="border-b pb-6 last:border-b-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{campaign.campaign_name}</h3>
                    <p className="text-gray-600">Goal: ${campaign.goal_amount.toLocaleString()}</p>
                    <div className="text-sm text-gray-500 mt-1">
                      <span>{formatDate(campaign.start_date)}</span> - <span>{formatDate(campaign.end_date)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 flex-shrink-0 ml-4">
                    <Link href={`/campaigns/${campaign.id}/edit`} className="text-sm font-medium text-blue-600 hover:text-blue-800">
                      Edit
                    </Link>
                    {/* --- NEW ARCHIVE BUTTON --- */}
                    <button onClick={() => handleArchive(campaign.id)} className="text-sm font-medium text-red-600 hover:text-red-800">
                      Archive
                    </button>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-gray-100 rounded-md flex items-center justify-between">
                  <div>
                    <label className="text-xs font-semibold text-gray-500">Your Shareable Link:</label>
                    <p className="text-sm text-blue-700 font-mono break-all">{`${typeof window !== 'undefined' ? window.location.origin : ''}/support/${campaign.slug}`}</p>
                  </div>
                  <button onClick={() => handleCopyLink(campaign.slug)} className="ml-4 px-3 py-1.5 text-xs font-semibold text-white bg-gray-600 rounded-md hover:bg-gray-700 flex-shrink-0">
                    {copiedId === campaign.id ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center bg-white p-12 rounded-lg shadow-md max-w-3xl mx-auto">
          {/* ... (This onboarding view is unchanged) ... */}
          <h1 className="text-3xl font-bold text-gray-900">Welcome to the Fundraiser Portal!</h1>
          <p className="text-gray-600 mt-2 mb-8">Let&apos;s get your first campaign up and running in a few simple steps.</p>
          <div className="text-left space-y-4 my-8 border-l-2 border-gray-200 pl-6">
            <h3 className="font-bold text-lg">1. Create Your Campaign</h3>
            <p className="text-gray-600">Click the button below to set up your fundraiser&apos;s page.</p>
            <h3 className="font-bold text-lg">2. Share Your Unique Link</h3>
            <p className="text-gray-600">We&apos;ll generate a special link for your campaign that you can share via email, text, and social media.</p>
            <h3 className="font-bold text-lg">3. Raise Money</h3>
            <p className="text-gray-600">Supporters purchase a membership, and a large portion of the proceeds goes directly to your group. It&apos;s that simple!</p>
          </div>
          <Link href="/campaigns/new" className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 text-lg">Create Your First Campaign</Link>
        </div>
      )}
    </div>
  );
}