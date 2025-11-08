// src/app/campaigns/[id]/edit/page.tsx

'use client'; 

import { useState, useEffect, useCallback, useRef } from 'react'; // Added useRef
import { useRouter, useParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import useUser from '@/hooks/useUser';
import { v4 as uuidv4 } from 'uuid'; // For unique file names

// You'll need to install uuid if you haven't already:
// npm install uuid
// npm install --save-dev @types/uuid

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const EditCampaignPage: React.FC<any> = () => {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  
  const params = useParams();
  const rawCampaignId = params.id;
  const campaignId = Array.isArray(rawCampaignId) ? rawCampaignId[0] : (rawCampaignId as string);

  // Original states
  const [campaignName, setCampaignName] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | null>(null); // To display the existing logo
  const [logoFile, setLogoFile] = useState<File | null>(null); // For the new uploaded file
  const [description, setDescription] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Ref for the file input to clear it
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchCampaign = useCallback(async () => {
    if (!user || !campaignId) return; 
    setLoading(true);

    const { data, error } = await supabase
      .from('campaigns')
      .select('campaign_name, goal_amount, start_date, end_date, logo_url, description')
      .eq('id', campaignId)
      .eq('organizer_id', user.id)
      .single();
    
    setLoading(false);

    if (error) { 
      setMessage('Error fetching campaign: ' + error.message);
      return;
    }
    
    if (!data) { 
      setMessage('Campaign not found or you do not have permission to edit it.');
      return;
    }

    setCampaignName(data.campaign_name);
    setGoalAmount(data.goal_amount ? data.goal_amount.toString() : '');
    setStartDate(data.start_date ? data.start_date.slice(0, 10) : '');
    setEndDate(data.end_date ? data.end_date.slice(0, 10) : '');
    setCurrentLogoUrl(data.logo_url); // <-- Set current logo URL
    setDescription(data.description || ''); 

  }, [supabase, campaignId, user]);

  useEffect(() => {
    if(user && campaignId) {
      fetchCampaign();
    }
  }, [user, campaignId, fetchCampaign]);

  const handleLogoUpload = async (): Promise<string | null> => {
    if (!logoFile || !user) {
      return currentLogoUrl; // No new file to upload, keep existing or null
    }

    const fileExt = logoFile.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`; // Generate a unique file name
    const filePath = `${user.id}/${fileName}`; // Store under user's ID within the bucket

    setLoading(true);
    const { error: uploadError } = await supabase.storage
      .from('campaign-logos') // Your campaign-logos bucket
      .upload(filePath, logoFile, {
        cacheControl: '3600',
        upsert: true, // Overwrite if file with same name exists (though UUID prevents this)
      });
    setLoading(false);

    if (uploadError) {
      setMessage('Error uploading logo: ' + uploadError.message);
      return null;
    }

    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from('campaign-logos')
      .getPublicUrl(filePath);

    if (publicUrlData.publicUrl) {
      setMessage('Logo uploaded successfully!');
      // Clear the file input after successful upload
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setLogoFile(null); // Clear the selected file state
      return publicUrlData.publicUrl;
    } else {
      setMessage('Error getting public URL for logo.');
      return null;
    }
  };


  const handleUpdateCampaign = async () => {
    if (!campaignName || !goalAmount) {
      setMessage('Campaign name and goal amount are required.');
      return;
    }
    
    setLoading(true);
    setMessage('Saving changes...');

    let newLogoUrl = currentLogoUrl;
    if (logoFile) {
        newLogoUrl = await handleLogoUpload(); // Upload new file and get URL
        if (newLogoUrl === null) {
            setLoading(false);
            return; // Stop if logo upload failed
        }
    }

    const { error } = await supabase
      .from('campaigns')
      .update({
        campaign_name: campaignName,
        goal_amount: parseFloat(goalAmount),
        start_date: startDate || null, 
        end_date: endDate || null, 
        logo_url: newLogoUrl, // <-- Use the new or existing logo URL
        description: description || null, 
      })
      .eq('id', campaignId);

    setLoading(false);
    if (error) {
      setMessage('Error updating campaign: ' + error.message);
    } else {
      setMessage('Campaign successfully updated!');
      // Update the currentLogoUrl state to reflect the new logo after successful save
      if (newLogoUrl) {
          setCurrentLogoUrl(newLogoUrl);
      }
      // Optional: Redirect back to campaigns list after a short delay
      setTimeout(() => router.push('/campaigns'), 1500); 
    }
  };

  if (userLoading || loading) {
    return <div className="p-8 text-center text-gray-500">Loading campaign details...</div>;
  }
  
  if (message && !campaignName && !loading) { // Display error if campaign not found
      return <div className="p-8 text-center text-red-600 font-semibold">{message}</div>;
  }


  return (
    <div className="container mx-auto p-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
        <h1 className="text-3xl font-extrabold mb-8 text-gray-800 border-b pb-4">Edit Fundraiser: {campaignName}</h1>
        
        {message && (
            <p className={`mb-4 p-3 rounded-lg text-sm font-medium ${message.includes('Error') ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                {message}
            </p>
        )}

        <div className="space-y-6">
          
          {/* Campaign Name & Goal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="campaignName" className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
              <input id="campaignName" type="text" value={campaignName} onChange={(e) => setCampaignName(e.target.value)} className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"/>
            </div>
            <div>
              <label htmlFor="goalAmount" className="block text-sm font-medium text-gray-700 mb-1">Fundraising Goal ($)</label>
              <input id="goalAmount" type="number" value={goalAmount} onChange={(e) => setGoalAmount(e.target.value)} className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"/>
            </div>
          </div>
          
          {/* Logo Upload Section */}
          <div>
            <label htmlFor="logoUpload" className="block text-sm font-medium text-gray-700 mb-1">Campaign Logo</label>
            <div className="flex items-center space-x-4">
                {currentLogoUrl ? (
                    <img src={currentLogoUrl} alt="Current Campaign Logo" className="w-24 h-24 object-contain border rounded-md p-1 bg-gray-50"/>
                ) : (
                    <div className="w-24 h-24 flex items-center justify-center border rounded-md bg-gray-50 text-gray-400 text-xs text-center">No Logo</div>
                )}
                <input 
                    id="logoUpload" 
                    type="file" 
                    accept="image/*" // Accept any image file
                    onChange={(e) => setLogoFile(e.target.files ? e.target.files[0] : null)} 
                    className="flex-grow block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    ref={fileInputRef} // Assign ref to clear input
                />
            </div>
          </div>

          {/* Description / Details */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Campaign Description</label>
            <textarea 
                id="description" 
                rows={3}
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Date Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"/>
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"/>
            </div>
          </div>
          
          <button
            onClick={handleUpdateCampaign}
            disabled={loading}
            className="w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-md text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 transition duration-150"
          >
            {loading ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditCampaignPage;