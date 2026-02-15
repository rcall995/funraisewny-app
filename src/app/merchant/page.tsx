import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import MerchantClient from './MerchantClient';

export type BusinessProfile = { id: number; business_name: string; address: string; phone: string; logo_url: string | null; contact_role: string | null; };
export type Deal = { id: number; title: string; description: string; status: string; approval_status: string; };

async function getMerchantData() {
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
            // Server Component cookie setting can be ignored with middleware
          }
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'business') return null;

  const { data: businesses } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', user.id);

  const businessProfile = businesses && businesses.length > 0 ? businesses[0] : null;

  let deals: Deal[] = [];
  if (businessProfile) {
    const { data: dealsData } = await supabase
      .from('deals')
      .select('*')
      .eq('business_id', businessProfile.id)
      .order('created_at', { ascending: false });
    deals = (dealsData || []) as Deal[];
  }

  return {
    userId: user.id,
    userEmail: user.email ?? '',
    businessProfile: businessProfile as BusinessProfile | null,
    deals,
  };
}

export default async function MerchantPage() {
  const data = await getMerchantData();

  if (!data) {
    redirect('/login');
  }

  return (
    <MerchantClient
      userId={data.userId}
      userEmail={data.userEmail}
      initialBusinessProfile={data.businessProfile}
      initialDeals={data.deals}
    />
  );
}
