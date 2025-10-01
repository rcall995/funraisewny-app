'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import useUser from '@/hooks/useUser';

// Removed the separate type definition to avoid conflict with Next.js internal PageProps type.
// We define the expected props directly on the component function signature.
export default function EditCampaignPage({ params }: { params: { id: string } }) {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const campaignId = params.id;

  const [campaignName, setCampaignName] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [startDate, setStartDate] = useState(''); // <-- New state
  const [endDate, setEndDate] = useState('');    // <-- New state
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchCampaign = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    // Destructure 'error' as '_error' to silence potential unused variable warnings
    const { data, error: _error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .eq('organizer_id', user.id)
      .single();
    
    setLoading(false);
    // Use the renamed variable here, and also check for data existence
    if (_error || !data) { 
      setMessage('Campaign not found or you do not have permission to edit it.');
      return;
    }

    setCampaignName(data.campaign_name);
    setGoalAmount(data.goal_amount.toString());
    // Pre-fill date fields. Slice to get YYYY-MM-DD format.
    setStartDate(data.start_date ? data.start_date.slice(0, 10) : '');
    setEndDate(data.end_date ? data.end_date.slice(0, 10) : '');

  }, [supabase, campaignId, user]);

  useEffect(() => {
    // Only fetch if we have a user
    if(user) {
      fetchCampaign();
    }
  }, [user, fetchCampaign]);


  const handleUpdateCampaign = async () => {
    if (!campaignName || !goalAmount) {
      setMessage('Campaign name and goal amount are required.');
      return;
    }
    
    setLoading(true);
    const { error } = await supabase
      .from('campaigns')
      .update({
        campaign_name: campaignName,
        goal_amount: parseFloat(goalAmount),
        start_date: startDate || null, // <-- Add to update
        end_date: endDate || null,     // <-- Add to update
      })
      .eq('id', campaignId);

    setLoading(false);
    if (error) {
      setMessage('Error updating campaign: ' + error.message);
    } else {
      router.push('/campaigns');
    }
  };

  if (userLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Edit Your Fundraiser</h1>
        <div className="space-y-4">
          <div>
            <label htmlFor="campaignName" className="block text-sm font-medium text-gray-700">Campaign Name</label>
            <input id="campaignName" type="text" value={campaignName} onChange={(e) => setCampaignName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
          </div>
          <div>
            <label htmlFor="goalAmount" className="block text-sm font-medium text-gray-700">Fundraising Goal ($)</label>
            <input id="goalAmount" type="number" value={goalAmount} onChange={(e) => setGoalAmount(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
          </div>
           {/* --- New Date Fields --- */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
              <input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
              <input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
            </div>
          </div>
          {/* -------------------- */}
          <button
            onClick={handleUpdateCampaign}
            disabled={loading}
            className="w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
          >
            {loading ? 'Updating...' : 'Update Campaign'}
          </button>
          {message && <p className={`mt-2 text-sm text-red-600`}>{message}</p>}
        </div>
      </div>
    </div>
  );
}
