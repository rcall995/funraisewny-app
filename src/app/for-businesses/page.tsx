import Link from 'next/link';

export default function ForBusinessesPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">For Businesses</h1>
      <p className="mb-4">This is where you&apos;ll explain the benefits for businesses...</p>
      <Link href="/login" className="text-blue-600 hover:underline">
        Get Started
      </Link>
    </div>
  );
}