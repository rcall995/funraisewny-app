import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import SignOutButton from '@/components/SignOutButton';

/* eslint-disable @next/next/no-img-element */

export default async function Header() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let userIsMerchant = false;
  let userIsFundraiser = false;
  let userIsMember = false; // <-- New variable for membership status

  if (user) {
    // Check for business profile
    const { data: businessProfile } = await supabase.from('businesses').select('id').eq('owner_id', user.id).single();
    if (businessProfile) userIsMerchant = true;

    // Check for a campaign
    const { data: campaign } = await supabase.from('campaigns').select('id').eq('organizer_id', user.id).limit(1).single();
    if (campaign) userIsFundraiser = true;
    
    // --- New Check for Active Membership ---
    const { data: membership } = await supabase
      .from('memberships')
      .select('id')
      .eq('user_id', user.id)
      .gte('expires_at', new Date().toISOString()) // Checks if expiration is greater than or equal to now
      .limit(1)
      .single();
    if (membership) userIsMember = true;
    // ------------------------------------
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link href="/">
          <img 
            src="/image_acafef.png"
            alt="FunraiseWNY Logo"
            className="h-10 w-auto"
          />
        </Link>
        <div className="flex items-center space-x-4 font-medium">
          {user ? (
            // --- LOGGED-IN VIEW ---
            <>
              {/* If they are a member, give them a clear link to the deals */}
              {userIsMember && (
                <Link href="/" className="text-gray-600 hover:text-blue-600">View Deals</Link>
              )}
              
              {userIsMerchant && (
                <Link href="/merchant" className="text-gray-600 hover:text-blue-600">Merchant</Link>
              )}
              {userIsFundraiser && (
                 <Link href="/campaigns" className="text-gray-600 hover:text-blue-600">Fundraiser</Link>
              )}
              
              {/* If user is not a member, merchant, or fundraiser, show the hub link */}
              {!userIsMember && !userIsMerchant && !userIsFundraiser && (
                  <Link href="/dashboard" className="text-gray-600 hover:text-blue-600">Dashboard</Link>
              )}

              <SignOutButton />
            </>
          ) : (
            // --- LOGGED-OUT VIEW ---
            <>
              <Link href="/login" className="text-gray-600 hover:text-blue-600">
                Login
              </Link>
              <Link href="/login" className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}