'use client';

import { useState, useEffect, useCallback } from 'react';
import BusinessProfileForm from './BusinessProfileForm';
import useUser from '@/hooks/useUser';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// --- SHARED TYPE DEFINITION (Defined once here to fix the "Two different types" error) ---
type BusinessProfile = {
  id: number;
  business_name: string;
  address: string;
  phone: string;
  logo_url: string | null; 
};

export default function MerchantPage() {
    const { user, loading: userLoading } = useUser();
    const router = useRouter();
    const supabase = createClientComponentClient();

    const [profile, setProfile] = useState<BusinessProfile | null>(null);
    const [pageLoading, setPageLoading] = useState(true);
    const [isEditingProfile, setIsEditingProfile] = useState(false);

    // 1. Fetch Existing Profile
    const fetchProfile = useCallback(async (userId: string) => {
        setPageLoading(true);
        const { data, error } = await supabase
            .from('businesses')
            .select('id, business_name, address, phone, logo_url') // Selects the new logo_url field
            .eq('owner_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is 'No rows found'
            console.error('Error loading business profile:', error);
        }

        if (data) {
            setProfile(data as BusinessProfile);
            setIsEditingProfile(false);
        } else {
            setProfile(null);
            setIsEditingProfile(true); // Automatically open the form for new users
        }
        setPageLoading(false);
    }, [supabase]);

    useEffect(() => {
        if (user && !userLoading) {
            fetchProfile(user.id);
        } else if (!user && !userLoading) {
            // Redirect unauthenticated users
            router.push('/login');
        }
    }, [user, userLoading, fetchProfile, router]);

    const handleFormSave = () => {
        // After save, refresh the profile data
        if (user) {
            fetchProfile(user.id);
        }
        setIsEditingProfile(false);
    };

    if (userLoading || pageLoading) {
        return <div className="p-8 text-center">Loading merchant dashboard...</div>;
    }

    if (!user) return null; 
    
    // Fallback image source if the business hasn't set one yet
    const fallbackLogo = profile?.logo_url || '/placeholder.svg'; // Use a basic placeholder URL

    // --- Component Rendering ---
    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="container mx-auto p-4 max-w-2xl">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Merchant Dashboard</h1>

                {/* Profile Form / View Container */}
                <div className="bg-white p-6 rounded-lg shadow-xl">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Business Profile</h2>
                        
                        {!isEditingProfile && profile && (
                            <button
                                onClick={() => setIsEditingProfile(true)}
                                className="text-sm font-medium text-blue-600 hover:text-blue-800"
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>
                    
                    {!profile || isEditingProfile ? (
                        // Pass the required props to the child component
                        <BusinessProfileForm 
                            user={user} 
                            onSave={handleFormSave} 
                            initialData={profile} 
                        />
                    ) : (
                        <div className="space-y-3">
                            <div className="flex items-center space-x-4">
                                <img
                                    src={fallbackLogo}
                                    alt={`${profile.business_name} logo`}
                                    className="w-16 h-16 object-contain rounded-full border shadow-sm"
                                    onError={(e) => {
                                        // Fallback if the URL fails to load
                                        e.currentTarget.src = '/placeholder.svg'; 
                                    }}
                                />
                                <div>
                                    <p className="text-lg font-bold">{profile.business_name}</p>
                                    <p className="text-sm text-gray-500">Owner: {user.email}</p>
                                </div>
                            </div>
                            <p><strong>Address:</strong> {profile.address}</p>
                            <p><strong>Phone:</strong> {profile.phone}</p>
                            <p><strong>Logo URL:</strong> <a href={profile.logo_url || '#'} target="_blank" rel="noopener noreferrer" className="text-blue-500 break-all hover:underline">{profile.logo_url || 'None set'}</a></p>
                        </div>
                    )}
                </div>

                {/* Placeholder for Deals Management */}
                <div className="mt-8 p-6 bg-white rounded-lg shadow-xl">
                    <h2 className="text-xl font-semibold mb-3">Your Deals</h2>
                    <p className="text-gray-600">Deal management features will go here.</p>
                    <Link href="/merchant/deals/new" className="mt-4 inline-block text-blue-600 hover:underline">
                        + Create New Deal
                    </Link>
                </div>
            </div>
        </div>
    );
}
