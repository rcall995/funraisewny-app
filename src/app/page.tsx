'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function ComingSoonPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-lg w-full">
        <Image
          src="/logo.png"
          alt="FunraiseWNY Logo"
          width={400}
          height={120}
          className="w-4/5 max-w-[380px] mx-auto mb-10 h-auto"
          priority
        />

        <div className="inline-block bg-green-100 text-green-800 text-sm font-semibold px-4 py-1.5 rounded-full mb-6 tracking-wide uppercase">
          Coming Soon
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
          A Better Way to Fundraise in Western New York
        </h1>

        <p className="text-gray-600 text-lg mb-10 max-w-md mx-auto">
          We&apos;re building something special for local organizations and businesses. Be the first to know when we launch.
        </p>

        {submitted ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <p className="text-green-800 font-semibold text-lg">You&apos;re on the list!</p>
            <p className="text-green-700 text-sm mt-1">We&apos;ll let you know as soon as we launch.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transition duration-200 whitespace-nowrap"
            >
              Notify Me
            </button>
          </form>
        )}

        {error && (
          <p className="text-red-600 text-sm mt-3">{error}</p>
        )}

        <p className="text-gray-400 text-sm mt-12">
          &copy; 2026 Funraise WNY &middot; Buffalo, NY
        </p>
      </div>
    </div>
  );
}
