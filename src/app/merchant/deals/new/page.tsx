'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import useUser from '@/hooks/useUser';
import Link from 'next/link';

const DEAL_CATEGORIES = [
    'Food & Drink', 'Retail & Shopping', 'Health & Wellness',
    'Entertainment & Activities', 'Services', 'Automotive', 'Other'
];

export default function NewDealPage() {
    const supabase = createClientComponentClient();
    const router = useRouter();
    const { user, isMerchant, loading: userLoading } = useUser();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState(DEAL_CATEGORIES[0]);
    const [terms, setTerms] = useState('');
    const [businessId, setBusinessId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBusinessId = async () => {
            if (user && isMerchant) {
                const { data, error } = await supabase.from('businesses').select('id').eq('owner_id', user.id).single();
                if (error) {
                    setError('Could not find your associated business. Please contact support.');
                } else if (data) {
                    setBusinessId(data.id);
                }
            }
        };
        if (!userLoading) { fetchBusinessId(); }
    }, [user, isMerchant, userLoading, supabase]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!title || !description || !category || !businessId) {
            setError('Please fill all required fields and ensure business is verified.');
            return;
        }
        setLoading(true);
        const { error: insertError } = await supabase.from('deals').insert({
            business_id: businessId, title, description, category,
            terms: terms || null, is_active: true,
        });
        setLoading(false);
        if (insertError) {
            setError(`Failed to create deal: ${insertError.message}`);
        } else {
            router.push('/merchant?success=deal_created');
            router.refresh();
        }
    };

    if (userLoading) { return <div className="p-12 text-center">Loading...</div>; }
    if (!user || !isMerchant) { /* Access Denied JSX */ }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto p-4 sm:p-6 md:p-8 max-w-2xl">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
                    <div className="p-8 border-b">
                        <h1 className="text-3xl font-bold text-gray-900">Create a New Deal</h1>
                        <p className="mt-2 text-gray-600">Fill out the details below to add a new offer for FunraiseWNY members.</p>
                    </div>
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {/* Title Input */}
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Deal Title</label>
                            <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Buy One Get One Free Pizza" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"/>
                            <p className="text-xs text-gray-500 mt-1">A short, catchy title for your offer.</p>
                        </div>
                        {/* Description Input */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="e.g., Buy any large pizza and get a second of equal or lesser value for free." required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"/>
                            <p className="text-xs text-gray-500 mt-1">Provide more detail about what the customer will receive.</p>
                        </div>
                        {/* Category Select */}
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition bg-white">
                                {DEAL_CATEGORIES.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                            </select>
                        </div>
                        {/* Terms Input */}
                        <div>
                            <label htmlFor="terms" className="block text-sm font-medium text-gray-700 mb-1">Terms & Conditions (Optional)</label>
                            <textarea id="terms" value={terms} onChange={(e) => setTerms(e.target.value)} rows={3} placeholder="e.g., Not valid with other offers. Limit one per visit. Must present FunraiseWNY membership." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"/>
                            {/* FIX: Replaced quotes with &quot; */}
                            <p className="text-xs text-gray-500 mt-1">The &quot;fine print.&quot; List any restrictions or requirements.</p>
                        </div>
                        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert"><p>{error}</p></div>}
                        <div className="flex items-center justify-end space-x-4 pt-4">
                            <Link href="/merchant" className="text-sm font-medium text-gray-600 hover:text-gray-900">Cancel</Link>
                            <button type="submit" disabled={loading || !businessId} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-300">
                                {loading ? 'Creating...' : 'Create Deal'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}