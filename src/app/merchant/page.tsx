'use client'; 

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { User } from '@supabase/supabase-js';
// No longer need to import SignOutButton here
import BusinessProfileForm from './BusinessProfileForm';
import DealForm from './DealForm';

type BusinessProfile = {
  id: number;
  business_name: string;
  address: string;
  phone: string;
};
type Deal = {
  id: number;
  title: string;
  description: string;
  fine_print: string | null;
};

export default function MerchantDashboardPage() { // Renamed for clarity
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | 'new' | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const fetchAllData = useCallback(async (user: User) => {
    setLoading(true);
    const { data: profileData } = await supabase.from('businesses').select('*').eq('owner_id', user.id).single();
    if (profileData) {
      setProfile(profileData);
      const { data: dealsData } = await supabase.from('deals').select('*').eq('business_id', profileData.id).order('created_at', { ascending: false });
      if (dealsData) setDeals(dealsData);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    async function getUserAndData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        await fetchAllData(user);
      } else {
        router.push('/login');
      }
    }
    getUserAndData();
  }, [supabase, router, fetchAllData]);

  const handleFormSave = () => {
    if(user) fetchAllData(user);
    setIsEditingProfile(false);
    setEditingDeal(null);
  }
  
  if (loading) {
    return <div className="p-8 text-center">Loading your merchant data...</div>;
  }

  // The main page content starts here, without the redundant header elements
  return (
    <div className="container mx-auto p-8">
      {/* Business Profile Section */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Your Business Profile</h2>
          {profile && !isEditingProfile && (
            <button onClick={() => setIsEditingProfile(true)} className="text-sm font-medium text-blue-600 hover:text-blue-800">Edit Profile</button>
          )}
        </div>

        {!profile || isEditingProfile ? (
          <BusinessProfileForm user={user!} onSave={handleFormSave} initialData={profile} />
        ) : (
          <div className="p-4 bg-slate-50 rounded-lg">
            <p><strong>Business Name:</strong> {profile.business_name}</p>
            <p><strong>Address:</strong> {profile.address}</p>
            <p><strong>Phone:</strong> {profile.phone}</p>
          </div>
        )}
      </div>

      {/* Deals Section */}
      {profile && !isEditingProfile && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Your Deals</h2>
            {editingDeal === null && (
              <button onClick={() => setEditingDeal('new')} className="text-sm font-medium text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded-md shadow">Add New Deal</button>
            )}
          </div>
          
          {editingDeal === null ? (
            deals.length > 0 ? (
              <ul className="space-y-3">
                {deals.map((deal) => (
                  <li key={deal.id} className="p-3 bg-slate-50 rounded-lg flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{deal.title}</h3>
                      <p className="text-sm text-gray-600">{deal.description}</p>
                    </div>
                    <button onClick={() => setEditingDeal(deal)} className="text-sm font-medium text-blue-600 hover:text-blue-800 ml-4">Edit</button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">You haven't added any deals yet. Click "Add New Deal" to get started.</p>
            )
          ) : (
            <DealForm 
              businessId={profile.id} 
              onSave={handleFormSave}
              onCancel={() => setEditingDeal(null)}
              initialData={editingDeal === 'new' ? null : editingDeal}
            />
          )}
        </div>
      )}
    </div>
  );
}