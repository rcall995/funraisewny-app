import Link from 'next/link';

export const metadata = {
  title: 'Contact Us | Funraise WNY',
};

export default function ContactPage() {
  return (
    <main className="bg-gray-50 min-h-screen py-16 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900">Contact Us</h1>
          <p className="text-lg text-gray-600 mt-3">
            Have a question about FunraiseWNY? We&apos;d love to hear from you.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-8 md:p-12">
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">General Inquiries</h2>
              <p className="text-gray-600 mb-1">
                For questions about the platform, partnerships, or anything else:
              </p>
              <a
                href="mailto:info@funraisewny.com"
                className="text-blue-600 hover:underline font-semibold text-lg"
              >
                info@funraisewny.com
              </a>
            </div>

            <hr className="border-gray-200" />

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">For Businesses</h2>
              <p className="text-gray-600">
                Interested in becoming a partner business? Getting started is free and takes just a few minutes.
              </p>
              <Link
                href="/for-businesses"
                className="mt-3 inline-block px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
              >
                Learn More
              </Link>
            </div>

            <hr className="border-gray-200" />

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">For Fundraisers</h2>
              <p className="text-gray-600">
                Want to start a fundraiser for your team, school, or organization?
              </p>
              <Link
                href="/for-fundraisers"
                className="mt-3 inline-block px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">Based in Buffalo, NY</p>
        </div>
      </div>
    </main>
  );
}
