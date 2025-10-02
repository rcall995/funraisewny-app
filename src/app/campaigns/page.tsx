'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import useUser from '@/hooks/useUser';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// --- Type Definitions ---
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

// --- Feather Icons (Simple SVG for common use) ---
const CopyIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v2M9 17v-5"></path></svg>
);
const FacebookIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.77-1.63 1.563V12h3.292l-.53 3.393h-2.762v6.987C18.343 21.128 22 16.991 22 12z" /></svg>
);
const TwitterIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.883L4.99 21.75H1.68l7.228-8.26L1.5 2.25h3.308l5.98 7.859L17.65 2.25h.594zm-2.774 15.65H15.1l-6.573-7.737L5.438 4.25H6.96l6.32 7.464L18.244 2.25h-1.554z" /></svg>
);

// --- Reusable Share Button Component ---
type ShareButtonProps = {
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
    bgColor: string;
    isCopied?: boolean;
};
const ShareButton: React.FC<ShareButtonProps> = ({ onClick, icon, label, bgColor, isCopied = false }) => (
    <button
        onClick={onClick}
        className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-white ${bgColor} rounded-md transition duration-150 ease-in-out hover:opacity-90`}
        aria-label={`Share on ${label}`}
    >
        {icon}
        <span>{isCopied ? 'Copied!' : label}</span>
    </button>
);


// --- Main Component ---
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

    const { data, error } = await supabase
      .from('campaigns')
      .select(`
        *,
        memberships (
          fundraiser_share,
          profiles ( full_name, email )
        )
      `)
      .eq('organizer_id', userId)
      .eq('status', view);

    if (error) {
      console.error('Error fetching campaigns:', error);
      setCampaigns([]);
    } else {
      setCampaigns(data as Campaign[]);
    }

    setLoading(false);
  }, [supabase, view]);

  useEffect(() => {
    if (user) {
      fetchCampaigns(user.id);
    } else if (!userLoading) {
      setLoading(false);
    }
  }, [user, userLoading, view, fetchCampaigns]);

  const handleEndCampaign = async (campaignId: number) => {
    if (window.confirm('Are you sure you want to end this campaign? It will be moved to your "Past Campaigns" list.')) {
      const { error } = await supabase
        .from('campaigns')
        .update({ status: 'ended' })
        .eq('id', campaignId);

      if (error) {
        alert('Error ending campaign: ' + error.message);
      } else {
        if (user) fetchCampaigns(user.id);
      }
    }
  };
  
  const getShareLink = (slug: string): string => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/support/${slug}`;
  };
  
  const handleCopyLink = (campaign: Campaign) => {
    const link = getShareLink(campaign.slug);
    navigator.clipboard.writeText(link).then(() => {
      setCopiedId(campaign.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const shareOnFacebook = (campaign: Campaign) => {
    const shareUrl = getShareLink(campaign.slug);
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(fbUrl, '_blank', 'width=600,height=400');
  };

  const shareOnTwitter = (campaign: Campaign) => {
    const shareUrl = getShareLink(campaign.slug);
    const text = `Support our fundraiser for ${campaign.campaign_name}! #funraisewny`;
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
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

      {/* --- TEMPORARY DEBUG LINE ADDED --- */}
      {user && <p className="text-red-500 font-mono text-xs mb-4">DEBUG: Logged in User ID is: {user.id}</p>}
      
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
            const shareableLink = getShareLink(campaign.slug);

            return (
              <div key={campaign.id} className={`bg-gray-50 p-6 rounded-lg shadow-md ${campaign.status === 'ended' ? 'opacity-70' : ''}`}>
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
                
                <div className="mt-4 p-4 rounded-lg border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-semibold mb-3 text-gray-700">Share Your Campaign</h3>
                  <div className="mt-2 flex flex-wrap gap-3">
                    <ShareButton
                        onClick={() => handleCopyLink(campaign)}
                        icon={<CopyIcon />}
                        label="Copy Link"
                        bgColor="bg-gray-600 hover:bg-gray-700"
                        isCopied={copiedId === campaign.id}
                    />
                    <ShareButton
                        onClick={() => shareOnFacebook(campaign)}
                        icon={<FacebookIcon />}
                        label="Facebook"
                        bgColor="bg-blue-800 hover:bg-blue-900"
                    />
                    <ShareButton
                        onClick={() => shareOnTwitter(campaign)}
                        icon={<TwitterIcon />}
                        label="X (Twitter)"
                        bgColor="bg-sky-500 hover:bg-sky-600"
                    />
                    <a 
                        href={`mailto:?subject=Support my fundraiser: ${campaign.campaign_name}&body=Please help me reach my goal for this great cause! Donate here: ${shareableLink}`}
                        className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-md transition duration-150 ease-in-out hover:opacity-90"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-2 4v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7"></path></svg>
                        <span>Email</span>
                    </a>
                  </div>
                </div>

                <div className="mt-4 border-b border-gray-200">
                  <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button onClick={() => setActiveTab({...activeTab, [campaign.id]: 'stats'})} className={`py-3 px-1 border-b-2 font-medium text-sm ${currentTab === 'stats' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Stats</button>
                    <button onClick={() => setActiveTab({...activeTab, [campaign.id]: 'supporters'})} className={`py-3 px-1 border-b-2 font-medium text-sm ${currentTab === 'supporters' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Supporters ({supportersCount})</button>
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
                        <ul className="mt-4 space-y-2 text-sm text-gray-700 max-h-48 overflow-y-auto">
                          {campaign.memberships.map((m, index) => (
                            <li key={index} className="p-2 bg-gray-50 rounded">
                              <strong>{m.profiles?.full_name || 'Anonymous Supporter'}</strong> (Raised: ${m.fundraiser_share.toLocaleString()})
                            </li>
                          ))}
                        </ul>
                      ) : ( <p className="text-sm text-gray-500 mt-2">No supporters yet.</p> )}
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