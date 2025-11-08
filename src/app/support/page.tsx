import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';

// --- Type Definition for Campaigns ---
type Campaign = {
  id: number;
  campaign_name: string;
  description: string;
  logo_url: string | null;
  slug: string;
};

// --- Reusable Campaign Card Component ---
const CampaignCard = ({ campaign }: { campaign: Campaign }) => (
  <Link 
    href={`/support/${campaign.slug}`} 
    className="block bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
  >
    <div className="p-6 flex items-center space-x-4">
      {campaign.logo_url ? (
        <Image 
          src={campaign.logo_url} 
          alt={`${campaign.campaign_name} logo`}
          width={64}
          height={64}
          className="w-16 h-16 object-contain rounded-full border bg-white"
        />
      ) : (
        <div className="w-16 h-16 rounded-full bg-gray-100 flex-shrink-0"></div>
      )}
      <div>
        <h3 className="text-xl font-bold text-gray-900">{campaign.campaign_name}</h3>
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{campaign.description}</p>
      </div>
    </div>
  </Link>
);


// --- The Main Page Component ---
export default async function BrowseCampaignsPage() {
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

  // Fetch all campaigns that are currently 'active'
  const { data: campaigns, error } = await supabase
    .from('campaigns')
    .select('id, campaign_name, description, logo_url, slug')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching campaigns:", error.message);
  }

  return (
    <main className="bg-gray-50 min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900">Support a Local Fundraiser</h1>
          <p className="text-lg text-gray-600 mt-3">
            Choose a group you&apos;d like to support. Your purchase of a FunraiseWNY membership helps them reach their goal!
          </p>
        </div>

        {campaigns && campaigns.length > 0 ? (
          <div className="space-y-6">
            {campaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign as Campaign} />
            ))}
          </div>
        ) : (
          <div className="text-center bg-white p-12 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-700">No Active Campaigns Right Now</h2>
            <p className="text-gray-500 mt-2">Please check back soon to find a local group to support!</p>
          </div>
        )}
      </div>
    </main>
  );
}