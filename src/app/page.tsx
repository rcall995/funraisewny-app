'use client';

import Link from 'next/link';

/* eslint-disable @next/next/no-img-element */

const FeatureCard = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="mx-auto w-14 h-14 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-5">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <div className="text-gray-600 space-y-2">{children}</div>
    </div>
);


export default function HomePage() {
  return (
    <main className="bg-white">
      {/* Hero Section */}
      <section className="text-center py-20 md:py-28 px-4 bg-gray-50">
        <div className="container mx-auto max-w-4xl">
          <img
            src="/image_acafef.png"
            alt="FunraiseWNY Logo"
            // --- UPDATED RESPONSIVE CLASSES ---
            className="w-4/5 h-auto max-w-[300px] md:h-56 md:w-auto md:max-w-none mx-auto mb-8"
          />
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            The Easiest Way to Fundraise in Western New York.
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
            We connect local groups with community-minded businesses to create fundraisers that people actually love.
          </p>
          <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4">
             <Link href="/login" className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg shadow-xl hover:bg-green-700 transition duration-300 inline-block text-center text-lg">
              Start a Fundraiser
            </Link>
            <Link href="/login" className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-xl hover:bg-blue-700 transition duration-300 inline-block text-center text-lg">
              Feature Your Business
            </Link>
          </div>
        </div>
      </section>

      {/* "Why Partner With Us?" Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-extrabold text-gray-900">A Better Way to Raise Money & Grow Your Business</h2>
                <p className="text-lg text-gray-600 mt-2 max-w-3xl mx-auto">FunraiseWNY is built to be a win for everyone. Here&apos;s how our partners benefit.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                
                {/* For Fundraisers Card */}
                <FeatureCard 
                    title="For Fundraisers"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5A2.5 2.5 0 0 1 2 6.5V2H0"/><path d="M18 9h-1.5A2.5 2.5 0 0 0 14 6.5V2H12"/><path d="M8 11l4-8 4 8H8z"/><path d="M14 11v6a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-6"/></svg>}
                >
                    <p>✅ **High Profit Share:** Keep a large portion of every membership sold.</p>
                    <p>✅ **No Inventory:** Say goodbye to handling products, order forms, and deliveries.</p>
                    <p>✅ **A Product People Want:** Offer your community a full year of savings at their favorite local spots.</p>
                </FeatureCard>

                {/* For Businesses Card */}
                <FeatureCard 
                    title="For Businesses"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 15v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4"/><path d="M16 14l-4 4-6-6-4 4"/></svg>}
                >
                    <p>✅ **Zero Upfront Cost:** Get featured on our platform for free. It&apos;s risk-free marketing.</p>
                    <p>✅ **Attract New Customers:** Drive loyal, community-minded supporters through your door.</p>
                    <p>✅ **Build Goodwill:** Show your support for local schools, teams, and organizations.</p>
                </FeatureCard>

            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 px-4">
        <div className="container mx-auto text-center text-sm">
          <p className="mb-2">© 2025 FunraiseWNY. All Rights Reserved.</p>
          <p className="text-gray-400">Made with ❤️ in Buffalo, NY.</p>
        </div>
      </footer>
    </main>
  );
}