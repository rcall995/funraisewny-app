import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import DealsClientPage from './DealsClientPage';

export type Deal = {
  title: string; description: string; terms: string | null; category: string;
  business_name: string | null; logo_url: string | null; address: string | null;
};

async function getServerDeals() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) { return { deals: [], isMember: false, featured: [] }; }

  const { data, error } = await supabase.rpc('get_live_deals');

  if (error) {
    console.error("Fatal Error calling get_live_deals:", JSON.stringify(error, null, 2));
    return { deals: [], isMember: true, featured: [] };
  }
  
  const deals = (data as Deal[]) || [];
  return { deals, isMember: true, featured: deals.slice(0, 5) };
}

export default async function DealsPage() {
  const { deals, isMember, featured } = await getServerDeals();
  if (!isMember) {
    return (
      <main className="bg-gray-50 min-h-screen py-12 px-4 flex items-center justify-center">
        <div className="container mx-auto max-w-2xl text-center bg-white p-16 rounded-lg shadow-xl">
          <h1 className="text-3xl font-bold mb-4 text-gray-900">Members-Only Deals Await!</h1>
          <p className="text-gray-600 mb-8">Unlock exclusive WNY savings by supporting a local fundraiser.</p>
          <Link href="/login" className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg">Login or Sign Up</Link>
        </div>
      </main>
    );
  }
  return ( <DealsClientPage initialDeals={deals} initialFeatured={featured} /> );
}