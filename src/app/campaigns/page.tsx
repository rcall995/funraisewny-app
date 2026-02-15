import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import CampaignsClient from './CampaignsClient';

export type Membership = {
  fundraiser_share: number;
  profiles: {
    full_name: string | null;
  } | null;
};

export type Campaign = {
  id: number;
  slug: string;
  campaign_name: string;
  goal_amount: number;
  start_date: string | null;
  end_date: string | null;
  status: string;
  memberships: Membership[];
};

async function getCampaignsData() {
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

  if (profile?.role !== 'fundraiser') return null;

  return { userId: user.id };
}

export default async function CampaignsPage() {
  const data = await getCampaignsData();

  if (!data) {
    redirect('/login');
  }

  return <CampaignsClient userId={data.userId} />;
}
