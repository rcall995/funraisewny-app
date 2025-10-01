'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import useUser from '@/hooks/useUser';

// Removed unnecessary imports like 'Metadata' and 'ResolvingMetadata' 
// if they existed, based on the build log warnings.
// Also ensuring the component accepts no props (or optional props).

// The component should accept no props, as this is a static route page.
// We remove the props definition entirely to resolve the Type error.
export default function NewCampaignPage() { 
  const supabase = createClientComponentClient();
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  
  const [campaignName, setCampaignName] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [startDate, setStartDate] = useState(''); 
  const [endDate, setEndDate] = useState('');    
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleCreateCampaign = async () => {
    if (!user) {
      setMessage('You must be logged in to create a campaign.');
      return;
    }
    if (!campaignName || !goalAmount) {
      setMessage('Campaign name and goal amount are required.');
      return;
    }
    
    setLoading(true);
    // Destructuring 'data' as '_data' to address the unused variable warning
    const { data: _data, error } = await supabase
      .from('campaigns')
      .insert({
        campaign_name: campaignName,
        goal_amount: parseFloat(goalAmount),
        organizer_id: user.id,
        start_date: startDate || null, 
        end_date: endDate || null, 
      })
      .select()
      .single();

    setLoading(false);
    if (error) {
      setMessage('Error creating campaign: ' + error.message);
    } else {
      router.push('/campaigns');
    }
  };

  if (userLoading) {
    return <div className="p-8">Loading user...</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Start a New Fundraiser</h1>
        <div className="space-y-4">
          <div>
            <label htmlFor="campaignName" className="block text-sm font-medium text-gray-700">Campaign Name</label>
            <input id="campaignName" type="text" value={campaignName} onChange={(e) => setCampaignName(e.target.value)} placeholder="e.g., Spring 2025 Football Season" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
          </div>
          <div>
            <label htmlFor="goalAmount" className="block text-sm font-medium text-gray-700">Fundraising Goal ($)</label>
            <input id="goalAmount" type="number" value={goalAmount} onChange={(e) => setGoalAmount(e.target.value)} placeholder="e.g., 5000" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
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
            onClick={handleCreateCampaign}
            disabled={loading}
            className="w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
          >
            {loading ? 'Creating...' : 'Create Campaign'}
          </button>
          {message && <p className={`mt-2 text-sm text-red-600`}>{message}</p>}
        </div>
      </div>
    </div>
  );
}
