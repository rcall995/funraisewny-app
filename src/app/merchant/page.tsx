'use client'; 

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { User } from '@supabase/supabase-js';
import SignOutButton from '@/components/SignOutButton';
import BusinessProfileForm from './BusinessProfileForm';
import DealForm from './DealForm'; // <-- Updated import name

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

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | 'new' | null>(null); // <-- State to manage deal form
  const router = useRouter();
  const supabase = createClientComponentClient();

  const fetchAllData = useCallback(async (user: User) => {
    // No need to set loading here, can be handled more granularly
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
    return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-8">
      <div className="w-full max-w-4xl bg-white p-8 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Merchant Dashboard</h1>
            {user && <p className="text-gray-600">Logged in as: <strong>{user.email}</strong></p>}
          </div>
          <SignOutButton />
        </div>
        
        <hr className="my-6" />

        {/* Business Profile Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Your Business Profile</h2>
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

        {/* Deals Section - only shown if a profile exists and we are NOT editing the profile */}
        {profile && !isEditingProfile && (
          <div>
            <hr className="my-6" />
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700">Your Deals</h2>
              {editingDeal === null && (
                <button onClick={() => setEditingDeal('new')} className="text-sm font-medium text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded-md">Add New Deal</button>
              )}
            </div>
            
            {editingDeal === null ? (
              // If we are NOT editing a deal, show the list of deals
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
              // If we ARE editing a deal, show the form
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
    </div>
  );
}