'use client';

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

type SupabaseResponse = { data: unknown; error: unknown };

const safeQuery = async (queryPromise: Promise<SupabaseResponse>): Promise<{ data: boolean; error: boolean }> => {
  try {
    const result = await queryPromise;
    if (result.error && (result.error as { code: string }).code !== 'PGRST116') {
      console.warn('SafeQuery non-critical error:', result.error);
      return { data: false, error: true };
    }
    const hasData = result.data !== null && (Array.isArray(result.data) ? result.data.length > 0 : Object.keys(result.data as object).length > 0);
    return { data: hasData, error: false };
  } catch (e) {
    console.error('SafeQuery exception:', e);
    return { data: false, error: true };
  }
};

export default function useUser(): UserProfile {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<User | null>(null);
  const [isMerchant, setIsMerchant] = useState(false);
  const [isFundraiser, setIsFundraiser] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);

  const getUserProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    if (user) {
      // FIX: Use .limit(1) on all checks to prevent 406 errors
      const [merchantRes, fundraiserRes, memberRes] = await Promise.all([
        supabase.from('businesses').select('id').eq('owner_id', user.id).limit(1), 
        supabase.from('campaigns').select('id').eq('organizer_id', user.id).limit(1),
        supabase.from('memberships').select('id').eq('user_id', user.id).gte('expires_at', new Date().toISOString()).limit(1)
      ]);
      
      const [merchantData, fundraiserData, memberData] = await Promise.all([
        safeQuery(Promise.resolve(merchantRes as SupabaseResponse)),
        safeQuery(Promise.resolve(fundraiserRes as SupabaseResponse)),
        safeQuery(Promise.resolve(memberRes as SupabaseResponse))
      ]);

      setIsMerchant(merchantData.data);
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
    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      getUserProfile();
    });
    return () => authListener?.subscription.unsubscribe();
  }, [supabase, getUserProfile]);

  return { user, isMerchant, isFundraiser, isMember, loading };
}