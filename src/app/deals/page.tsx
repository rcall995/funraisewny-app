import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';

/* eslint-disable @next/next/no-img-element */

// --- Type Definitions for our data ---
type Deal = {
  title: string;
  description: string;
  terms: string | null;
  category: string;
  businesses: {
    business_name: string;
    logo_url: string | null;
    address: string;
  } | null;
};

// --- Reusable Deal Card Component ---
const DealCard = ({ deal }: { deal: Deal }) => {
    const businessName = deal.businesses?.business_name || 'Local Business';
    const businessLogo = deal.businesses?.logo_url || '/placeholder.svg';

    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden flex flex-col">
            <div className="p-6">
                <div className="flex items-center mb-4">
                    <img src={businessLogo} alt={`${businessName} logo`} className="w-12 h-12 object-contain rounded-full border bg-white mr-4" />
                    <div>
                        <h3 className="font-bold text-gray-800">{businessName}</h3>
                        <p className="text-xs text-gray-500">{deal.businesses?.address}</p>
                    </div>
                </div>
                <h2 className="text-xl font-bold text-blue-600">{deal.title}</h2>
                <p className="text-gray-600 mt-2 text-sm">{deal.description}</p>
            </div>
            {deal.terms && (
                <div className="bg-gray-50 p-4 mt-auto border-t">
                    <p className="text-xs text-gray-500 italic">
                        <strong>Terms:</strong> {deal.terms}
                    </p>
                </div>
            )}
        </div>
    );
};


// --- The Main Page Component ---
export default async function DealsPage() {
  const supabase = createServerComponentClient({ cookies });

  const { data: { session } } = await supabase.auth.getSession();

  let isMember = false;
  if (session) {
    const { data: membership } = await supabase
      .from('memberships')
      .select('id')
      .eq('user_id', session.user.id)
      .gte('expires_at', new Date().toISOString())
      .limit(1)
      .single();
    
    isMember = !!membership;
  }

  let deals: Deal[] = [];
  if (isMember) {
    // THIS IS THE FIX: Explicitly specify the foreign key relationship to use
    const { data: dealData, error } = await supabase
      .from('deals')
      .select(`
        title,
        description,
        terms,
        category,
        businesses!business_id (
          business_name,
          logo_url,
          address
        )
      `)
      .eq('is_active', true)
      .eq('approval_status', 'approved')
      .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching deals:", error);
    } else {
        deals = dealData as Deal[];
    }
  }

  return (
    <main className="bg-gray-50 min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900">Exclusive Member Deals</h1>
            <p className="text-lg text-gray-600 mt-2">Your year of savings in Western New York starts here.</p>
        </div>

        {isMember ? (
          deals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {deals.map((deal, index) => (
                <DealCard key={index} deal={deal} />
              ))}
            </div>
          ) : (
            <div className="text-center bg-white p-12 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-700">No Deals Available Right Now</h2>
                <p className="text-gray-500 mt-2">Please check back soon as our business partners are always adding new offers!</p>
            </div>
          )
        ) : (
          <div className="text-center bg-white p-16 rounded-lg shadow-lg max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800">This Area is for Members Only</h2>
            <p className="text-gray-600 mt-4">To access these exclusive deals, you need to purchase a FunraiseWNY membership by supporting one of our active fundraisers.</p>
            <div className="mt-8">
                {session ? (
                     <Link href="/" className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg shadow-xl hover:bg-green-700">
                        Find a Fundraiser to Support
                    </Link>
                ) : (
                    <Link href="/login" className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-xl hover:bg-blue-700">
                        Login or Sign Up
                    </Link>
                )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}