'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState(''); // <-- New state for full name
  const [view, setView] = useState('sign-in'); // To toggle between sign-in and sign-up
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  const searchParams = useSearchParams();
  const role = searchParams.get('role');

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { data: { user }, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Pass the full name in the metadata
        data: {
          full_name: fullName,
        }
      }
    });

    if (error) {
      alert('Error signing up: ' + error.message);
    } else if (user) {
      if (role === 'merchant' || role === 'fundraiser') {
        await supabase.from('profiles').update({ role: role }).eq('id', user.id);
      }
      // We also need to update the profile with the full name
      await supabase.from('profiles').update({ full_name: fullName }).eq('id', user.id);
      
      alert('Success! Check your email for a confirmation link.');
      setView('sign-in'); // Switch back to sign-in view after successful sign-up
    }
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert('Error signing in: ' + error.message);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        {view === 'sign-in' ? (
            <form onSubmit={handleSignIn}>
                <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Sign In</h1>
                {/* ... Email and Password fields ... */}
                <div className="space-y-4">
                  <div>
                      <label htmlFor="email_signin" className="block text-sm font-medium text-gray-700">Email Address</label>
                      <input id="email_signin" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                  </div>
                  <div>
                      <label htmlFor="password_signin" className="block text-sm font-medium text-gray-700">Password</label>
                      <input id="password_signin" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                  </div>
                  <button type="submit" className="w-full py-2 px-4 rounded-md text-white bg-blue-600 hover:bg-blue-700">Sign In</button>
                  <p className="text-sm text-center">
                    Don&apos;t have an account?{' '}
                    <button type="button" onClick={() => setView('sign-up')} className="font-medium text-blue-600 hover:underline">Sign Up</button>
                  </p>
                </div>
            </form>
        ) : (
            <form onSubmit={handleSignUp}>
                <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
                    {role === 'merchant' ? 'Create Your Business Account' : 
                    role === 'fundraiser' ? 'Create Your Fundraiser Account' : 
                    'Sign Up'}
                </h1>
                {/* --- New Full Name Field --- */}
                <div className="space-y-4">
                  <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                      <input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                  </div>
                  {/* ... Email and Password fields ... */}
                  <div>
                      <label htmlFor="email_signup" className="block text-sm font-medium text-gray-700">Email Address</label>
                      <input id="email_signup" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                  </div>
                  <div>
                      <label htmlFor="password_signup" className="block text-sm font-medium text-gray-700">Password (min. 6 characters)</label>
                      <input id="password_signup" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                  </div>
                  <button type="submit" className="w-full py-2 px-4 rounded-md text-white bg-blue-600 hover:bg-blue-700">Sign Up</button>
                  <p className="text-sm text-center">
                    Already have an account?{' '}
                    <button type="button" onClick={() => setView('sign-in')} className="font-medium text-blue-600 hover:underline">Sign In</button>
                  </p>
                </div>
            </form>
        )}
    </div>
  );
}