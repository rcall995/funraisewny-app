import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | Funraise WNY',
};

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-white min-h-screen py-16 px-4">
      <div className="container mx-auto max-w-3xl prose prose-gray">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: February 14, 2026</p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. Introduction</h2>
        <p className="text-gray-700 mb-4">
          Funraise WNY (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates the website funraisewny.com (the &quot;Service&quot;).
          This Privacy Policy explains how we collect, use, and protect your personal information when
          you use our Service.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">2. Information We Collect</h2>
        <p className="text-gray-700 mb-2">We collect information you provide directly to us, including:</p>
        <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1">
          <li>Name and email address when you create an account</li>
          <li>Business name, address, and phone number (for business partners)</li>
          <li>Campaign details (for fundraiser organizers)</li>
          <li>Payment information when purchasing memberships (processed securely by our third-party payment provider)</li>
        </ul>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">3. How We Use Your Information</h2>
        <p className="text-gray-700 mb-2">We use the information we collect to:</p>
        <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1">
          <li>Provide, maintain, and improve our Service</li>
          <li>Process membership purchases and track fundraiser contributions</li>
          <li>Display business deals to members</li>
          <li>Communicate with you about your account, campaigns, or partnerships</li>
          <li>Send important updates about the Service</li>
        </ul>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">4. Information Sharing</h2>
        <p className="text-gray-700 mb-4">
          We do not sell your personal information. We may share limited information in these circumstances:
        </p>
        <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1">
          <li>Business names, addresses, and deal details are displayed to members as part of the Service</li>
          <li>Campaign names and organizer information are displayed publicly to facilitate fundraising</li>
          <li>With service providers who assist in operating our platform (hosting, payment processing)</li>
          <li>When required by law or to protect our legal rights</li>
        </ul>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">5. Data Security</h2>
        <p className="text-gray-700 mb-4">
          We implement appropriate technical and organizational measures to protect your personal information.
          Account credentials are managed through secure authentication services, and payment information
          is processed by PCI-compliant third-party providers.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">6. Your Rights</h2>
        <p className="text-gray-700 mb-4">
          You may request access to, correction of, or deletion of your personal information by contacting
          us at <a href="mailto:info@funraisewny.com" className="text-blue-600 hover:underline">info@funraisewny.com</a>.
          You can also update your profile information directly through your account dashboard.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">7. Cookies</h2>
        <p className="text-gray-700 mb-4">
          We use essential cookies to maintain your login session and ensure the Service functions properly.
          We may also use analytics tools to understand how the Service is used.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">8. Changes to This Policy</h2>
        <p className="text-gray-700 mb-4">
          We may update this Privacy Policy from time to time. We will notify you of significant changes by
          posting the new policy on this page and updating the &quot;Last updated&quot; date.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">9. Contact Us</h2>
        <p className="text-gray-700 mb-4">
          If you have questions about this Privacy Policy, please contact us at{' '}
          <a href="mailto:info@funraisewny.com" className="text-blue-600 hover:underline">info@funraisewny.com</a>.
        </p>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link href="/" className="text-blue-600 hover:underline">&larr; Back to Home</Link>
        </div>
      </div>
    </main>
  );
}
