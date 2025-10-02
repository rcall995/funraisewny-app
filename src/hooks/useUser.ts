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

  // Helper function to safely execute a Supabase query that might fail due to RLS/policies
  const safeQuery = async (queryPromise: Promise<any>): Promise<any> => {
    try {
      const { data, error } = await queryPromise;
      if (error && error.code !== 'PGRST116') {
        // Log the error but don't crash or throw, return failure state
        console.warn('SafeQuery encountered non-critical error:', error);
        return { data: null, error: true };
      }
      // Return true if data exists (not null and not an empty array)
      const hasData = data && (Array.isArray(data) ? data.length > 0 : !!data);
      return { data: hasData, error: false };
    } catch (e) {
      // Catch network errors or unexpected exceptions
      console.error('SafeQuery caught exception:', e);
      return { data: null, error: true };
    }
  };

  const getUserProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    if (user) {
      setLoading(true);
      
      // 1. Check for Merchant Status
      const merchantRes = await safeQuery(
        supabase.from('businesses').select('id').eq('owner_id', user.id).single()
      );
      const isUserMerchant = !!merchantRes.data;
      setIsMerchant(isUserMerchant);

      // 2. Perform other checks only if user is NOT a Merchant, 
      // or if we need to support multi-role users (which we assume we do here).
      // However, we run them safely to prevent the 406s from crashing the UI/looping.
      
      const [fundraiserRes, memberRes] = await Promise.all([
        // Check for a campaign
        safeQuery(supabase.from('campaigns').select('id').eq('organizer_id', user.id).limit(1).single()),
        // Check for an active membership
        safeQuery(supabase.from('memberships').select('id').eq('user_id', user.id).gte('expires_at', new Date().toISOString()).limit(1).single())
      ]);

      setIsFundraiser(!!fundraiserRes.data);
      setIsMember(!!memberRes.data);
    } else {
      setIsMerchant(false);
      setIsFundraiser(false);
      setIsMember(false);
    }
    
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    getUserProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        // If user logs in, re-fetch their profile data
        getUserProfile();
      } else {
        // If user logs out, reset all roles
        setIsMerchant(false);
        setIsFundraiser(false);
        setIsMember(false);
      }
      setLoading(false);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase, getUserProfile]);

  return { user, isMerchant, isFundraiser, isMember, loading };
}
