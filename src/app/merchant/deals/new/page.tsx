'use client';
import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import useUser from '@/hooks/useUser';

const DEAL_CATEGORIES = [ 'Food & Drink', 'Retail & Shopping', 'Health & Wellness', 'Entertainment & Activities', 'Services', 'Automotive', 'Other' ];

export default function NewDealPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const { user } = useUser();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(DEAL_CATEGORIES[0]);
  const [terms, setTerms] = useState('');
  const [businessId, setBusinessId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusinessId = async () => {
        if (user) {
            const { data: businesses } = await supabase.from('businesses').select('id').eq('owner_id', user.id).limit(1);
            if (businesses && businesses.length > 0) {
                setBusinessId(businesses[0].id);
            }
        }
    };
    fetchBusinessId();
  }, [supabase, user]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!businessId) {
        setError("Could not find an associated business. Please create a business profile first.");
        return;
    }
    setLoading(true);
    
    const { error: insertError } = await supabase.from('deals').insert({
      business_id: businessId,
      title,
      description,
      category,
      terms: terms || null,
      status: 'active',
      approval_status: 'pending',
    });

    setLoading(false);
    if (insertError) { setError(insertError.message); } 
    else { router.push('/merchant'); router.refresh(); }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto p-4 sm:p-6 md:p-8 max-w-2xl">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
                <div className="p-8 border-b">
                    <h1 className="text-3xl font-bold text-gray-900">Create a New Deal</h1>
                    <p className="mt-2 text-gray-600">Fill out the details below to add a new offer.</p>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Deal Title</label>
                        <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg"/>
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} required className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg"/>
                    </div>
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} required className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg bg-white">
                            {DEAL_CATEGORIES.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="terms" className="block text-sm font-medium text-gray-700 mb-1">Terms & Conditions (Optional)</label>
                        <textarea id="terms" value={terms} onChange={(e) => setTerms(e.target.value)} rows={3} className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg"/>
                    </div>
                    {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg">{error}</div>}
                    <div className="flex items-center justify-end space-x-4 pt-4">
                        <Link href="/merchant" className="text-sm font-medium text-gray-600 hover:text-gray-900">Cancel</Link>
                        <button type="submit" disabled={loading || !businessId} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400">
                            {loading ? 'Saving...' : 'Create Deal'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
  );
}