'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';

type Deal = {
  id: number;
  title: string;
  description: string;
  fine_print: string | null;
};

type DealFormProps = {
  businessId: number;
  onSave: () => void;
  onCancel: () => void;
  initialData: Deal | null;
};

export default function DealForm({ businessId, onSave, onCancel, initialData }: DealFormProps) {
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [finePrint, setFinePrint] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setFinePrint(initialData.fine_print || '');
    }
  }, [initialData]);

  const handleSaveDeal = async () => {
    setLoading(true);
    setMessage('');
    if (!title || !description) {
      setMessage('Title and description are required.');
      setLoading(false);
      return;
    }

    const dealData = {
      title,
      description,
      fine_print: finePrint,
      business_id: businessId,
    };

    let error;

    if (initialData) {
      // UPDATE logic
      ({ error } = await supabase
        .from('deals')
        .update(dealData)
        .eq('id', initialData.id));
    } else {
      // INSERT logic
      ({ error } = await supabase.from('deals').insert(dealData));
    }

    setLoading(false);
    if (error) {
      setMessage('Error saving deal: ' + error.message);
    } else {
      onSave(); // Tell the parent page we're done and to refresh
    }
  };

  return (
    <div className="mt-6 border-t pt-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">
        {initialData ? 'Edit Deal' : 'Add a New Deal'}
      </h3>
      <div className="space-y-4 max-w-lg">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Deal Title</label>
          <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., BOGO Free Coffee" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g., Buy any specialty coffee, get one free." className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
        </div>
        <div>
          <label htmlFor="finePrint" className="block text-sm font-medium text-gray-700">Fine Print (Optional)</label>
          <input id="finePrint" type="text" value={finePrint} onChange={(e) => setFinePrint(e.target.value)} placeholder="e.g., Not valid on holidays." className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={handleSaveDeal}
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
          >
            {loading ? 'Saving...' : (initialData ? 'Update Deal' : 'Save Deal')}
          </button>
          <button
            onClick={onCancel}
            className="py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
        {message && <p className={`mt-2 text-sm ${message.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>{message}</p>}
      </div>
    </div>
  );
}