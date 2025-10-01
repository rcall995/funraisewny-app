import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { User } from '@supabase/supabase-js';

export default function useUser() {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This function will get the initial user session on page load
    const getInitialUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getInitialUser();

    // Now, we set up the real-time listener for any auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      // The session object has the user object. It's null if the user signs out.
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setLoading(false);
    });

    // The 'cleanup' function below will run when the component unmounts.
    // It's crucial for preventing memory leaks.
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase]);

  return { user, loading };
}