'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import useUser from '@/hooks/useUser';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

/* eslint-disable @next/next/no-img-element */

// --- Type Definitions ---
type Campaign = {
  id: number;
  campaign_name: string;
  description: string;
  logo_url: string | null;
  slug: string; 
};

// This is our simplified type for what we display
type SupporterDisplayInfo = {
  name: string;
};

export default function SupportPage() {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [supporters, setSupporters] = useState<SupporterDisplayInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  // State for Name Input
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nameError, setNameError] = useState('');
  
  const supabase = createClientComponentClient();
  const router = useRouter();
  const params = useParams();
  const { user } = useUser();
  const slug = params.slug as string;

  // Function to format name as "First Name L."
  const formatSupporterName = useCallback((fullName: string | null) => {
    if (!fullName) return 'An anonymous supporter';
    const parts = fullName.trim().split(/\s+/);
    const first = parts[0];
    const lastName = parts.length > 1 ? parts[parts.length - 1] : '';
    const lastInitial = lastName.charAt(0);
    
    if (first && lastInitial) {
        return `${first} ${lastInitial}.`;
    }
    return first || 'An anonymous supporter';
  }, []);

  useEffect(() => {
    const fetchCampaignData = async () => {
      if (!slug) return;
      
      const { data: campaignData, error: campaignError } = await supabase.from('campaigns').select('*, id, campaign_name, description, logo_url').eq('slug', slug).single();
      
      if (campaignError) {
         console.error("Campaign fetch error:", campaignError);
      }

      if(campaignData) {
        setCampaign({...campaignData, slug} as Campaign); 

        const { data: membershipsData } = await supabase
          .from('memberships')
          .select(`profiles ( full_name )`)
          .eq('campaign_id', campaignData.id)
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (membershipsData) {
          const displaySupporters = (membershipsData as { profiles: { full_name: string | null; } | null }[]).map(s => ({
            name: formatSupporterName(s.profiles?.full_name || null)
          }));
          setSupporters(displaySupporters);
        }

        if (user) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', user.id)
              .single();
            
            if (profileData?.full_name) {
                const parts = profileData.full_name.trim().split(/\s+/);
                setFirstName(parts[0] || '');
                const last = parts.length > 1 ? parts[parts.length - 1] : '';
                setLastName(last);
            }
        }
      }
      setLoading(false);
    };
    fetchCampaignData();
  }, [supabase, slug, user, formatSupporterName]); 
  
  const handlePurchase = async () => {
    if (!user) {
      router.push(`/login?redirect_to=/support/${slug}`);
      return;
    }

    // 1. Validation Check
    if (!firstName || !lastName) {
      setNameError('Please enter your first and last name.');
      return;
    }
    setNameError('');
    setProcessing(true);
    
    const newFullName = `${firstName.trim()} ${lastName.trim()}`;

    // 2. Update User Profile with Full Name
    const { error: profileError } = await supabase.from('profiles').update({
        full_name: newFullName,
    }).eq('id', user.id);

    if (profileError) {
      alert('Error updating profile: ' + profileError.message);
      setProcessing(false);
      return;
    }

    // 3. Create Membership (Simulated Purchase)
    const salePrice = 25.00;
    const fundraiserShare = salePrice * 0.70;
    const expires_at = new Date();
    expires_at.setFullYear(expires_at.getFullYear() + 1);

    const { error: membershipError } = await supabase.from('memberships').insert({
      user_id: user.id,
      campaign_id: campaign!.id,
      expires_at: expires_at.toISOString(),
      sale_price: salePrice,
      fundraiser_share: fundraiserShare,
    });

    if (membershipError) {
      alert('Error: Could not complete your membership. Please try again.');
      setProcessing(false);
    } else {
      router.push('/support/thank-you');
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading campaign...</div>;
  }
  if (!campaign) {
    return <div className="p-8 text-center">Campaign not found.</div>;
  }

  return (
    // Added light gray background to the entire page content area
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 md:p-8"> 
      <div className="w-full max-w-2xl text-center">
        {campaign.logo_url && (<img src={campaign.logo_url} alt={`${campaign.campaign_name} logo`} className="w-32 h-32 object-contain rounded-full mx-auto mb-4 bg-white shadow-lg border" />)}
        <p className="text-lg text-gray-600">You are supporting:</p>
        <h1 className="text-4xl font-bold text-slate-900 my-2">{campaign.campaign_name}</h1>
        <p className="text-gray-700 my-6 max-w-xl mx-auto">{campaign.description}</p>
        
        {/* Main white card for membership/purchase info, with shadow for contrast */}
        <div className="bg-white p-8 rounded-lg shadow-xl border border-gray-100 mt-6">
          <h2 className="text-2xl font-semibold">Get Your FunraiseWNY Membership</h2>
          <div className="my-6"><span className="text-5xl font-bold">$25</span><span className="text-gray-500">/ year</span></div>

          {/* Corrected: Name Input Fields - Now visible inside the white card */}
          {user && ( // Only show if a user is logged in and ready to proceed
             <div className="mb-6 space-y-4">
               <h3 className="text-left text-lg font-medium text-gray-700">Supporter Information</h3>
               <div className="flex space-x-4">
                 <input
                   type="text"
                   placeholder="First Name"
                   value={firstName}
                   onChange={(e) => setFirstName(e.target.value)}
                   className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                   required
                 />
                 <input
                   type="text"
                   placeholder="Last Name"
                   value={lastName}
                   onChange={(e) => setLastName(e.target.value)}
                   className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                   required
                 />
               </div>
               {nameError && <p className="text-red-500 text-sm text-left">{nameError}</p>}
             </div>
          )}

          <button onClick={handlePurchase} disabled={processing} className="w-full bg-green-600 text-white font-bold py-4 px-6 rounded-lg shadow-lg hover:bg-green-700 text-xl disabled:bg-gray-400">
            {processing ? 'Processing...' : 'Purchase & Support'}
          </button>
        </div>
        
        {supporters.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800">Recent Supporters</h3>
            <div className="mt-4 space-y-2">
              {supporters.map((supporter, index) => (
                <div key={index} className="bg-white text-sm text-gray-700 p-3 rounded-md shadow-sm border"> 
                  🎉 **{supporter.name}** just joined!
                </div>
              ))}
            </div>
          </div>
        )}
        
        <Link href="/" className="text-blue-600 hover:underline mt-8 inline-block">See all available deals</Link>
      </div>
    </div>
  );
}