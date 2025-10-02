'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import useUser from '@/hooks/useUser';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type Membership = {
  fundraiser_share: number;
  profiles: { full_name: string; email: string; } | null;
};
type Campaign = {
  id: number;
  slug: string;
  campaign_name: string;
  goal_amount: number;
  start_date: string | null;
  end_date: string | null;
  status: string;
  memberships: Membership[];
};

export default function CampaignsPage() {
  const { user, loading: userLoading } = useUser();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [view, setView] = useState<'active' | 'ended'>('active');
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<{ [key: number]: string }>({});
  const supabase = createClientComponentClient();

  const fetchCampaigns = useCallback(async (userId: string) => {
    setLoading(true);
    const { data: campaignsData, error: campaignsError } = await supabase
      .from('campaigns').select('*').eq('organizer_id', userId).eq('status', view);

    if (campaignsError || !campaignsData || campaignsData.length === 0) {
      setCampaigns([]); setLoading(false); return;
    }

    const campaignIds = campaignsData.map(c => c.id);
    const { data: membershipsData } = await supabase.from('memberships').select('*, profiles (full_name, email)').in('campaign_id', campaignIds);

    const campaignsWithMemberships = campaignsData.map(campaign => ({
      ...campaign,
      memberships: membershipsData ? membershipsData.filter(m => m.campaign_id === campaign.id) : [],
    }));

    setCampaigns(campaignsWithMemberships as Campaign[]);
    setLoading(false);
  }, [supabase, view]);

  useEffect(() => {
    if (user) fetchCampaigns(user.id);
    if (!user && !userLoading) setLoading(false);
  }, [user, userLoading, fetchCampaigns]);

  const handleEndCampaign = async (campaignId: number) => {
    if (window.confirm('Are you sure you want to end this campaign? It will be moved to your "Past Campaigns" list.')) {
      const { error } = await supabase.from('campaigns').update({ status: 'ended' }).eq('id', campaignId);
      if (error) { alert('Error ending campaign: ' + error.message); } 
      else { if (user) fetchCampaigns(user.id); }
    }
  };
  
  const handleCopyLink = (campaign: Campaign) => {
    const link = `${window.location.origin}/support/${campaign.slug}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedId(campaign.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const shareOnFacebook = (campaign: Campaign) => {
    const shareUrl = `${window.location.origin}/support/${campaign.slug}`;
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(fbUrl, '_blank');
  };

  const shareOnTwitter = (campaign: Campaign) => {
    const shareUrl = `${window.location.origin}/support/${campaign.slug}`;
    const text = `Support our fundraiser for ${campaign.campaign_name}! #funraisewny`;
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
    window.open(twitterUrl, '_blank');
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    });
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Fundraising Campaigns</h1>
        {view === 'active' && (
          <Link href="/campaigns/new" className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700">
            + New Campaign
          </Link>
        )}
      </div>
      
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-6">
          <button onClick={() => setView('active')} className={`py-3 px-1 border-b-2 font-medium text-sm ${view === 'active' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Active</button>
          <button onClick={() => setView('ended')} className={`py-3 px-1 border-b-2 font-medium text-sm ${view === 'ended' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Past Campaigns</button>
        </nav>
      </div>

      {campaigns.length > 0 ? (
        <div className="space-y-8">
          {campaigns.map((campaign) => {
            const totalRaised = campaign.memberships.reduce((sum, m) => sum + (m.fundraiser_share || 0), 0);
            const supportersCount = campaign.memberships.length;
            const progressPercentage = campaign.goal_amount > 0 ? (totalRaised / campaign.goal_amount) * 100 : 0;
            const currentTab = activeTab[campaign.id] || 'stats';

            return (
              <div key={campaign.id} className={`bg-white p-6 rounded-lg shadow-md ${campaign.status === 'ended' ? 'opacity-70 bg-gray-50' : ''}`}>
                <div className="flex justify-between items-start border-b border-gray-200 pb-4">
                  <div>
                    <h2 className="text-2xl font-semibold">{campaign.campaign_name}</h2>
                    <p className="text-sm text-gray-500 mt-1">Goal: ${campaign.goal_amount.toLocaleString()}</p>
                    <div className="text-xs text-gray-400 mt-2 font-medium">
                      <span>{formatDate(campaign.start_date)}</span> - <span>{formatDate(campaign.end_date)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {campaign.status === 'active' && (<Link href={`/campaigns/${campaign.id}/edit`} className="text-sm font-medium text-blue-600 hover:text-blue-800">Edit</Link>)}
                    {campaign.status === 'active' && (<button onClick={() => handleEndCampaign(campaign.id)} className="text-sm font-medium text-red-600 hover:text-red-800">End Campaign</button>)}
                  </div>
                </div>
                
                 <div className="mt-4 border-b border-gray-200">
                   <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                     <button onClick={() => setActiveTab({...activeTab, [campaign.id]: 'stats'})} className={`py-3 px-1 border-b-2 font-medium text-sm ${currentTab === 'stats' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Stats</button>
                     <button onClick={() => setActiveTab({...activeTab, [campaign.id]: 'supporters'})} className={`py-3 px-1 border-b-2 font-medium text-sm ${currentTab === 'supporters' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Supporters ({supportersCount})</button>
                     <button onClick={() => setActiveTab({...activeTab, [campaign.id]: 'share'})} className={`py-3 px-1 border-b-2 font-medium text-sm ${currentTab === 'share' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Share</button>
                   </nav>
                 </div>

                 <div className="mt-6">
                   {currentTab === 'stats' && (
                     <div>
                       <div className="flex justify-between items-end mb-1">
                         <p className="text-3xl font-bold text-green-600">${totalRaised.toLocaleString()}</p>
                         <p className="text-sm text-gray-500">{supportersCount} {supportersCount === 1 ? 'supporter' : 'supporters'}</p>
                       </div>
                       <div className="w-full bg-gray-200 rounded-full h-4"><div className="bg-green-600 h-4 rounded-full text-white text-xs flex items-center justify-center" style={{ width: `${progressPercentage > 100 ? 100 : progressPercentage}%` }}>{progressPercentage.toFixed(0)}%</div></div>
                     </div>
                   )}

                   {currentTab === 'supporters' && (
                     <div>
                       <h3 className="text-lg font-semibold">Supporter List</h3>
                       {supportersCount > 0 ? (
                         <ul className="mt-4 space-y-2 text-sm text-gray-700">
                           {campaign.memberships.map((m, index) => (
                             <li key={index} className="p-2 bg-gray-50 rounded">
                               {m.profiles?.full_name || 'Anonymous Supporter'} ({m.profiles?.email || 'No email provided'})
                             </li>
                           ))}
                         </ul>
                       ) : ( <p className="text-sm text-gray-500 mt-2">No supporters yet.</p> )}
                     </div>
                   )}

                   {currentTab === 'share' && (
                     <div>
                       <h3 className="text-lg font-semibold mb-2">Share Your Campaign</h3>
                       <div className="p-3 bg-gray-100 rounded-md">
                         <label className="text-xs font-semibold text-gray-500">Your Shareable Link:</label>
                         <p className="text-sm text-blue-700 font-mono break-all">{`${typeof window !== 'undefined' ? window.location.origin : ''}/support/${campaign.slug}`}</p>
                       </div>
                       <div className="mt-4 flex flex-wrap gap-4">
                         <button onClick={() => handleCopyLink(campaign)} className="px-4 py-2 text-sm font-semibold text-white bg-gray-600 rounded-md hover:bg-gray-700">{copiedId === campaign.id ? 'Copied!' : 'Copy Link'}</button>
                         <button onClick={() => shareOnFacebook(campaign)} className="px-4 py-2 text-sm font-semibold text-white bg-blue-800 rounded-md hover:bg-blue-900">Share on Facebook</button>
                         <button onClick={() => shareOnTwitter(campaign)} className="px-4 py-2 text-sm font-semibold text-white bg-sky-500 rounded-md hover:bg-sky-600">Share on Twitter</button>
                       </div>
                     </div>
                   )}
                 </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center bg-white p-12 rounded-lg shadow-md">
          {view === 'active' ? (
            <>
              <h2 className="text-xl font-semibold text-gray-700">You have no active campaigns.</h2>
              <Link href="/campaigns/new" className="mt-6 inline-block bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700">Create a Campaign</Link>
            </>
          ) : (
            <p className="text-gray-600">You have no past campaigns.</p>
          )}
        </div>
      )}
    </div>
  );
}