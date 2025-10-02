'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  // Read the 'role' from the URL query parameters
  const searchParams = useSearchParams();
  const role = searchParams.get('role');

  const handleSignUp = async () => {
    const { data: { user }, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        // You can add email redirect paths here if needed
      }
    });

    if (error) {
      alert('Error signing up: ' + error.message);
    } else if (user) {
      // If a role was passed in the URL, update the new user's profile
      if (role === 'merchant' || role === 'fundraiser') {
        await supabase
          .from('profiles')
          .update({ role: role })
          .eq('id', user.id);
      }
      alert('Success! Check your email for a confirmation link.');
      // Optionally, you could redirect to a specific welcome page here
    }
  };

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      alert('Error signing in: ' + error.message);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          {/* Dynamically change the title based on the role */}
          {role === 'merchant' ? 'Create Your Business Account' : 
           role === 'fundraiser' ? 'Create Your Fundraiser Account' : 
           'Sign In / Sign Up'}
        </h1>
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
          </div>
          <div className="flex items-center justify-between space-x-4 pt-2">
            <button onClick={handleSignIn} className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
              Sign In
            </button>
            <button onClick={handleSignUp} className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}