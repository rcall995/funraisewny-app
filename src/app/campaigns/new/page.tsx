'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import useUser from '@/hooks/useUser';

// A helper function to create a URL-friendly slug
const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // remove special characters
    .replace(/\s+/g, '-')          // replace spaces with hyphens
    .replace(/-+/g, '-');          // remove multiple hyphens
};

export default function NewCampaignPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  
  const [campaignName, setCampaignName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [startDate, setStartDate] = useState(''); 
  const [endDate, setEndDate] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleCampaignNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setCampaignName(name);
    setSlug(generateSlug(name));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setLogoFile(e.target.files[0]);
    }
  };

  const handleCreateCampaign = async () => {
    if (!user || !campaignName || !goalAmount || !slug || !description) {
      setMessage('All text fields are required.');
      return;
    }
    
    setLoading(true);
    let logoUrl: string | null = null;

    if (logoFile) {
      const fileName = `${user.id}-${Date.now()}-${logoFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('campaign-logos')
        .upload(fileName, logoFile);

      if (uploadError) {
        setMessage('Error uploading logo: ' + uploadError.message);
        setLoading(false);
        return;
      }
      
      const { data: urlData } = supabase.storage
        .from('campaign-logos')
        .getPublicUrl(fileName);
      
      logoUrl = urlData.publicUrl;
    }

    const { error } = await supabase.from('campaigns').insert({
      campaign_name: campaignName,
      slug: slug,
      description: description,
      goal_amount: parseFloat(goalAmount),
      organizer_id: user.id,
      start_date: startDate || null,
      end_date: endDate || null,
      logo_url: logoUrl,
    });

    setLoading(false);
    if (error) {
      setMessage('Error creating campaign: ' + error.message);
    } else {
      router.push('/campaigns');
    }
  };

  if (userLoading) {
    return <div className="p-8">Loading user...</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Start a New Fundraiser</h1>
        <div className="space-y-4">
          <div>
            <label htmlFor="campaignName" className="block text-sm font-medium text-gray-700">Campaign Name</label>
            <input id="campaignName" type="text" value={campaignName} onChange={handleCampaignNameChange} placeholder="e.g., Spring 2025 Football Season" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
          </div>
          <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700">Shareable Link Name</label>
              {/* --- NEW SUGGESTION TEXT --- */}
              <p className="text-xs text-gray-500 mt-1">Keep it short and simple. This will be part of your public URL.</p>
              {/* ------------------------- */}
              <div className="flex items-center mt-1">
                  <span className="text-gray-500 text-sm bg-gray-100 p-2 rounded-l-md border border-r-0">funraisewny.com/support/</span>
                  <input id="slug" type="text" value={slug} onChange={(e) => setSlug(generateSlug(e.target.value))} className="block w-full px-3 py-2 border border-gray-300 rounded-r-md shadow-sm"/>
              </div>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Your Story</label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Tell your supporters why you&apos;re raising money." className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
          </div>
          <div>
            <label htmlFor="logo" className="block text-sm font-medium text-gray-700">Team Logo (Optional)</label>
            <input id="logo" type="file" onChange={handleFileChange} accept="image/png, image/jpeg" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
          </div>
          <div>
            <label htmlFor="goalAmount" className="block text-sm font-medium text-gray-700">Fundraising Goal ($)</label>
            <input id="goalAmount" type="number" value={goalAmount} onChange={(e) => setGoalAmount(e.target.value)} placeholder="e.g., 5000" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
              <input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
              <input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
            </div>
          </div>
          <button onClick={handleCreateCampaign} disabled={loading} className="w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
            {loading ? 'Creating...' : 'Create Campaign'}
          </button>
          {message && <p className={`mt-2 text-sm text-red-600`}>{message}</p>}
        </div>
      </div>
    </div>
  );
}