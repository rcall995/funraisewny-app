'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import useUser from '@/hooks/useUser';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// The full type for a Campaign, which we will use again after the test
type Campaign = {
  id: number;
  slug: string;
  campaign_name: string;
  goal_amount: number;
  start_date: string | null;
  end_date: string | null;
  memberships: { fundraiser_share: number }[];
};

export default function CampaignsPage() {
  const { user, loading: userLoading } = useUser();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  // This function is now correctly placed INSIDE the component
  const fetchCampaigns = useCallback(async (userId: string) => {
    setLoading(true);
    
    // TEST QUERY: This is the simplified query for our diagnostic test.
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('organizer_id', userId)
      .eq('status', 'active');

    // These logs are the most important part!
    console.log('--- CAMPAIGN FETCH TEST ---');
    console.log('User ID Used:', userId);
    console.log('Data Received:', data);
    console.error('Error Received:', error);
    console.log('---------------------------');

    if (data) {
      // The 'as Campaign[]' tells TypeScript to trust us on the data shape for this test
      setCampaigns(data as Campaign[]);
    }
    setLoading(false);
  }, [supabase]); // We'll keep supabase here as a dependency for now

  useEffect(() => {
    if (user) {
      fetchCampaigns(user.id);
    }
    if (!user && !userLoading) {
      setLoading(false);
    }
  }, [user, userLoading, fetchCampaigns]);


  // The rest of your component's JSX remains the same
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

  // NOTE: This part will look a bit broken in the browser because our test query
  // isn't fetching the 'memberships' data. That's okay for now. We just need to
  // see if the main campaign data is being loaded.
  return (
    <div className="container mx-auto p-8">
      {campaigns.length > 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
           <h1 className="text-2xl font-bold text-gray-800 mb-4">Your Campaigns (Test View)</h1>
           <ul>
            {campaigns.map(c => <li key={c.id}>{c.campaign_name}</li>)}
           </ul>
        </div>
      ) : (
        <div className="text-center bg-white p-12 rounded-lg shadow-md max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Welcome to the Fundraiser Portal!</h1>
          <p className="text-gray-600 mt-2 mb-8">Let&apos;s get your first campaign up and running in a few simple steps.</p>
          <Link href="/campaigns/new" className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 text-lg">Create Your First Campaign</Link>
        </div>
      )}
    </div>
  );
}