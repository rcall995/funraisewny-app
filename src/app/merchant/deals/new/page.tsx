'use client';

import Link from 'next/link';

export default function NewDealPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="container mx-auto p-4 max-w-2xl text-center bg-white rounded-lg shadow-xl">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Create New Deal</h1>
                <p className="text-lg text-gray-600">This page is under construction.</p>
                <p className="mt-4 text-gray-500">The interface for adding new deals will be built here soon.</p>
                <Link href="/merchant" className="mt-6 inline-block text-blue-600 hover:underline">
                    ← Back to Dashboard
                </Link>
            </div>
        </div>
    );
}
