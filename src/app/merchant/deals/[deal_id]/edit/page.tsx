'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import useUser from '@/hooks/useUser';

const DEAL_CATEGORIES = [
    'Food & Drink', 'Retail & Shopping', 'Health & Wellness',
    'Entertainment & Activities', 'Services', 'Automotive', 'Other'
];

type Deal = {
  title: string;
  description: string;
  category: string;
  terms: string | null;
}

export default function EditDealPage() {
    const supabase = createClientComponentClient();
    const router = useRouter();
    const params = useParams();
    const { user, isMerchant } = useUser();
    
    // Get the deal ID from the URL
    const dealId = params.deal_id as string;

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState(DEAL_CATEGORIES[0]);
    const [terms, setTerms] = useState('');
    
    // UI state
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch the existing deal data when the page loads
    useEffect(() => {
        const fetchDeal = async () => {
            if (!dealId || !isMerchant) return;

            const { data, error } = await supabase
                .from('deals')
                .select('title, description, category, terms')
                .eq('id', dealId)
                .single();
            
            if (error) {
                setError('Failed to load deal data. Please go back and try again.');
                console.error(error);
            } else if (data) {
                const dealData = data as Deal;
                setTitle(dealData.title);
                setDescription(dealData.description);
                setCategory(dealData.category);
                setTerms(dealData.terms || '');
            }
            setLoading(false);
        };
        fetchDeal();
    }, [dealId, isMerchant, supabase]);

    // Handle the form submission to update the deal
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const { error: updateError } = await supabase
            .from('deals')
            .update({
                title,
                description,
                category,
                terms: terms || null,
            })
            .eq('id', dealId);

        setLoading(false);

        if (updateError) {
            setError(`Failed to update deal: ${updateError.message}`);
        } else {
            // On success, redirect back to the merchant dashboard
            router.push('/merchant?success=deal_updated');
            router.refresh();
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading deal...</div>;
    }
    
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto p-4 sm:p-6 md:p-8 max-w-2xl">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
                    <div className="p-8 border-b">
                        <h1 className="text-3xl font-bold text-gray-900">Edit Deal</h1>
                        <p className="mt-2 text-gray-600">Update the details for your offer below.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Deal Title</label>
                            <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"/>
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"/>
                        </div>
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white">
                                {DEAL_CATEGORIES.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="terms" className="block text-sm font-medium text-gray-700 mb-1">Terms & Conditions (Optional)</label>
                            <textarea id="terms" value={terms} onChange={(e) => setTerms(e.target.value)} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"/>
                        </div>
                        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg"><p>{error}</p></div>}
                        <div className="flex items-center justify-end space-x-4 pt-4">
                            <Link href="/merchant" className="text-sm font-medium text-gray-600 hover:text-gray-900">Cancel</Link>
                            <button type="submit" disabled={loading} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400">
                                {loading ? 'Saving...' : 'Update Deal'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}