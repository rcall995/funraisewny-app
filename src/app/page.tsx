'use client';

import React from 'react';
import Link from 'next/link';

/* eslint-disable @next/next/no-img-element */

const IconWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-4">
    {children}
  </div>
);

export default function MarketingPage() {
  
  const handleEmailSignup = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const messageElement = document.getElementById('signup-message');
    if (messageElement) {
        messageElement.textContent = "Thank you for signing up! We'll notify you when FunraiseWNY officially launches.";
        messageElement.classList.remove('hidden');
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* 1. HERO SECTION */}
      <section className="text-center py-16 md:py-24 px-4 bg-gray-50/50">
        <div className="container mx-auto max-w-4xl">
          
          <img
            src="/image_acafef.png"
            alt="FunraiseWNY Logo"
            className="h-16 md:h-20 w-auto mx-auto mb-8" // Increased height (e.g., from h-12/h-16 to h-16/h-20)
          />
          
          <span className="inline-block px-3 py-1 text-sm font-semibold text-blue-600 bg-blue-100 rounded-full mb-6 shadow-md">
            Launching Soon!
          </span>
          <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            Support Local WNY. Save Big.
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
            The new way to raise money for your group by offering your supporters what they actually want: amazing deals at the best local spots across Western New York.
          </p>
          <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4">
            <Link href="/for-businesses" className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-xl hover:bg-blue-700 transition duration-300 inline-block text-center">
              For Businesses
            </Link>
            <Link href="/for-fundraisers" className="w-full md:w-auto px-8 py-3 bg-white text-gray-800 font-bold border-2 border-gray-200 rounded-lg shadow-xl hover:bg-gray-100 transition duration-300 inline-block text-center">
              For Fundraisers
            </Link>
          </div>
        </div>
      </section>

      {/* ... (The rest of your marketing page remains the same) ... */}
      
      {/* 2. A Win for Everyone Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <h3 className="text-4xl font-extrabold text-gray-900 mb-4">A Win for Everyone in WNY</h3>
          <p className="text-lg text-gray-600 mb-12">Our platform creates a powerful cycle of community support.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5A2.5 2.5 0 0 1 2 6.5V2H0"/><path d="M18 9h-1.5A2.5 2.5 0 0 0 14 6.5V2H12"/><path d="M8 11l4-8 4 8H8z"/><path d="M14 11v6a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-6"/></svg></IconWrapper>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Fundraisers Raise More</h4>
              <p className="text-gray-600">Groups sell a valuable digital membership your supporters will love, keeping a large portion of every sale.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8V6a2 2 0 0 0-2-2H2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2l4-4-4-4zM8 12a1 1 0 1 0 0 2 1 1 0 0 0 0-2zM12 12a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/></svg></IconWrapper>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Supporters Save Money</h4>
                <p className="text-gray-600">For a small annual fee, supporters unlock hundreds of real discounts at local WNY businesses.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 15v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4"/><path d="M16 14l-4 4-6-6-4 4"/></svg></IconWrapper>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Businesses Gain Customers</h4>
                <p className="text-gray-600">Get featured for free and attract new, community-focused customers. It&apos;s powerful, risk-free marketing.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. WNY Business Owner Callout */}
      <section className="py-20 px-4 bg-blue-600 text-white">
        <div className="container mx-auto max-w-3xl text-center">
          <h3 className="text-4xl font-extrabold mb-4">Are You a WNY Business Owner?</h3>
          <p className="text-lg mb-8 opacity-90">Join our platform for free and let Western New York&apos;s fundraising network become your new marketing team.</p>
          <Link href="/login" className="inline-block px-10 py-4 bg-white text-blue-600 font-bold rounded-lg shadow-2xl hover:bg-gray-100 transition duration-300 text-lg text-center">
            Get Your Business Featured
          </Link>
        </div>
      </section>

      {/* 4. Fundraiser Callout */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h3 className="text-4xl font-extrabold text-gray-900 mb-4">Need a Better Fundraiser?</h3>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">Partner with Funraise WNY to offer a product that sells itself and gives back to your community.</p>
          <Link href="/login" className="inline-block px-10 py-4 bg-gray-800 text-white font-bold rounded-lg shadow-xl hover:bg-gray-700 transition duration-300 text-lg text-center">
            Start Your Fundraiser
          </Link>
        </div>
      </section>

      {/* 5. Be the First to Know (Email Capture) */}
      <section className="py-20 px-4 bg-gray-50/50">
        <div className="container mx-auto max-w-2xl text-center">
          <h3 className="text-3xl font-extrabold text-gray-900 mb-4">Be the First to Know!</h3>
          <p className="text-lg text-gray-600 mb-6">Sign up for updates and be the first to know when we officially launch!</p>
          <form onSubmit={handleEmailSignup} className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <input type="email" placeholder="Enter your email address" aria-label="Email address" required className="w-full sm:w-2/3 px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-300"/>
            <button type="submit" className="w-full sm:w-1/3 px-4 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transition duration-300">
              Notify Me
            </button>
          </form>
          <p id="signup-message" className="mt-4 text-sm font-medium text-green-600 hidden"></p>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="bg-gray-800 text-white py-6 px-4">
        <div className="container mx-auto text-center text-sm">
          <p className="mb-2">© 2025 Funraise WNY. All Rights Reserved.</p>
          <p className="text-gray-400">Made with <span className="text-red-500">❤️</span> in Buffalo, NY.</p>
        </div>
      </footer>
    </div>
  );
}