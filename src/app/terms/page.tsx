import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service | Funraise WNY',
};

export default function TermsOfServicePage() {
  return (
    <main className="bg-white min-h-screen py-16 px-4">
      <div className="container mx-auto max-w-3xl prose prose-gray">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: February 14, 2026</p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
        <p className="text-gray-700 mb-4">
          By accessing or using funraisewny.com (the &quot;Service&quot;) operated by Funraise WNY (&quot;we,&quot; &quot;us,&quot;
          or &quot;our&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms,
          please do not use the Service.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">2. Description of Service</h2>
        <p className="text-gray-700 mb-4">
          Funraise WNY is a platform that connects fundraising organizations, local businesses, and community
          supporters. Fundraisers create campaigns, businesses offer deals to members, and supporters purchase
          memberships to access deals while supporting local groups.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">3. User Accounts</h2>
        <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1">
          <li>You must provide accurate and complete information when creating an account</li>
          <li>You are responsible for maintaining the security of your account credentials</li>
          <li>You must be at least 18 years old to create an account</li>
          <li>One person or entity may not maintain multiple accounts of the same role</li>
        </ul>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">4. Memberships</h2>
        <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1">
          <li>Memberships are valid for one year from the date of purchase</li>
          <li>A portion of each membership purchase goes to the fundraising group you choose to support</li>
          <li>Memberships grant access to deals offered by participating businesses</li>
          <li>Deals are subject to availability and the terms set by each business</li>
          <li>Memberships are non-transferable</li>
        </ul>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">5. For Businesses</h2>
        <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1">
          <li>Businesses may create and manage their own deals and offers</li>
          <li>All deals are subject to review and approval before being displayed to members</li>
          <li>Businesses are responsible for honoring the deals they publish on the platform</li>
          <li>Businesses may pause or deactivate their deals at any time</li>
          <li>There is no fee for businesses to join or list deals on the platform</li>
        </ul>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">6. For Fundraisers</h2>
        <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1">
          <li>Fundraisers may create campaigns to promote membership sales</li>
          <li>Fundraisers receive a share of each membership sold through their campaign</li>
          <li>Fundraisers are responsible for accurately representing their organization</li>
          <li>Campaign details are displayed publicly to facilitate fundraising</li>
        </ul>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">7. Prohibited Conduct</h2>
        <p className="text-gray-700 mb-2">You agree not to:</p>
        <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1">
          <li>Use the Service for any unlawful purpose</li>
          <li>Misrepresent your identity or affiliation with any organization</li>
          <li>Interfere with or disrupt the Service</li>
          <li>Attempt to gain unauthorized access to any part of the Service</li>
          <li>Use the Service to distribute spam or unsolicited communications</li>
        </ul>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">8. Limitation of Liability</h2>
        <p className="text-gray-700 mb-4">
          Funraise WNY acts as a platform connecting fundraisers, businesses, and supporters. We are not
          responsible for the quality, safety, or legality of deals offered by businesses, nor for the
          legitimacy of fundraising campaigns. The Service is provided &quot;as is&quot; without warranties of any kind.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">9. Modifications</h2>
        <p className="text-gray-700 mb-4">
          We reserve the right to modify these Terms at any time. Continued use of the Service after changes
          constitutes acceptance of the updated Terms.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">10. Contact</h2>
        <p className="text-gray-700 mb-4">
          Questions about these Terms should be directed to{' '}
          <a href="mailto:info@funraisewny.com" className="text-blue-600 hover:underline">info@funraisewny.com</a>.
        </p>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link href="/" className="text-blue-600 hover:underline">&larr; Back to Home</Link>
        </div>
      </div>
    </main>
  );
}
