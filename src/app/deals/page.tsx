import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import DealsClientPage from './DealsClientPage';

export type Deal = {
  title: string; description: string; terms: string | null; category: string;
  business_name: string | null; logo_url: string | null; address: string | null;
};

async function getServerDeals() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) { return { deals: [], isMember: false, featured: [] }; }

  // Use the robust database function to get deals securely
  const { data, error } = await supabase.rpc('get_live_deals');

  if (error) {
    console.error("Fatal Error calling get_live_deals:", JSON.stringify(error, null, 2));
    return { deals: [], isMember: true, featured: [] };
  }
  
  const deals = (data as Deal[]) || [];
  const { data: membershipData } = await supabase.from('memberships').select('expires_at').eq('user_id', user.id).gte('expires_at', new Date().toISOString()).order('expires_at', { ascending: false }).limit(1);
  const isMember = (membershipData?.length ?? 0) > 0;
  const expiresAt = membershipData?.[0]?.expires_at ?? null;

  return { deals, isMember, expiresAt, featured: deals.slice(0, 5) };
}

export default async function DealsPage() {
  const { deals, isMember, expiresAt, featured } = await getServerDeals();
  if (!isMember) {
    return (
      <main className="bg-gray-50 min-h-screen py-12 px-4 flex items-center justify-center">
        <div className="container mx-auto max-w-2xl text-center bg-white p-16 rounded-lg shadow-xl">
          <h1 className="text-3xl font-bold mb-4 text-gray-900">Members-Only Deals Await!</h1>
          <p className="text-gray-600 mb-8">Unlock exclusive WNY savings by supporting a local fundraiser.</p>
          <Link href="/support" className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg">Find a Fundraiser to Support</Link>
        </div>
      </main>
    );
  }
  return ( <DealsClientPage initialDeals={deals} initialFeatured={featured} expiresAt={expiresAt} /> );
}