'use client';

import Link from 'next/link';

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
  });
};

export default function DashboardClient({
  email,
  fullName,
  membership,
}: {
  email: string;
  fullName: string | null;
  membership: { expires_at: string } | null;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Account</h1>
          <div className="bg-white p-6 rounded-lg shadow-md border mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Account Details</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Full Name</span>
                <span className="font-medium text-gray-900">{fullName || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email</span>
                <span className="font-medium text-gray-900">{email}</span>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Membership Status</h2>
            {membership ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Status</span>
                  <span className="font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">Active</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Valid Until</span>
                  <span className="font-medium text-gray-900">{formatDate(membership.expires_at)}</span>
                </div>
                <div className="pt-4">
                  <Link href="/deals" className="block w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg text-center hover:bg-blue-700 transition">
                    View Member Deals
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-gray-600">You do not have an active membership.</p>
                <Link href="/support" className="mt-4 inline-block text-blue-600 hover:underline">
                  Find a fundraiser to support
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
