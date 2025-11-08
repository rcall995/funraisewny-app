// src/app/campaigns/page.tsx

'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import useUser from '@/hooks/useUser';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

// --- Type Definitions ---
type Membership = {
  fundraiser_share: number;
  profiles: {
    full_name: string | null;
  } | null;
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

// --- Feather Icon Components ---
const LinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

// --- ShareButton Component ---
const ShareButton = ({ url, campaignName, copiedId, setCopiedId, campaignId }: {
  url: string;
  campaignName: string;
  copiedId: number | null;
  setCopiedId: (id: number | null) => void;
  campaignId: number;
}) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(campaignId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
    >
      {copiedId === campaignId ? <CheckIcon /> : <LinkIcon />}
      <span>{copiedId === campaignId ? 'Copied!' : 'Copy Link'}</span>
    </button>
  );
};

// --- Main Component ---
export default function CampaignsPage() {
  const { user, loading: userLoading, profile } = useUser();
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [view, setView] = useState<'active' | 'ended'>('active');
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<{ [key: number]: string }>({});
  const supabase = createClientComponentClient();

  const fetchCampaigns = useCallback(async (userId: string) => {
    console.log('fetchCampaigns called for user:', userId, 'view:', view);
    setLoading(true);

    try {
      // First, just get campaigns without memberships
      console.log('Fetching campaigns from database...');
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('organizer_id', userId)
        .eq('status', view);

      console.log('Campaign query result - data:', data, 'error:', error);

      if (error) {
        console.error('Campaign fetch error:', error);
        setCampaigns([]);
        setLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        console.log('No campaigns found');
        setCampaigns([]);
        setLoading(false);
        return;
      }

      // For each campaign, fetch memberships separately
      console.log('Fetching memberships for', data.length, 'campaigns');
      const campaignsWithMemberships = await Promise.all(
        data.map(async (campaign) => {
          // Fetch memberships without the join first
          const { data: membershipData, error: membershipError } = await supabase
            .from('memberships')
            .select('user_id, fundraiser_share')
            .eq('campaign_id', campaign.id);

          if (membershipError) {
            console.error('Error fetching memberships:', membershipError);
            return {
              ...campaign,
              memberships: [],
            };
          }

          // Now fetch profile names separately
          const membershipsWithProfiles = await Promise.all(
            (membershipData || []).map(async (membership) => {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', membership.user_id)
                .single();

              return {
                fundraiser_share: membership.fundraiser_share,
                profiles: profileData ? { full_name: profileData.full_name } : null,
              };
            })
          );

          return {
            ...campaign,
            memberships: membershipsWithProfiles,
          };
        })
      );

      console.log('Final campaigns with memberships:', campaignsWithMemberships);
      setCampaigns(campaignsWithMemberships as Campaign[]);
    } catch (err) {
      console.error('Unexpected error fetching campaigns:', err);
      setCampaigns([]);
    }

    setLoading(false);
    console.log('fetchCampaigns completed');
  }, [supabase, view]);

  useEffect(() => {
    console.log('useEffect triggered - user:', user, 'userLoading:', userLoading);

    if (user) {
      console.log('Fetching campaigns for user:', user.id);
      fetchCampaigns(user.id);
    } else if (!userLoading) {
      console.log('No user, stopping loading');
      setLoading(false);
    }
  }, [user, userLoading, view, fetchCampaigns]);

  const handleEndCampaign = async (campaignId: number) => {
    if (!confirm('Are you sure you want to end this campaign? This action cannot be undone.')) {
      return;
    }

    const { error } = await supabase
      .from('campaigns')
      .update({ status: 'ended' })
      .eq('id', campaignId);

    if (error) {
      console.error('Error ending campaign:', error);
      alert('Failed to end campaign. Please try again.');
    } else {
      if (user) fetchCampaigns(user.id);
    }
  };

  const getShareLink = (slug: string) => {
    return `${window.location.origin}/support/${slug}`;
  };

  // Final Render Guards
  if (userLoading || loading) {
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
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto p-8">
        {/* Header with New Campaign Button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Your Fundraising Campaigns</h1>
          {view === 'active' && (
            <Link
              href="/campaigns/new"
              className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition shadow-md"
            >
              + New Campaign
            </Link>
          )}
        </div>

        {/* View Toggle Buttons */}
        <div className="flex space-x-2 mb-8">
          <button
            onClick={() => setView('active')}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              view === 'active'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            Active Campaigns
          </button>
          <button
            onClick={() => setView('ended')}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              view === 'ended'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            Ended Campaigns
          </button>
        </div>

        {/* Campaign Cards */}
        {campaigns.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow-md text-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              {view === 'active' ? 'No Active Campaigns' : 'No Ended Campaigns'}
            </h2>
            <p className="text-gray-500 mb-6">
              {view === 'active'
                ? 'Create your first campaign to start fundraising!'
                : 'You have not ended any campaigns yet.'}
            </p>
            {view === 'active' && (
              <Link
                href="/campaigns/new"
                className="inline-block bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 transition"
              >
                Create Your First Campaign
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {campaigns.map((campaign) => {
              const members = campaign.memberships || [];
              const totalMembers = members.length;
              const totalRevenue = members.reduce((sum, m) => sum + (m.fundraiser_share || 0), 0);

              return (
                <div key={campaign.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                  {/* Campaign Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">{campaign.campaign_name}</h2>
                      <p className="text-sm text-gray-500">
                        Goal: ${campaign.goal_amount?.toLocaleString() || '0'}
                      </p>
                    </div>
                    {view === 'active' && (
                      <div className="flex space-x-3">
                        <Link
                          href={`/campaigns/${campaign.id}/edit`}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleEndCampaign(campaign.id)}
                          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm font-medium"
                        >
                          End Campaign
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Campaign Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Total Members</p>
                      <p className="text-3xl font-bold text-blue-600">{totalMembers}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Your Share</p>
                      <p className="text-3xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Progress</p>
                      <p className="text-3xl font-bold text-purple-600">
                        {campaign.goal_amount ? Math.round((totalRevenue / campaign.goal_amount) * 100) : 0}%
                      </p>
                    </div>
                  </div>

                  {/* Share Section */}
                  {view === 'active' && (
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700 mb-2">Share Your Campaign:</p>
                          <p className="text-xs text-gray-500 break-all">
                            {getShareLink(campaign.slug)}
                          </p>
                        </div>
                        <ShareButton
                          url={getShareLink(campaign.slug)}
                          campaignName={campaign.campaign_name}
                          copiedId={copiedId}
                          setCopiedId={setCopiedId}
                          campaignId={campaign.id}
                        />
                      </div>
                    </div>
                  )}

                  {/* Members Tab Section (Optional - can show member list) */}
                  {totalMembers > 0 && (
                    <div className="border-t mt-4 pt-4">
                      <button
                        onClick={() => setActiveTab(prev => ({ ...prev, [campaign.id]: prev[campaign.id] === 'members' ? '' : 'members' }))}
                        className="text-sm text-blue-600 hover:underline font-medium"
                      >
                        {activeTab[campaign.id] === 'members' ? 'Hide Members' : `View All ${totalMembers} Members`}
                      </button>

                      {activeTab[campaign.id] === 'members' && (
                        <div className="mt-4 space-y-2">
                          {members.map((member, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                              <span className="text-sm font-medium text-gray-700">
                                {member.profiles?.full_name || 'Anonymous Supporter'}
                              </span>
                              <span className="text-sm text-green-600 font-semibold">
                                +${member.fundraiser_share?.toFixed(2) || '0.00'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
