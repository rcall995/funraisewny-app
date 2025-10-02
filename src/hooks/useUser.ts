import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { User } from '@supabase/supabase-js';

type UserProfile = {
  user: User | null;
  isMerchant: boolean;
  isFundraiser: boolean;
  isMember: boolean;
  loading: boolean;
};

export default function useUser(): UserProfile {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<User | null>(null);
  const [isMerchant, setIsMerchant] = useState(false);
  const [isFundraiser, setIsFundraiser] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUserProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Run all checks in parallel for performance
        const [merchantRes, fundraiserRes, memberRes] = await Promise.all([
          // Check for a business profile
          supabase.from('businesses').select('id').eq('owner_id', user.id).single(),
          // Check for a campaign
          supabase.from('campaigns').select('id').eq('organizer_id', user.id).limit(1).single(),
          // Check for an active membership
          supabase.from('memberships').select('id').eq('user_id', user.id).gte('expires_at', new Date().toISOString()).limit(1).single()
        ]);

        setIsMerchant(!!merchantRes.data);
        setIsFundraiser(!!fundraiserRes.data);
        setIsMember(!!memberRes.data);
      }
      
      setLoading(false);
    }

    getUserProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (!currentUser) {
        // If user logs out, reset all roles
        setIsMerchant(false);
        setIsFundraiser(false);
        setIsMember(false);
      } else {
        // If user logs in, re-fetch their profile data
        getUserProfile();
      }
      setLoading(false);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase]);

  return { user, isMerchant, isFundraiser, isMember, loading };
}