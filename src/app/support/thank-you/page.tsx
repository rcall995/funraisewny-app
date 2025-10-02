import Link from 'next/link';

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center p-8">
      <div className="bg-white p-12 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-green-600">Thank You!</h1>
        <p className="text-lg text-gray-700 mt-4">Your membership is now active.</p>
        <p className="text-gray-600 mt-2">You can now access all the deals available on the platform.</p>
        <Link 
          href="/" 
          className="mt-8 inline-block bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-blue-700"
        >
          Start Saving Now
        </Link>
      </div>
    </div>
  );
}