// src/app/login/login-form.tsx

'use client';

import { useSearchParams } from 'next/navigation';
import { signIn, signUp } from './actions';

export default function LoginForm() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message');
  const view = searchParams.get('view');
  const role = searchParams.get('role');

  const getRoleDisplayText = (roleKey: string | null) => {
    if (!roleKey) return 'Supporter';
    return roleKey.charAt(0).toUpperCase() + roleKey.slice(1);
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      {view === 'sign_up' ? (
        // --- SIGN UP FORM ---
        <form action={signUp}>
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
            Create Your <span className="text-red-500 font-extrabold">{getRoleDisplayText(role)}</span> Account
          </h1>
          <div className="space-y-4">
            <input type="hidden" name="role" value={role || 'supporter'} />
            <div>
              <label htmlFor="fullName">Full Name</label>
              <input id="fullName" name="fullName" type="text" required className="mt-1 block w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label htmlFor="email">Email Address</label>
              <input id="email" name="email" type="email" required className="mt-1 block w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label htmlFor="password">Password (min. 6 characters)</label>
              <input id="password" name="password" type="password" required className="mt-1 block w-full px-3 py-2 border rounded-md" />
            </div>
            <button type="submit" className="w-full py-2 px-4 rounded-md text-white bg-blue-600">Sign Up</button>
            <p className="text-sm text-center">Already have an account? <a href="/login" className="font-medium text-blue-600">Sign In</a></p>
          </div>
        </form>
      ) : (
        // --- SIGN IN FORM ---
        <form action={signIn}>
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Sign In</h1>
          <div className="space-y-4">
            <div>
              <label htmlFor="email">Email Address</label>
              <input id="email" name="email" type="email" required className="mt-1 block w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type="password" required className="mt-1 block w-full px-3 py-2 border rounded-md" />
            </div>
            <button type="submit" className="w-full py-2 px-4 rounded-md text-white bg-blue-600">Sign In</button>
            <p className="text-sm text-center">Don&apos;t have an account? <a href="/login?view=sign_up" className="font-medium text-blue-600">Sign Up</a></p>
          </div>
        </form>
      )}
      {message && (
        <p className="mt-4 p-4 bg-gray-100 text-gray-800 text-center rounded-md">
          {message}
        </p>
      )}
    </div>
  );
}