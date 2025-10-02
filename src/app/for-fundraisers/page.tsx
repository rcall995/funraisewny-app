import Link from 'next/link';

/* eslint-disable @next/next/no-img-element */

export default function ForFundraisersPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-green-600 text-white text-center py-20 px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">The Easiest & Most Profitable Fundraiser You&apos;ll Ever Run.</h1>
        <p className="text-lg md:text-xl opacity-90 max-w-3xl mx-auto">Stop selling wrapping paper. Offer your community a product they genuinely want—a year of savings at local businesses—and keep a large portion of every sale.</p>
        <Link href="/login" className="mt-8 inline-block px-10 py-4 bg-white text-green-600 font-bold rounded-lg shadow-2xl hover:bg-gray-100 transition duration-300 text-lg">
          Start Your Fundraiser Today
        </Link>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-12">Why Groups Choose FunraiseWNY</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                <div>
                    <h3 className="text-xl font-bold mb-2">✅ High Profit Share</h3>
                    <p className="text-gray-600">Earn more money for your group with our generous revenue-sharing model. </p>
                </div>
                <div>
                    <h3 className="text-xl font-bold mb-2">✅ Zero Inventory or Handling</h3>
                    <p className="text-gray-600">Everything is 100% digital. No products to order, store, or deliver. No handling cash or checks.</p>
                </div>
                <div>
                    <h3 className="text-xl font-bold mb-2">✅ A Product People Love</h3>
                    <p className="text-gray-600">Your supporters get a valuable membership they can use all year, making your fundraiser an easy &apos;yes&apos;.</p>
                </div>
            </div>
        </div>
      </section>
    </div>
  );
}