// src/components/BusinessProfileForm.tsx

'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';
import Image from 'next/image';

type BusinessProfile = {
  id: number;
  business_name: string;
  address: string;
  phone: string;
  logo_url: string | null;
} | null;

type BusinessProfileFormProps = {
  user: User;
  onSave: () => void;
  initialData: BusinessProfile;
};

export default function BusinessProfileForm({ user, onSave, initialData }: BusinessProfileFormProps) {
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const [businessName, setBusinessName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>('');
  
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (initialData) {
      setBusinessName(initialData.business_name || '');
      setAddress(initialData.address || '');
      setPhone(initialData.phone || '');
      setLogoUrl(initialData.logo_url || '');
    }
  }, [initialData]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > 1024 * 1024) { // 1MB limit
        setMessage('File is too large. Please select an image under 1MB.');
        return;
      }
      setLogoFile(file);
      setLogoUrl(URL.createObjectURL(file)); // Show preview
    }
  };

  const handleSaveProfile = async () => {
    setUploading(true);
    setMessage('');
    if (!businessName) {
      setMessage('Business name is required.');
      setUploading(false);
      return;
    }

    let newLogoUrl = initialData?.logo_url || null;

    if (logoFile) {
      const fileExt = logoFile.name.split('.').pop();
      const filePath = `public/${user.id}-${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, logoFile);

      if (uploadError) {
        setMessage('Error uploading logo: ' + uploadError.message);
        setUploading(false);
        return;
      }
      
      const { data: urlData } = supabase.storage.from('logos').getPublicUrl(uploadData.path);
      newLogoUrl = urlData.publicUrl;
    }

    const profileData = {
      business_name: businessName,
      address: address,
      phone: phone,
      logo_url: newLogoUrl,
      owner_id: user.id,
    };

    const { error: dbError } = initialData
      ? await supabase.from('businesses').update(profileData).eq('id', initialData.id)
      : await supabase.from('businesses').insert(profileData);

    setUploading(false);
    if (dbError) {
      setMessage('Error saving profile: ' + dbError.message);
    } else {
      setMessage('Profile saved successfully!');
      setLogoFile(null);
      onSave(); // Refresh the parent component's data
    }
  };

  return (
    <div className="space-y-4">
        {/* --- THESE FIELDS WERE MISSING --- */}
        <div>
            <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">Business Name</label>
            <input id="businessName" type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required />
        </div>
        <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
            <input id="address" type="text" value={address} onChange={(e) => setAddress(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
        </div>
        <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
            <input id="phone" type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
        </div>
        {/* --- END OF MISSING FIELDS --- */}

        <div>
            <label htmlFor="logoUpload" className="block text-sm font-medium text-gray-700">Business Logo</label>
            {logoUrl && (
                <Image src={logoUrl} alt="Logo Preview" width={96} height={96}
                    className="w-24 h-24 mt-2 object-contain rounded-md border p-1" />
            )}
            <input id="logoUpload" type="file" accept="image/png, image/jpeg" onChange={handleFileChange} disabled={uploading}
                className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            <p className="mt-1 text-xs text-gray-500">Upload a PNG or JPG file, max 1MB.</p>
        </div>

        <button onClick={handleSaveProfile} disabled={uploading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400">
            {uploading ? 'Saving...' : 'Save Profile'}
        </button>

        {message && <p className={`mt-4 text-sm ${message.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>{message}</p>}
    </div>
  );
}