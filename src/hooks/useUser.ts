import { useEffect, useState, useCallback } from 'react';
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

  // Helper type definition for the expected raw Supabase response structure
  type SupabaseResponse = { data: unknown | null | Record<string, unknown> | Array<unknown>, error: unknown };

  // Helper function to safely execute a Supabase query that might fail due to RLS/policies
  const safeQuery = async (queryPromise: Promise<SupabaseResponse>): Promise<{ data: boolean; error: boolean }> => {
    try {
      // NOTE: We trust the developer knows the structure of Supabase's return object here.
      const result = await queryPromise as SupabaseResponse; 

      // PGRST116 is 'No rows found', which is NOT an error.
      if (result.error && (result.error as { code: string }).code !== 'PGRST116') {
        // Log the error but don't crash or throw, return failure state
        console.warn('SafeQuery encountered non-critical error:', result.error);
        return { data: false, error: true };
      }
      
      const data = result.data;
      // Determine if data exists. Checks for null, undefined, and empty arrays/objects.
      const hasData = data !== null && data !== undefined && (Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0);
      
      return { data: hasData, error: false };

    } catch (e) {
      // Catch network errors or unexpected exceptions
      console.error('SafeQuery caught exception:', e);
      return { data: false, error: true };
    }
  };

  const getUserProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    if (user) {
      setLoading(true);
      
      // FIX: Wrap PostgrestBuilder calls in Promise.resolve to satisfy TypeScript's 
      // strict type check requiring an explicit Promise. This resolves the 'Type error' on line 60.
      const [merchantRes, fundraiserRes, memberRes] = await Promise.all([
        // 1. Check for Merchant Status
        Promise.resolve(supabase.from('businesses').select('id').eq('owner_id', user.id).single() as unknown as SupabaseResponse),

        // 2. Check for a campaign
        Promise.resolve(supabase.from('campaigns').select('id').eq('organizer_id', user.id).limit(1).single() as unknown as SupabaseResponse),

        // 3. Check for an active membership
        Promise.resolve(supabase.from('memberships').select('id').eq('user_id', user.id).gte('expires_at', new Date().toISOString()).limit(1).single() as unknown as SupabaseResponse)
      ]);
      
      // The individual query results (e.g., merchantRes) are already resolved Promises, 
      // but they need to be passed through safeQuery.
      const isUserMerchant = merchantRes.data as boolean; 
      setIsMerchant(isUserMerchant);

      // Perform checks using the results from the Promise.all array
      // NOTE: We rely on the internal Promise.all + safeQuery logic to return the boolean data property
      const fundraiserData = await safeQuery(Promise.resolve(fundraiserRes as SupabaseResponse));
      const memberData = await safeQuery(Promise.resolve(memberRes as SupabaseResponse));
      
      setIsFundraiser(fundraiserData.data);
      setIsMember(memberData.data);
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
