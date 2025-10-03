'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { User } from '@supabase/supabase-js';

type BusinessProfileFormProps = {
  user: User;
  onSave: () => void;
  initialData: {
    id: number;
    business_name: string;
    address: string;
    phone: string;
    logo_url: string | null;
  } | null;
};

export default function BusinessProfileForm({ user, onSave, initialData }: BusinessProfileFormProps) {
  const supabase = createClientComponentClient();
  const [businessName, setBusinessName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>('');
  
  // New state for file uploading
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
      // Optional: Client-side validation for file size (e.g., 1MB)
      if (file.size > 1024 * 1024) {
          setMessage('File is too large. Please select an image under 1MB.');
          return;
      }
      setLogoFile(file);
      // Create a temporary URL to preview the image
      setLogoUrl(URL.createObjectURL(file));
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

    // Step 1: If a new file was selected, upload it first.
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
      
      // Step 2: Get the public URL of the uploaded file.
      const { data: urlData } = supabase.storage
        .from('logos')
        .getPublicUrl(uploadData.path);
        
      newLogoUrl = urlData.publicUrl;
    }

    // Step 3: Prepare the data for the database.
    const profileData = {
      business_name: businessName,
      address: address,
      phone: phone,
      logo_url: newLogoUrl,
      owner_id: user.id,
    };

    // Step 4: Insert or Update the 'businesses' table.
    let dbError;
    if (initialData) {
      ({ error: dbError } = await supabase.from('businesses').update(profileData).eq('id', initialData.id));
    } else {
      ({ error: dbError } = await supabase.from('businesses').insert(profileData));
    }

    setUploading(false);
    if (dbError) {
      setMessage('Error saving profile: ' + dbError.message);
    } else {
      setLogoFile(null); // Clear the selected file
      onSave(); // Tell the parent page to refresh data
    }
  };

  return (
    <div className="space-y-4">
      {/* Name, Address, Phone inputs (no changes) */}
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
      
      {/* --- NEW LOGO UPLOAD FIELD --- */}
      <div>
        <label htmlFor="logoUpload" className="block text-sm font-medium text-gray-700">Business Logo</label>
        {logoUrl && <img src={logoUrl} alt="Logo Preview" className="w-24 h-24 mt-2 object-contain rounded-md border p-1" />}
        <input 
          id="logoUpload" 
          type="file" 
          accept="image/png, image/jpeg"
          onChange={handleFileChange} 
          disabled={uploading}
          className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <p className="mt-1 text-xs text-gray-500">Upload a PNG or JPG file, max 1MB.</p>
      </div>
      {/* --- END NEW LOGO UPLOAD FIELD --- */}

      <button
        onClick={handleSaveProfile}
        disabled={uploading}
        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
      >
        {uploading ? 'Saving...' : 'Save Profile'}
      </button>
      {message && <p className={`mt-4 text-sm ${message.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>{message}</p>}
    </div>
  );
}