'use client';
import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import useUser from '@/hooks/useUser';
import BusinessProfileForm from '@/components/BusinessProfileForm'; 
import Link from 'next/link';

export type BusinessProfile = {
  id: number;
  business_name: string;
  address: string;
  phone: string;
  logo_url: string | null; 
  contact_role: string | null;
};

// FIX 1: The 'Deal' type now uses 'status: string' to match your database.
export type Deal = {
  id: number;
  title: string;
  description: string;
  status: string; // Changed from is_active
  approval_status: string;
};

export default function MerchantDashboard() {
  const supabase = createClientComponentClient();
  const { user, loading: userLoading } = useUser();
  
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMerchantData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);

    const { data: profiles, error: profileError } = await supabase
      .from('businesses')
      .select('id, business_name, address, phone, logo_url, contact_role')
      .eq('owner_id', user.id);

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }
    
    const profile = profiles && profiles.length > 0 ? profiles[0] : null;
    setBusinessProfile(profile);

    if (profile) {
      // FIX 2: The database query now selects 'status' instead of 'is_active'.
      const { data: dealsData, error: dealsError } = await supabase
        .from('deals')
        .select('id, title, description, status, approval_status')
        .eq('business_id', profile.id)
        .order('created_at', { ascending: false });
      
      if (dealsError) {
        setError(dealsError.message);
      } else {
        setDeals(dealsData || []);
      }
    }

    setLoading(false);
  }, [user, supabase]);

  useEffect(() => {
    if (!userLoading) {
      fetchMerchantData();
    }
  }, [user, userLoading, fetchMerchantData]);

  // FIX 3: The toggle function now updates the 'status' column.
  const toggleDealStatus = async (dealId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const { error } = await supabase
      .from('deals')
      .update({ status: newStatus })
      .eq('id', dealId);

    if (error) {
      setError(error.message);
    } else {
      fetchMerchantData(); 
    }
  };

  if (userLoading || loading) {
    return <div className="text-center p-12">Loading merchant data...</div>;
  }
  
  if (!user) {
      return (
          <div className="text-center p-12">
              <p>Please log in to view your merchant dashboard.</p>
              <Link href="/login" className="text-blue-600 hover:underline">Go to Login</Link>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {!businessProfile ? (
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome!</h1>
            <p className="text-gray-600 mb-6">Let&apos;s set up your business profile to get started.</p>
            <BusinessProfileForm user={user} onSave={fetchMerchantData} initialData={null} />
          </div>
        ) : (
          <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {businessProfile.business_name}!
            </h1>
            
            <div className="bg-white p-6 rounded-lg shadow-md border">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Your Business Profile</h2>
              <BusinessProfileForm user={user} onSave={fetchMerchantData} initialData={businessProfile} />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Your Deals</h2>
                <Link href="/merchant/deals/new" className="inline-block bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition">
                  + Create New Deal
                </Link>
              </div>
              
              <div className="space-y-4">
                {deals.length > 0 ? (
                  deals.map(deal => (
                    <div key={deal.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                      <div>
                        <p className="font-semibold text-gray-800">{deal.title}</p>
                        {/* FIX 4: The display logic now checks deal.status. */}
                        <p className={`text-sm capitalize ${deal.status === 'active' ? 'text-green-500' : 'text-gray-500'}`}>
                          Merchant Status: {deal.status}
                        </p>
                        <p className={`text-sm font-semibold capitalize ${
                            deal.approval_status === 'approved' ? 'text-green-700' : 
                            deal.approval_status === 'rejected' ? 'text-red-700' : 'text-yellow-700'
                        }`}>
                            Admin Status: {deal.approval_status}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Link href={`/merchant/deals/${deal.id}/edit`} className="text-sm font-medium text-blue-600 hover:underline">
                          Edit
                        </Link>
                        {/* FIX 5: The button now uses deal.status. */}
                        <button
                          onClick={() => toggleDealStatus(deal.id, deal.status)}
                          className={`py-1 px-3 text-sm font-medium rounded-full ${
                            deal.status === 'active' 
                            ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          }`}
                        >
                          {deal.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">You haven&apos;t created any deals yet.</p>
                )}
              </div>
            </div>
            
            {error && <p className="mt-4 text-sm text-center text-red-600">{error}</p>}
          </div>
        )}
      </main>
    </div>
  );
}