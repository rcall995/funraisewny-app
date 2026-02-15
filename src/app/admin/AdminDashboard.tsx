'use client';

import { useState, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { AdminDeal, PlatformStats } from './page';

type TabFilter = 'pending' | 'approved' | 'rejected' | 'all';

export default function AdminDashboard({
  initialDeals,
  initialStats,
}: {
  initialDeals: AdminDeal[];
  initialStats: PlatformStats;
}) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [deals, setDeals] = useState<AdminDeal[]>(initialDeals);
  const [stats, setStats] = useState<PlatformStats>(initialStats);
  const [activeTab, setActiveTab] = useState<TabFilter>('pending');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  const refreshDeals = useCallback(async () => {
    const { data } = await supabase
      .from('deals')
      .select('id, title, description, category, terms, status, approval_status, created_at, businesses(business_name, address, logo_url)')
      .order('created_at', { ascending: false });

    if (data) {
      const refreshed = (data as unknown as AdminDeal[]).map(d => ({
        ...d,
        businesses: Array.isArray(d.businesses) ? d.businesses[0] ?? null : d.businesses,
      }));
      setDeals(refreshed);
      setStats(prev => ({
        ...prev,
        dealsByStatus: {
          pending: refreshed.filter(d => d.approval_status === 'pending').length,
          approved: refreshed.filter(d => d.approval_status === 'approved').length,
          rejected: refreshed.filter(d => d.approval_status === 'rejected').length,
        },
      }));
    }
  }, [supabase]);

  const updateApproval = async (dealId: number, newStatus: 'approved' | 'rejected') => {
    setActionLoading(dealId);
    const { error } = await supabase
      .from('deals')
      .update({ approval_status: newStatus })
      .eq('id', dealId);

    if (error) {
      showFeedback('error', `Failed to ${newStatus} deal: ${error.message}`);
    } else {
      showFeedback('success', `Deal ${newStatus} successfully.`);
      await refreshDeals();
    }
    setActionLoading(null);
  };

  const filteredDeals = activeTab === 'all'
    ? deals
    : deals.filter(d => d.approval_status === activeTab);

  const tabs: { key: TabFilter; label: string; count?: number }[] = [
    { key: 'pending', label: 'Pending', count: stats.dealsByStatus.pending },
    { key: 'approved', label: 'Approved', count: stats.dealsByStatus.approved },
    { key: 'rejected', label: 'Rejected', count: stats.dealsByStatus.rejected },
    { key: 'all', label: 'All', count: deals.length },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        {/* Feedback Banner */}
        {feedback && (
          <div className={`mb-6 p-4 rounded-lg font-medium ${
            feedback.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {feedback.message}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Active Campaigns</p>
            <p className="text-3xl font-bold text-blue-600">{stats.activeCampaigns}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Total Memberships</p>
            <p className="text-3xl font-bold text-green-600">{stats.totalMemberships}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Total Businesses</p>
            <p className="text-3xl font-bold text-purple-600">{stats.totalBusinesses}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Deals Pending Review</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.dealsByStatus.pending}</p>
          </div>
        </div>

        {/* Deal Management */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Deal Management</h2>
            <div className="flex space-x-2">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-6 py-2 rounded-lg font-medium transition ${
                    activeTab === tab.key
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {tab.label} {tab.count !== undefined && `(${tab.count})`}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {filteredDeals.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No {activeTab === 'all' ? '' : activeTab} deals found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredDeals.map(deal => (
                  <div key={deal.id} className="p-5 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{deal.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{deal.description}</p>
                        {deal.terms && (
                          <p className="text-sm text-gray-500 mt-1">
                            <span className="font-medium">Terms:</span> {deal.terms}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                          <span>
                            <span className="font-medium">Category:</span> {deal.category}
                          </span>
                          <span>
                            <span className="font-medium">Business:</span>{' '}
                            {deal.businesses?.business_name || 'Unknown'}
                          </span>
                          {deal.businesses?.address && (
                            <span>
                              <span className="font-medium">Address:</span> {deal.businesses.address}
                            </span>
                          )}
                          <span>
                            <span className="font-medium">Merchant Status:</span>{' '}
                            <span className={deal.status === 'active' ? 'text-green-600' : 'text-gray-500'}>
                              {deal.status}
                            </span>
                          </span>
                          <span>
                            <span className="font-medium">Created:</span>{' '}
                            {new Date(deal.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        {/* Status badge */}
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                          deal.approval_status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : deal.approval_status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {deal.approval_status}
                        </span>

                        {/* Action buttons */}
                        {deal.approval_status !== 'approved' && (
                          <button
                            onClick={() => updateApproval(deal.id, 'approved')}
                            disabled={actionLoading === deal.id}
                            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                          >
                            {actionLoading === deal.id ? '...' : 'Approve'}
                          </button>
                        )}
                        {deal.approval_status !== 'rejected' && (
                          <button
                            onClick={() => updateApproval(deal.id, 'rejected')}
                            disabled={actionLoading === deal.id}
                            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                          >
                            {actionLoading === deal.id ? '...' : 'Reject'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
