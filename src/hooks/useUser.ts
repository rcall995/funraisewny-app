// src/hooks/useUser.ts

'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { User } from '@supabase/supabase-js';

type ProfileData = {
    role: string;
    full_name: string | null;
} | null;

type UserProfile = {
  user: User | null;
  profile: ProfileData;
  loading: boolean;
  isBusinessOwner: boolean;
  isFundraiser: boolean;
};

export default function useUser(): UserProfile {
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileData>(null);

  useEffect(() => {
    // Check current session immediately
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        // If user is logged in, fetch their profile
        const { data } = await supabase
          .from('profiles')
          .select('role, full_name')
          .eq('id', currentUser.id)
          .single();
        setProfile(data as ProfileData);
      } else {
        // If user is logged out, clear the profile
        setProfile(null);
      }
      setLoading(false);
    };

    checkSession();

    // This listener is the most reliable way to get auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        // If user is logged in, fetch their profile
        const { data } = await supabase
          .from('profiles')
          .select('role, full_name')
          .eq('id', currentUser.id)
          .single();
        setProfile(data as ProfileData);
      } else {
        // If user is logged out, clear the profile
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      // Cleanup the listener when the component unmounts
      authListener?.subscription.unsubscribe();
    };
  }, [supabase]);

  return {
    user,
    profile,
    loading,
    isBusinessOwner: profile?.role === 'business',
    isFundraiser: profile?.role === 'fundraiser',
  };
}