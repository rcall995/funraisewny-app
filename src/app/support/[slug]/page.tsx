'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import useUser from '@/hooks/useUser';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Image from 'next/image';

// --- Type Definitions ---
type Campaign = { id: number; campaign_name: string; description: string; logo_url: string | null; slug: string; };
type SupporterDisplayInfo = { name: string; };

export default function SupportPage() {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [supporters, setSupporters] = useState<SupporterDisplayInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState(''); // For new user sign-up
  const [password, setPassword] = useState(''); // For new user sign-up
  const [error, setError] = useState('');
  
  const supabase = createClientComponentClient();
  const router = useRouter();
  const params = useParams();
  const { user } = useUser();
  const slug = params.slug as string;

  const formatSupporterName = useCallback((fullName: string | null) => {
    if (!fullName) return 'An anonymous supporter';
    const parts = fullName.trim().split(/\s+/);
    const first = parts[0];
    const lastInitial = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
    return (first && lastInitial) ? `${first} ${lastInitial}.` : first;
  }, []);

  useEffect(() => {
    const fetchCampaignData = async () => {
      if (!slug) { setLoading(false); return; }
      
      const { data: campaignData } = await supabase.from('campaigns').select('id, campaign_name, description, logo_url, slug').eq('slug', slug).single();
      
      if(campaignData) {
        setCampaign(campaignData as Campaign); 

        const { data: membershipsData } = await supabase.from('memberships').select('profiles(full_name)').eq('campaign_id', campaignData.id).order('created_at', { ascending: false }).limit(5);
        
        if (membershipsData) {
          // FIX: Use a specific type cast to resolve the 'any' type error.
          const displaySupporters = (membershipsData as { profiles: { full_name: string | null }[] | null }[]).map(s => ({ 
            name: formatSupporterName(s.profiles?.[0]?.full_name || null) 
          }));
          setSupporters(displaySupporters);
        }

        if (user?.user_metadata.full_name) {
            const parts = user.user_metadata.full_name.trim().split(/\s+/);
            setFirstName(parts[0] || '');
            setLastName(parts.length > 1 ? parts[parts.length - 1] : '');
        }
      }
      setLoading(false);
    };
    fetchCampaignData();
  }, [supabase, slug, user, formatSupporterName]); 
  
  const handlePurchase = async () => {
    setError('');
    setProcessing(true);

    let userId: string;
    // FIX: Changed 'let' to 'const' to resolve the linter error.
    const newFullName = `${firstName.trim()} ${lastName.trim()}`;

    if (!user) {
      if (!email || !password || !firstName || !lastName) {
        setError('Please fill in all fields to create your account.');
        setProcessing(false);
        return;
      }

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: newFullName } }
      });

      if (signUpError) { setError(signUpError.message); setProcessing(false); return; }
      if (!signUpData.user) { setError('Could not create user.'); setProcessing(false); return; }
      
      userId = signUpData.user.id;
      await supabase.from('profiles').insert({ id: userId, full_name: newFullName });
    } else {
      if (!firstName || !lastName) { setError('Please enter your first and last name.'); setProcessing(false); return; }
      userId = user.id;
      await supabase.from('profiles').upsert({ id: userId, full_name: newFullName });
    }

    const salePrice = 25.00;
    const fundraiserShare = salePrice * 0.70;
    const expires_at = new Date();
    expires_at.setFullYear(expires_at.getFullYear() + 1);

    const { error: membershipError } = await supabase.from('memberships').insert({
      user_id: userId,
      campaign_id: campaign!.id,
      expires_at: expires_at.toISOString(),
      sale_price: salePrice,
      fundraiser_share: fundraiserShare,
    });

    if (membershipError) {
      setError('Error creating membership: ' + membershipError.message);
      setProcessing(false);
    } else {
      router.refresh(); 
      router.push('/deals'); 
    }
  };

  if (loading) { return <div className="p-8 text-center">Loading campaign...</div>; }
  if (!campaign) { return <div className="p-8 text-center">Campaign not found.</div>; }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 md:p-8"> 
      <div className="w-full max-w-2xl text-center">
        {campaign.logo_url && (
          <Image 
            src={campaign.logo_url} 
            alt={`${campaign.campaign_name} logo`} 
            width={128}
            height={128}
            className="w-32 h-32 object-contain rounded-full mx-auto mb-4 bg-white shadow-lg border" 
          />
        )}
        <p className="text-lg text-gray-600">You are supporting:</p>
        <h1 className="text-4xl font-bold text-slate-900 my-2">{campaign.campaign_name}</h1>
        <p className="text-gray-700 my-6 max-w-xl mx-auto">{campaign.description}</p>
        
        <div className="bg-white p-8 rounded-lg shadow-xl border border-gray-100 mt-6">
          <h2 className="text-2xl font-semibold">Get Your FunraiseWNY Membership</h2>
          <div className="my-6"><span className="text-5xl font-bold">$25</span><span className="text-gray-500">/ year</span></div>

          {!user && (
            <div className="mb-6 space-y-4 text-left">
              <h3 className="text-lg font-medium text-gray-700">Create Your Account to Continue</h3>
              <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg" required />
              <input type="password" placeholder="Create Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg" required />
              <div className="flex space-x-4">
                 <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="flex-1 px-4 py-3 border border-gray-300 rounded-lg" required />
                 <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} className="flex-1 px-4 py-3 border border-gray-300 rounded-lg" required />
              </div>
            </div>
          )}

          {user && (
             <div className="mb-6 space-y-4 text-left">
              <h3 className="text-lg font-medium text-gray-700">Supporter Information</h3>
              <div className="flex space-x-4">
                 <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="flex-1 px-4 py-3 border border-gray-300 rounded-lg" required />
                 <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} className="flex-1 px-4 py-3 border border-gray-300 rounded-lg" required />
              </div>
             </div>
          )}

          {error && <p className="text-red-500 text-sm text-left my-4">{error}</p>}
          
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
                  🎉 <strong>{supporter.name}</strong> just joined!
                </div>
              ))}
            </div>
          </div>
        )}
        
        <Link href="/deals" className="text-blue-600 hover:underline mt-8 inline-block">See all available deals</Link>
      </div>
    </div>
  );
}