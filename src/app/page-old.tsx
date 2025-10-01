import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-4">
          Welcome to Funraise<span className="text-blue-600">WNY</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 mb-8">
          Support Local. Save Big.
        </p>
        <Link 
          href="/login" 
          className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-105"
        >
          Login / Sign Up
        </Link>
      </div>
    </main>
  );
}