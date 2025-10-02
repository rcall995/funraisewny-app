'use client';

import { useEffect, useState, useCallback } from 'react';
import useUser from '@/hooks/useUser';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function CampaignsPage() {
  const { user, loading: userLoading } = useUser();
  const [campaigns, setCampaigns] = useState<any[]>([]); // Using 'any' to prevent type errors during this test
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  const runDiagnostic = useCallback(async (userId: string) => {
    console.log('%c--- STARTING DIAGNOSTIC ---', 'color: blue; font-weight: bold;');
    setLoading(true);

    // Step 1: Fetch campaigns, ignoring the 'status' filter for this test.
    console.log('Step 1: Fetching campaigns for organizer_id:', userId);
    const { data: campaignsData, error: campaignsError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('organizer_id', userId);

    console.log('Step 1 Result - Campaigns Data:', campaignsData);
    console.error('Step 1 Result - Campaigns Error:', campaignsError);

    if (campaignsError || !campaignsData || campaignsData.length === 0) {
      console.log('%cDiagnostic End: No campaigns found or an error occurred at Step 1.', 'color: red; font-weight: bold;');
      setCampaigns([]);
      setLoading(false);
      return;
    }

    console.log(`Step 1 Success: Found ${campaignsData.length} campaign(s). The raw data is above.`);
    setCampaigns(campaignsData); // Set the raw data for display
    setLoading(false);
    console.log('%c--- DIAGNOSTIC COMPLETE ---', 'color: green; font-weight: bold;');
  }, [supabase]);

  useEffect(() => {
    if (user) {
      runDiagnostic(user.id);
    }
    if (!user && !userLoading) {
      setLoading(false);
    }
  }, [user, userLoading, runDiagnostic]);

  if (loading || userLoading) {
    return <div className="p-8 text-center">Running diagnostic...</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold">Campaigns Diagnostic Results</h1>
      <hr className="my-4" />
      {campaigns.length > 0 ? (
        <div>
          <h2 className="text-xl font-semibold text-green-600">Success! The database query found your campaigns.</h2>
          <p className="my-2">The list below confirms we are successfully reading the `campaigns` table:</p>
          <ul className="list-disc pl-5">
            {campaigns.map((c) => (
              <li key={c.id}>
                <strong>{c.campaign_name}</strong> (ID: {c.id}, Status: {c.status})
              </li>
            ))}
          </ul>
          <p className="mt-4">Please copy the entire content of the browser console and paste it in your reply.</p>
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-semibold text-red-600">Diagnostic Result: No campaigns were found.</h2>
          <p className="mt-4">This confirms the database query is returning an empty list. Please check your browser console. Copy the entire log, from "--- STARTING DIAGNOSTIC ---" to "--- DIAGNOSTIC COMPLETE ---", and paste it in your reply.</p>
        </div>
      )}
    </div>
  );
}