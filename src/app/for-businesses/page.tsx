import Link from 'next/link';

// Helper component for benefit items
const BenefitItem = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="bg-gray-50 p-6 rounded-lg">
    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{children}</p>
  </div>
);

export default function ForBusinessesPage() {
  return (
    <div className="bg-white text-gray-800">
      {/* Hero Section */}
      <section className="bg-blue-600 text-white text-center py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Get New Local Customers, Guaranteed.</h1>
          <p className="text-lg md:text-xl opacity-90">Partner with WNY fundraisers to drive loyal supporters through your door with a 100% risk-free marketing platform.</p>
          <Link href="/login" className="mt-8 inline-block px-10 py-4 bg-white text-blue-600 font-bold rounded-lg shadow-2xl hover:bg-gray-100 transition duration-300 text-lg">
            Get Started for Free
          </Link>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">A Smarter Way to Grow Your Business</h2>
              <p className="text-lg text-gray-600 mt-2">No upfront costs, no monthly fees. Just new customers.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <BenefitItem title="✅ 100% Risk-Free Marketing">
                  Stop paying for ads that might not work. With FunraiseWNY, there are no fees to join. You only provide a discount when a paying member makes a purchase. If it doesn&apos;t bring you customers, it doesn&apos;t cost you a penny.
                </BenefitItem>
                <BenefitItem title="✅ Attract Loyal, Local Customers">
                  Our members are local families who have paid to support a community group. They are actively looking for businesses like yours to support. They are the best kind of new customer.
                </BenefitItem>
                <BenefitItem title="✅ Simple 5-Minute Setup">
                  You&apos;re busy. Our online dashboard is effortless. Sign up in minutes, create deals with a simple form, and pause or update your offers anytime. No special hardware or training needed.
                </BenefitItem>
                <BenefitItem title="✅ Become a Community Hero">
                  Your business becomes a celebrated partner in supporting local schools and teams. It&apos;s powerful public relations that builds deep brand loyalty and shows the community you care.
                </BenefitItem>
            </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gray-100 py-20 px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Ready to Get Started?</h2>
          <p className="text-lg text-gray-600 mt-2 mb-8">Join dozens of other WNY businesses today.</p>
          <Link href="/login" className="px-10 py-4 bg-blue-600 text-white font-bold rounded-lg shadow-xl hover:bg-blue-700 transition duration-300 text-lg">
            Create Your Free Business Profile
          </Link>
      </section>
    </div>
  );
}