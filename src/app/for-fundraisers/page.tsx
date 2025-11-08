// src/app/for-fundraisers/page.tsx

import Link from 'next/link';

export default function ForFundraisersPage() {
  return (
    <div className="bg-white text-gray-800">
      {/* Hero Section */}
      <section className="bg-green-600 text-white text-center py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            The Easiest & Most Profitable Fundraiser You&apos;ll Ever Run.
          </h1>
          <p className="text-lg md:text-xl opacity-90">
            Stop selling wrapping paper. Offer your community a product they genuinely want—a year
            of savings at local businesses—and keep a large portion of every sale.
          </p>

          <Link
            href="/login?view=sign_up&role=fundraiser&redirect_to=/campaigns"
            className="mt-8 inline-block px-10 py-4 bg-white text-green-600 font-bold rounded-lg shadow-2xl hover:bg-gray-100 transition duration-300 text-lg"
          >
            Start Your Fundraiser Today
          </Link>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              Why Groups Choose FunraiseWNY
            </h2>
            <p className="text-lg text-gray-600 mt-2">
              The fundraiser that practically runs itself.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-2">✅ High Profit Share</h3>
              <p className="text-gray-600">
                Earn more money for your group with our generous revenue-sharing model. Keep a large
                portion of every membership sold to support your cause.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-2">✅ Zero Inventory or Handling</h3>
              <p className="text-gray-600">
                Everything is 100% digital. No products to order, store, or deliver. No handling cash
                or checks. Your supporters buy online and receive instant access.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-2">✅ A Product People Love</h3>
              <p className="text-gray-600">
                Your supporters get a valuable membership they can use all year at dozens of local businesses,
                making your fundraiser an easy &apos;yes&apos;.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-2">✅ Quick & Easy Setup</h3>
              <p className="text-gray-600">
                Launch your campaign in minutes with our simple dashboard. Share your custom link, and
                start raising funds immediately with no upfront costs or commitments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-100 py-20 px-4 text-center">
        <h2 className="text-3xl font-bold text-gray-900">Ready to Get Started?</h2>
        <p className="text-lg text-gray-600 mt-2 mb-8">
          Join the schools and groups already raising funds with FunraiseWNY.
        </p>

        <Link
          href="/login?view=sign_up&role=fundraiser&redirect_to=/campaigns"
          className="px-10 py-4 bg-green-600 text-white font-bold rounded-lg shadow-xl hover:bg-green-700 transition duration-300 text-lg inline-block"
        >
          Create Your Free Campaign
        </Link>
      </section>
    </div>
  );
}
