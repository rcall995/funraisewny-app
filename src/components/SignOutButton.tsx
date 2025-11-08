'use client';

import { signOut } from '@/app/actions/signOut';

export default function SignOutButton() {
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="py-2 px-4 rounded-md bg-gray-600 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 cursor-pointer"
    >
      Sign Out
    </button>
  );
}