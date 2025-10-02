import Link from 'next/link';

export default function ForBusinessesPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-blue-600 text-white text-center py-20 px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Attract New, Community-Minded Customers.</h1>
        <p className="text-lg md:text-xl opacity-90 max-w-3xl mx-auto">Partner with local fundraisers to drive loyal supporters through your door. It&apos;s powerful, risk-free marketing that builds immense goodwill.</p>
        <Link href="/login" className="mt-8 inline-block px-10 py-4 bg-white text-blue-600 font-bold rounded-lg shadow-2xl hover:bg-gray-100 transition duration-300 text-lg">
          Get Your Business Featured (It&apos;s Free)
        </Link>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-12">Why Businesses Love FunraiseWNY</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                <div>
                    <h3 className="text-xl font-bold mb-2">✅ Zero Upfront Cost</h3>
                    <p className="text-gray-600">You only provide a discount when a paying member makes a purchase. There are no fees to join or be featured.</p>
                </div>
                <div>
                    <h3 className="text-xl font-bold mb-2">✅ Targeted Local Marketing</h3>
                    <p className="text-gray-600">Reach thousands of local families who are actively looking to support businesses that support their community.</p>
                </div>
                <div>
                    <h3 className="text-xl font-bold mb-2">✅ Simple & Easy</h3>
                    <p className="text-gray-600">Use your online dashboard to create and manage your deals in minutes. No complex hardware or training required.</p>
                </div>
            </div>
        </div>
      </section>
    </div>
  );
}