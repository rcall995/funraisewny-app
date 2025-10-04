'use client';
import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import useUser from '@/hooks/useUser';
import BusinessProfileForm from '@/components/BusinessProfileForm'; 
import Link from 'next/link';

export type BusinessProfile = { id: number; business_name: string; address: string; phone: string; logo_url: string | null; contact_role: string | null; };
export type Deal = { id: number; title: string; description: string; status: string; approval_status: string; };

export default function MerchantDashboard() {
  const supabase = createClientComponentClient();
  const { user, loading: userLoading, isBusinessOwner } = useUser();
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMerchantData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    const { data: profiles } = await supabase.from('businesses').select('*').eq('owner_id', user.id);
    const profile = profiles && profiles.length > 0 ? profiles[0] : null;
    setBusinessProfile(profile);
    if (profile) {
      const { data: dealsData } = await supabase.from('deals').select('*').eq('business_id', profile.id).order('created_at', { ascending: false });
      setDeals(dealsData || []);
    }
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => { if (!userLoading) { fetchMerchantData(); } }, [user, userLoading, fetchMerchantData]);

  const toggleDealStatus = async (dealId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const { error } = await supabase.from('deals').update({ status: newStatus }).eq('id', dealId);
    if (error) { setError(error.message); } else { fetchMerchantData(); }
  };

  if (userLoading || loading) { return <div className="text-center p-12">Loading...</div>; }
  if (!user || !isBusinessOwner) { return <div className="text-center p-12"><p>Access Denied. You must be a business owner to view this page.</p></div>; }

  return (
    <div className="min-h-screen bg-gray-50"><main className="container mx-auto p-8">{!businessProfile ? ( <div> <h1 className="text-2xl font-bold">Welcome!</h1> <p>Let&apos;s set up your business profile.</p> <BusinessProfileForm user={user} onSave={fetchMerchantData} initialData={null} /> </div> ) : ( <div className="space-y-8"> <h1 className="text-3xl font-bold">Welcome back, {businessProfile.business_name}!</h1> <div className="bg-white p-6 rounded-lg shadow-md border"> <h2 className="text-xl font-bold mb-4">Your Business Profile</h2> <BusinessProfileForm user={user} onSave={fetchMerchantData} initialData={businessProfile} /> </div> <div className="bg-white p-6 rounded-lg shadow-md border"> <div className="flex justify-between items-center mb-4"> <h2 className="text-xl font-bold">Your Deals</h2> <Link href="/merchant/deals/new" className="bg-green-600 text-white font-semibold py-2 px-4 rounded-lg">+ Create New Deal</Link> </div> <div className="space-y-4">{deals.length > 0 ? ( deals.map(deal => ( <div key={deal.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50"> <div> <p className="font-semibold">{deal.title}</p> <p className={`text-sm capitalize ${deal.status === 'active' ? 'text-green-600' : 'text-gray-500'}`}>Merchant Status: {deal.status}</p> <p className={`text-sm font-semibold capitalize ${ deal.approval_status === 'approved' ? 'text-green-700' : deal.approval_status === 'rejected' ? 'text-red-700' : 'text-yellow-700' }`}>Admin Status: {deal.approval_status}</p> </div> <div className="flex items-center space-x-4"> <Link href={`/merchant/deals/${deal.id}/edit`} className="text-sm font-medium text-blue-600 hover:underline">Edit</Link> <button onClick={() => toggleDealStatus(deal.id, deal.status)} className={`py-1 px-3 text-sm font-medium rounded-full ${deal.status === 'active' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}> {deal.status === 'active' ? 'Deactivate' : 'Activate'} </button> </div> </div> )) ) : ( <p className="text-gray-500 text-center py-4">You haven&apos;t created any deals yet.</p> )}</div> </div> </div> )} </main> </div>
  );
}