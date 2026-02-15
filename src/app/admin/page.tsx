import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminDashboard from './AdminDashboard';

export type AdminDeal = {
  id: number;
  title: string;
  description: string;
  category: string;
  terms: string | null;
  status: string;
  approval_status: string;
  created_at: string;
  businesses: {
    business_name: string;
    address: string;
    logo_url: string | null;
  } | null;
};

export type PlatformStats = {
  activeCampaigns: number;
  totalMemberships: number;
  totalBusinesses: number;
  dealsByStatus: { pending: number; approved: number; rejected: number };
};

async function getAdminData() {
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

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Role check
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') return null;

  // Fetch all data in parallel
  const [
    campaignsResult,
    membershipsResult,
    businessesResult,
    dealsResult,
  ] = await Promise.all([
    supabase.from('campaigns').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('memberships').select('id', { count: 'exact', head: true }),
    supabase.from('businesses').select('id', { count: 'exact', head: true }),
    supabase.from('deals').select('id, title, description, category, terms, status, approval_status, created_at, businesses(business_name, address, logo_url)').order('created_at', { ascending: false }),
  ]);

  // Normalize the joined businesses field (Supabase returns array for joins)
  const allDeals = ((dealsResult.data || []) as unknown as AdminDeal[]).map(d => ({
    ...d,
    businesses: Array.isArray(d.businesses) ? d.businesses[0] ?? null : d.businesses,
  }));
  const dealsByStatus = {
    pending: allDeals.filter(d => d.approval_status === 'pending').length,
    approved: allDeals.filter(d => d.approval_status === 'approved').length,
    rejected: allDeals.filter(d => d.approval_status === 'rejected').length,
  };

  const stats: PlatformStats = {
    activeCampaigns: campaignsResult.count ?? 0,
    totalMemberships: membershipsResult.count ?? 0,
    totalBusinesses: businessesResult.count ?? 0,
    dealsByStatus,
  };

  return { deals: allDeals, stats };
}

export default async function AdminPage() {
  const data = await getAdminData();

  if (!data) {
    redirect('/');
  }

  return <AdminDashboard initialDeals={data.deals} initialStats={data.stats} />;
}
