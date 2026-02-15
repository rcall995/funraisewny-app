import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';

async function getDashboardData() {
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
    .select('role, full_name')
    .eq('id', user.id)
    .single();

  const { data: membershipsData } = await supabase
    .from('memberships')
    .select('expires_at')
    .eq('user_id', user.id)
    .gte('expires_at', new Date().toISOString())
    .limit(1);

  const membership = membershipsData && membershipsData.length > 0
    ? membershipsData[0]
    : null;

  return {
    email: user.email ?? '',
    fullName: profile?.full_name ?? null,
    membership,
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  if (!data) {
    redirect('/login');
  }

  return <DashboardClient email={data.email} fullName={data.fullName} membership={data.membership} />;
}
