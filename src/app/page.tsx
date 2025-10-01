'use client';

import React from 'react';
// Removed 'import Link from "next/link"' to resolve the compilation error

// Simple Icons using inline SVG for the feature cards
const IconWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-4">
    {children}
  </div>
);

// --- Component Definition ---
export default function MarketingPage() {
  
  // Placeholder function for email signup handling
  const handleEmailSignup = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, you would send the email to your backend/Supabase here.
    // NOTE: Using a custom modal/message box instead of alert() for compliance.
    console.log("Email signup submitted.");
    // Display a message rather than using the banned alert() function
    const messageElement = document.getElementById('signup-message');
    if (messageElement) {
        messageElement.textContent = "Thank you for signing up! We'll notify you when FunraiseWNY officially launches.";
        messageElement.classList.remove('hidden');
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navigation (Placeholder based on screenshot logo) */}
      <header className="p-4 md:p-6 shadow-sm">
        <div className="container mx-auto max-w-7xl">
          <h1 className="text-2xl font-extrabold text-blue-600">FunraiseWNY</h1>
        </div>
      </header>

      {/* 1. HERO SECTION (IMG_4617.PNG) */}
      <section className="text-center py-16 md:py-32 px-4 bg-gray-50/50">
        <div className="container mx-auto max-w-4xl">
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
            {/* Replaced <Link> with <a> */}
            <a href="/for-businesses" className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-xl hover:bg-blue-700 transition duration-300 inline-block">
              For Businesses
            </a>
            {/* Replaced <Link> with <a> */}
            <a href="/for-fundraisers" className="w-full md:w-auto px-8 py-3 bg-white text-gray-800 font-bold border-2 border-gray-200 rounded-lg shadow-xl hover:bg-gray-100 transition duration-300 inline-block">
              For Fundraisers
            </a>
          </div>
        </div>
      </section>

      {/* 2. A Win for Everyone Section (IMG_4618.PNG & IMG_4619.PNG - Top) */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <h3 className="text-4xl font-extrabold text-gray-900 mb-4">
            A Win for Everyone in WNY
          </h3>
          <p className="text-lg text-gray-600 mb-12">
            Our platform creates a powerful cycle of community support.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Card 1: Fundraisers Raise More */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <IconWrapper>
                {/* Trophy/Celebration Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trophy"><path d="M6 9H4.5A2.5 2.5 0 0 1 2 6.5V2H0"/><path d="M18 9h-1.5A2.5 2.5 0 0 0 14 6.5V2H12"/><path d="M8 11l4-8 4 8H8z"/><path d="M14 11v6a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-6"/></svg>
              </IconWrapper>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Fundraisers Raise More</h4>
              <p className="text-gray-600">
                Groups sell a valuable digital membership your supporters will love, keeping a large portion of every sale. No more selling wrapping paper.
              </p>
            </div>

            {/* Card 2: Supporters Save Money */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <IconWrapper>
                {/* Piggy Bank Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-piggy-bank"><path d="M16 8V6a2 2 0 0 0-2-2H2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2l4-4-4-4zM8 12a1 1 0 1 0 0 2 1 1 0 0 0 0-2zM12 12a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/></svg>
              </IconWrapper>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Supporters Save Money</h4>
              <p className="text-gray-600">
                For a small annual fee, supporters unlock hundreds of real discounts at local WNY restaurants, shops, and attractions for a full year.
              </p>
            </div>

            {/* Card 3: Businesses Gain Customers */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <IconWrapper>
                {/* Chart/Trend Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-line-chart"><path d="M3 15v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4"/><path d="M16 14l-4 4-6-6-4 4"/></svg>
              </IconWrapper>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Businesses Gain Customers</h4>
              <p className="text-gray-600">
                Get featured for free and attract new, community-focused customers. It&apos;s powerful, risk-free marketing.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 3. WNY Business Owner Callout (IMG_4619.PNG - Bottom) */}
      <section className="py-20 px-4 bg-blue-600 text-white">
        <div className="container mx-auto max-w-3xl text-center">
          <h3 className="text-4xl font-extrabold mb-4">
            Are You a WNY Business Owner?
          </h3>
          <p className="text-lg mb-8 opacity-90">
            Join our platform for free and let Western New York&apos;s fundraising network become your new marketing team. Drive new customers through your door with zero upfront cost.
          </p>
           {/* Replaced <Link> with <a> */}
          <a href="/business-signup" className="inline-block px-10 py-4 bg-white text-blue-600 font-bold rounded-lg shadow-2xl hover:bg-gray-100 transition duration-300 text-lg">
            Get Your Business Featured for Free
          </a>
        </div>
      </section>

      {/* 4. Fundraiser Callout & Email Signup (IMG_4620.PNG) */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h3 className="text-4xl font-extrabold text-gray-900 mb-4">
            Need a Better Fundraiser?
          </h3>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
            Stop selling things people don&apos;t want. Partner with Funraise WNY to offer a product that sells itself and gives back to your community. Perfect for sports teams, schools, and non-profits.
          </p>
           {/* Replaced <Link> with <a> */}
          <a href="/fundraiser-pilot" className="inline-block px-10 py-4 bg-gray-800 text-white font-bold rounded-lg shadow-xl hover:bg-gray-700 transition duration-300 text-lg">
            Become a Pilot Fundraising Partner
          </a>
        </div>
      </section>

      {/* 5. Be the First to Know (Email Capture) */}
      <section className="py-20 px-4 bg-gray-50/50">
        <div className="container mx-auto max-w-2xl text-center">
          <h3 className="text-3xl font-extrabold text-gray-900 mb-4">
            Be the First to Know!
          </h3>
          <p className="text-lg text-gray-600 mb-6">
            Want to be notified when Funraise WNY officially launches? Sign up for updates and get ready to support your community and save!
          </p>
          <form onSubmit={handleEmailSignup} className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <input
              type="email"
              placeholder="Enter your email address"
              aria-label="Email address"
              required
              className="w-full sm:w-2/3 px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-300"
            />
            <button
              type="submit"
              className="w-full sm:w-1/3 px-4 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transition duration-300"
            >
              Notify Me
            </button>
          </form>
          {/* Message placeholder for non-alert feedback */}
          <p id="signup-message" className="mt-4 text-sm font-medium text-green-600 hidden"></p>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="bg-gray-800 text-white py-6 px-4">
        <div className="container mx-auto text-center text-sm">
          <p className="mb-2">© 2025 Funraise WNY. All Rights Reserved.</p>
          <p className="text-gray-400">
            Made with <span className="text-red-500">❤️</span> in Buffalo, NY.
          </p>
        </div>
      </footer>
    </div>
  );
}
