'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import useUser from '@/hooks/useUser';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Image from 'next/image';

type Campaign = { id: number; campaign_name: string; description: string; logo_url: string | null; slug: string; };
type SupporterDisplayInfo = { name: string; };
type MembershipWithProfile = {
  profiles: { full_name: string | null } | { full_name: string | null }[] | null;
};

export default function SupportPage() {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [supporters, setSupporters] = useState<SupporterDisplayInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  // Combined and corrected data fetching
  useEffect(() => {
    const fetchAllData = async () => {
      if (!slug) { setLoading(false); return; }
      
      setLoading(true);

      // Fetch campaign details
      const { data: campaignData } = await supabase.from('campaigns').select('id, campaign_name, description, logo_url, slug').eq('slug', slug).single();
      
      if(campaignData) {
        setCampaign(campaignData as Campaign);

        // Fetch recent supporters for this campaign
        const { data: membershipsData } = await supabase.from('memberships').select('profiles(full_name)').eq('campaign_id', campaignData.id).order('created_at', { ascending: false }).limit(5);
        if (membershipsData) {
          const displaySupporters = (membershipsData as MembershipWithProfile[]).map(s => {
            const profiles = s.profiles;
            const fullName = profiles && !Array.isArray(profiles) ? profiles.full_name : (Array.isArray(profiles) && profiles[0] ? profiles[0].full_name : null);
            return { name: formatSupporterName(fullName) };
          });
          setSupporters(displaySupporters);
        }
      }

      // If a user is logged in, fetch their profile to pre-fill the name
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        
        if (profileData?.full_name) {
          const parts = profileData.full_name.trim().split(/\s+/);
          setFirstName(parts[0] || '');
          setLastName(parts.length > 1 ? parts[parts.length - 1] : '');
        }
      }

      setLoading(false);
    };

    fetchAllData();
  }, [slug, user, supabase, formatSupporterName]);
  
  const handlePurchase = async () => {
    setProcessing(true);
    setError('');

    try {
      let userId = user?.id;

      // If no user is logged in, create a new account
      if (!user) {
        if (!email || !password || !firstName || !lastName) {
          setError('Please fill in all fields');
          setProcessing(false);
          return;
        }

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: `${firstName} ${lastName}`,
            },
          },
        });

        if (signUpError) {
          setError(signUpError.message);
          setProcessing(false);
          return;
        }

        userId = signUpData.user?.id;

        // For new signups, we need to create the profile first
        if (userId) {
          const fullName = `${firstName.trim()} ${lastName.trim()}`;

          // Insert profile (it may already exist from trigger, so we use upsert)
          await supabase
            .from('profiles')
            .upsert({
              id: userId,
              full_name: fullName,
              role: 'supporter',
            }, {
              onConflict: 'id'
            });
        }
      }

      if (!userId || !campaign?.id) {
        setError('Unable to process membership');
        setProcessing(false);
        return;
      }

      // Update user's full name if provided (for existing logged-in users)
      if (user) {
        const fullName = `${firstName.trim()} ${lastName.trim()}`;
        await supabase
          .from('profiles')
          .update({ full_name: fullName })
          .eq('id', userId);
      }

      // Create FREE membership (expires in 1 year)
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);

      // For FREE testing: fundraiser gets $15, platform gets $10 (would be from $25 payment)
      const fundraiserShare = 15.00;

      const { error: membershipError } = await supabase
        .from('memberships')
        .insert({
          user_id: userId,
          campaign_id: campaign.id,
          expires_at: expiresAt.toISOString(),
          fundraiser_share: fundraiserShare,
        });

      if (membershipError) {
        setError('Error creating membership: ' + membershipError.message);
        setProcessing(false);
        return;
      }

      // Success! Redirect to thank you page or dashboard
      router.push('/support/thank-you');
    } catch (err) {
      console.error('Purchase error:', err);
      setError('An unexpected error occurred');
      setProcessing(false);
    }
  };

  if (loading) { return <div className="p-8 text-center">Loading campaign...</div>; }
  if (!campaign) { return <div className="p-8 text-center">Campaign not found.</div>; }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 md:p-8"> 
      <div className="w-full max-w-2xl text-center">
        {campaign.logo_url && (
            <Image src={campaign.logo_url} alt={`${campaign.campaign_name} logo`} width={128} height={128} className="w-32 h-32 object-contain rounded-full mx-auto mb-4 bg-white shadow-lg border" />
        )}
        <p className="text-lg text-gray-600">You are supporting:</p>
        <h1 className="text-4xl font-bold text-slate-900 my-2">{campaign.campaign_name}</h1>
        <p className="text-gray-700 my-6 max-w-xl mx-auto">{campaign.description}</p>
        
        <div className="bg-white p-8 rounded-lg shadow-xl border border-gray-100 mt-6">
          <h2 className="text-2xl font-semibold">Get Your FunraiseWNY Membership</h2>
          <div className="my-6">
            <span className="text-5xl font-bold line-through text-gray-400">$25</span>
            <span className="text-5xl font-bold text-green-600 ml-4">FREE</span>
            <span className="text-gray-500 block mt-2">Testing Period - Full Access for 1 Year</span>
          </div>

          {!user && (
            <div className="mb-6 space-y-4 text-left">
              <h3 className="text-lg font-medium text-gray-700">Create Your Account to Continue</h3>
              <div className="flex space-x-4">
                <input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg"
                  required
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                required
              />
              <input
                type="password"
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                required
                minLength={6}
              />
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
            {processing ? 'Creating Your Membership...' : 'Get FREE Membership & Support'}
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