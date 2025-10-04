'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { User } from '@supabase/supabase-js';

type UserProfile = {
  user: User | null;
  isBusinessOwner: boolean;
  isFundraiser: boolean;
  isMember: boolean;
  loading: boolean;
};

export default function useUser(): UserProfile {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<User | null>(null);
  const [isBusinessOwner, setIsBusinessOwner] = useState(false);
  const [isFundraiser, setIsFundraiser] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);

  const getUserProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    if (user) {
      const [businessRes, fundraiserRes, memberRes] = await Promise.all([
        supabase.from('businesses').select('id', { count: 'exact', head: true }).eq('owner_id', user.id), 
        supabase.from('campaigns').select('id', { count: 'exact', head: true }).eq('organizer_id', user.id),
        supabase.from('memberships').select('id', { count: 'exact', head: true }).eq('user_id', user.id).gte('expires_at', new Date().toISOString())
      ]);
      
      setIsBusinessOwner((businessRes.count ?? 0) > 0);
      setIsFundraiser((fundraiserRes.count ?? 0) > 0);
      setIsMember((memberRes.count ?? 0) > 0);
    } else {
      setIsBusinessOwner(false);
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

  return { user, isBusinessOwner, isFundraiser, isMember, loading };
}