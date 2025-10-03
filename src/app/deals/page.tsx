import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import DealsClientPage from './DealsClientPage'; // We will create this in Step 2

// --- Type Definition ---
// This type is now shared between the server and client components
export type Deal = {
  title: string;
  description: string;
  terms: string | null;
  category: string;
  businesses: {
    business_name: string;
    logo_url: string | null;
    address: string;
  }[];
};

// --- Server-Side Data Fetching ---
async function getServerDeals() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  // If no user is logged in, return the non-member state
  if (!session) {
    return { deals: [], isMember: false, featured: [] };
  }

  // Check if the logged-in user has an active membership
  const { data: membership } = await supabase
    .from('memberships')
    .select('id')
    .eq('user_id', session.user.id)
    .gte('expires_at', new Date().toISOString())
    .limit(1)
    .single();

  // If they are not a member, return the non-member state
  if (!membership) {
    return { deals: [], isMember: false, featured: [] };
  }

  // If they are a member, fetch all the approved and active deals
  const { data: dealData, error } = await supabase
    .from('deals')
    .select(`
      title, description, terms, category,
      businesses!business_id (
        business_name, logo_url, address
      )
    `)
    .eq('is_active', true)
    .eq('approval_status', 'approved')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching deals:', error);
    return { deals: [], isMember: true, featured: [] };
  }

  const deals = (dealData as Deal[]) || [];
  
  // For the carousel, let's feature the 5 newest deals
  const featured = deals.slice(0, 5);

  return { deals, isMember: true, featured };
}


// --- This is the main Server Component for the page ---
export default async function DealsPage() {
  const { deals, isMember, featured } = await getServerDeals();

  // If the user isn't a member, we can show a simple message here
  // or pass the flag to the client to show an animated one.
  if (!isMember) {
    return (
        <main className="bg-gray-50 min-h-screen py-12 px-4 flex items-center justify-center">
            <div className="container mx-auto max-w-2xl text-center bg-white p-16 rounded-lg shadow-xl">
                <h1 className="text-3xl font-bold mb-4 text-gray-900">
                    Members-Only Deals Await!
                </h1>
                <p className="text-gray-600 mb-8">Unlock exclusive WNY savings by supporting a local fundraiser.</p>
                <Link href="/login" className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transition-colors">
                    Login or Sign Up to Become a Member
                </Link>
            </div>
        </main>
    );
  }

  // If they are a member, we render the interactive client page
  // and pass the data we fetched on the server as initial props.
  return (
    <DealsClientPage 
      initialDeals={deals} 
      initialFeatured={featured} 
    />
  );
}