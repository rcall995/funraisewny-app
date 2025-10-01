'use client';

import useUser from '@/hooks/useUser';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function DashboardPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [checkedRole, setCheckedRole] = useState(false);

  useEffect(() => {
    if (user && !checkedRole) {
      const checkUserRoleAndRedirect = async () => {
        // Check for a business profile first
        const { data: business, error: businessError } = await supabase
          .from('businesses')
          .select('id')
          .eq('owner_id', user.id)
          .single();

        if (business) {
          setCheckedRole(true);
          router.push('/merchant');
          return;
        }

        // If no business, check for a campaign
        const { data: campaign, error: campaignError } = await supabase
          .from('campaigns')
          .select('id')
          .eq('organizer_id', user.id)
          .limit(1)
          .single();
        
        if (campaign) {
          setCheckedRole(true);
          router.push('/campaigns');
          return;
        }

        // If neither, mark as checked and stay on this page
        setCheckedRole(true);
      };

      checkUserRoleAndRedirect();
    }
    
    // If the user is done loading and there is no user, redirect to login
    if (!user && !userLoading) {
      router.push('/login');
    }

  }, [user, checkedRole, userLoading, supabase, router]);

  // Show a generic loading state until the role check is complete
  if (userLoading || !checkedRole) {
    return <div className="min-h-screen flex items-center justify-center"><p>Loading and checking your role...</p></div>;
  }

  // If the user is logged in but has no specific role, show the hub
  if (user && checkedRole) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-3xl font-bold">Welcome to FunraiseWNY!</h1>
        <p className="mt-4 text-gray-600">You are logged in as <strong>{user.email}</strong>.</p>
        <p className="mt-4 text-gray-700">Get started by choosing your path:</p>
        <div className="mt-8 space-y-4 md:space-y-0 md:space-x-4">
          <Link 
            href="/merchant" 
            className="inline-block bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-blue-700"
          >
            I'm a Business Owner
          </Link>
          <Link 
            href="/campaigns" 
            className="inline-block bg-green-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-green-700"
          >
            I'm a Fundraiser
          </Link>
        </div>
      </div>
    );
  }

  // Fallback for when the user is not logged in but hasn't been redirected yet
  return <div className="min-h-screen flex items-center justify-center"><p>Redirecting...</p></div>;
}