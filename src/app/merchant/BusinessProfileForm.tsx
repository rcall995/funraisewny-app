'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { User } from '@supabase/supabase-js';

type BusinessProfile = {
  id: number;
  business_name: string;
  address: string;
  phone: string;
};

type BusinessProfileFormProps = {
  user: User;
  onSave: () => void;
  initialData: BusinessProfile | null;
};

export default function BusinessProfileForm({ user, onSave, initialData }: BusinessProfileFormProps) {
  const supabase = createClientComponentClient();
  const [businessName, setBusinessName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setBusinessName(initialData.business_name || '');
      setAddress(initialData.address || '');
      setPhone(initialData.phone || '');
    }
  }, [initialData]);

  const handleSaveProfile = async () => {
    setLoading(true);
    setMessage('');
    if (!businessName) {
      setMessage('Business name is required.');
      setLoading(false);
      return;
    }

    const profileData = {
      business_name: businessName,
      address: address,
      phone: phone,
      owner_id: user.id, // Always ensure owner_id is set
    };

    let error;

    if (initialData) {
      // UPDATE logic
      ({ error } = await supabase
        .from('businesses')
        .update(profileData)
        .eq('id', initialData.id));
    } else {
      // INSERT logic
      ({ error } = await supabase.from('businesses').insert(profileData));
    }

    setLoading(false);
    if (error) {
      setMessage('Error saving profile: ' + error.message);
    } else {
      onSave(); // Tell the parent page we're done
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">Business Name</label>
        <input id="businessName" type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
      </div>
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
        <input id="address" type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
        <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
      </div>
      <button
        onClick={handleSaveProfile}
        disabled={loading}
        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
      >
        {loading ? 'Saving...' : 'Save Profile'}
      </button>
      {message && <p className="mt-4 text-sm text-red-600">{message}</p>}
    </div>
  );
}